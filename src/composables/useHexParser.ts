import { ref } from 'vue'
import { hexToDecimal, hexToBinary, cleanHex, makeHeaderField, findDifferences } from '@/utils/hex'
import type {
  PacketHeader,
  HeaderField,
  ParamItem,
  ParsedPacket,
  AnalysisResult,
  ValidationError,
} from '@/types'

export function useHexParser() {
  const result = ref<AnalysisResult | null>(null)
  const isAnalyzed = ref(false)

  const HEADER_LAYOUT = [
    { name: '封包长度', length: 8 },
    { name: '版本号', length: 2 },
    { name: '命令号', length: 8 },
    { name: '米米号', length: 8 },
    { name: '序列号', length: 8 },
    { name: '参数数量', length: 8 },
  ] as const

  const SPECIAL_COMMAND_ID = 42023

  function parseHeader(hex: string): { header: PacketHeader; offset: number } {
    let offset = 0
    const fields: HeaderField[] = []

    for (const field of HEADER_LAYOUT) {
      const chunk = hex.substring(offset, offset + field.length).padEnd(field.length, '0')
      fields.push(makeHeaderField(field.name, chunk))
      offset += field.length
    }

    return {
      header: {
        packetLength: fields[0],
        version: fields[1],
        commandId: fields[2],
        mimiId: fields[3],
        sequence: fields[4],
        paramCount: fields[5],
      },
      offset,
    }
  }

  function parseParams(hex: string, offset: number, paramCount: number, commandIdDec: number): ParamItem[] {
    const remaining = hex.substring(offset)

    if (paramCount <= 1) {
      if (!remaining) return []
      return [{
        index: 1,
        hex: remaining,
        decimal: hexToDecimal(remaining),
        binary: hexToBinary(remaining),
      }]
    }

    const groupSize = commandIdDec === SPECIAL_COMMAND_ID ? 2 : 8
    const params: ParamItem[] = []
    let pos = 0
    let idx = 1

    while (pos < remaining.length) {
      const chunk = remaining.substring(pos, pos + groupSize).padEnd(groupSize, '0')
      params.push({
        index: idx,
        hex: chunk,
        decimal: hexToDecimal(chunk),
        binary: hexToBinary(chunk),
      })
      pos += groupSize
      idx++
    }

    return params
  }

  function parseSinglePacket(id: number, rawHex: string, label: string): ParsedPacket {
    const hex = cleanHex(rawHex)
    const { header, offset } = parseHeader(hex)
    const paramCountDec = header.paramCount.decimal
    const commandIdDec = header.commandId.decimal
    const isGrouped = paramCountDec > 1
    const groupSize = commandIdDec === SPECIAL_COMMAND_ID ? 2 : 8
    const params = parseParams(hex, offset, paramCountDec, commandIdDec)

    return { id, label, raw: hex, header, params, isGrouped, groupSize }
  }

  function validate(inputs: { raw: string; enabled: boolean; label: string }[]): ValidationError[] {
    const dataInputs = inputs.filter(i => i.enabled && i.raw.trim())
    if (dataInputs.length < 2) return []

    const HEADER_LENGTH = 42
    
    // 如果有发包，使用发包作为基准；否则使用第一个输入作为基准
    const sendPacketIndex = dataInputs.findIndex(i => i.label === '发包')
    const baselineInput = sendPacketIndex >= 0 ? dataInputs[sendPacketIndex] : dataInputs[0]
    const baseline = parseSinglePacket(0, baselineInput.raw, baselineInput.label)
    const errors: ValidationError[] = []

    // 需要校验的输入（排除基准）
    const inputsToValidate = dataInputs.filter(i => i !== baselineInput)

    for (const input of inputsToValidate) {
      const current = parseSinglePacket(0, input.raw, input.label)
      const reasons: string[] = []

      const rawLen = current.raw.length
      if (rawLen < HEADER_LENGTH) {
        reasons.push(`封包格式异常：长度不足（${rawLen} < ${HEADER_LENGTH}）`)
      }

      if (current.header.packetLength.hex !== baseline.header.packetLength.hex) {
        reasons.push(`封包长度不一致：${current.header.packetLength.decimal} ≠ ${baseline.header.packetLength.decimal}`)
      }

      if (current.header.commandId.hex !== baseline.header.commandId.hex) {
        reasons.push(`命令号不一致：${current.header.commandId.decimal} ≠ ${baseline.header.commandId.decimal}`)
      }

      if (current.header.paramCount.hex !== baseline.header.paramCount.hex) {
        reasons.push(`参数数量不一致：${current.header.paramCount.decimal} ≠ ${baseline.header.paramCount.decimal}`)
      }

      const declaredCount = current.header.paramCount.decimal
      const actualCount = current.params.length
      if (declaredCount > 1 && actualCount !== declaredCount) {
        reasons.push(`实际参数数量与声明不一致：解析到 ${actualCount} 个，声明 ${declaredCount} 个`)
      }

      if (current.params.length !== baseline.params.length) {
        reasons.push(`解析参数数量不一致：${current.params.length} ≠ ${baseline.params.length}`)
      }

      if (reasons.length > 0) {
        errors.push({ label: input.label, reasons })
      }
    }

    // 检查基准本身的参数数量一致性
    const baselineDeclaredCount = baseline.header.paramCount.decimal
    const baselineActualCount = baseline.params.length
    if (baselineDeclaredCount > 1 && baselineActualCount !== baselineDeclaredCount) {
      errors.unshift({
        label: baselineInput.label,
        reasons: [`实际参数数量与声明不一致：解析到 ${baselineActualCount} 个，声明 ${baselineDeclaredCount} 个`],
      })
    }

    return errors
  }

  function analyze(inputs: { raw: string; enabled: boolean; label: string }[]): AnalysisResult {
    const enabledInputs = inputs.filter(i => i.enabled && i.raw.trim())
    const packets = enabledInputs.map((input, idx) => parseSinglePacket(idx + 1, input.raw, input.label))
    
    // 只对收包进行差异比较，发包不参与
    const receivePackets = packets.filter(p => p.label !== '发包')
    const diffs = receivePackets.length >= 2 ? findDifferences(receivePackets) : []
    const totalParams = packets.reduce((sum, p) => sum + p.params.length, 0)

    const res: AnalysisResult = {
      packets,
      diffs,
      diffCount: diffs.length,
      totalParams,
      validPackets: packets.length,
    }

    result.value = res
    isAnalyzed.value = true
    return res
  }

  function reset() {
    result.value = null
    isAnalyzed.value = false
  }

  return { result, isAnalyzed, validate, analyze, reset }
}
