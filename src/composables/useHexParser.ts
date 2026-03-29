import { ref } from 'vue'
import { hexToDecimal, hexToBinary, cleanHex, makeHeaderField, findDifferences, decimalToHex } from '@/utils/hex'
import type {
  PacketHeader,
  HeaderField,
  ParamItem,
  ParsedPacket,
  AnalysisResult,
  ValidationError,
  BodySegment,
} from '@/types'

/**
 * 封包头结构定义（按图示顺序）
 * - 封包长度: 4字节 (8位十六进制) - 包含整个封包的字节数
 * - 版本号: 1字节 (2位十六进制)
 * - 命令号: 4字节 (8位十六进制)
 * - 米米号: 4字节 (8位十六进制)
 * - 序列号: 4字节 (8位十六进制)
 * 总计: 17字节 = 34位十六进制字符
 * 
 * 注: 参数数量需要从封包长度字段计算得出: paramCount = (packetLength - 17) / 4
 */
const HEADER_SPECS = [
  { name: '封包长度', length: 8 },
  { name: '版本号', length: 2 },
  { name: '命令号', length: 8 },
  { name: '米米号', length: 8 },
  { name: '序列号', length: 8 },
] as const

const SPECIAL_COMMAND_ID = 42023

export function useHexParser() {
  const result = ref<AnalysisResult | null>(null)
  const isAnalyzed = ref(false)

  /**
   * 解析封包头
   * 按 HEADER_SPECS 顺序逐字段解析，返回解析后的头部信息和参数起始偏移量
   * 参数数量从封包长度计算得出
   */
  function parseHeader(hex: string): { header: PacketHeader; offset: number } {
    let offset = 0
    const fields: HeaderField[] = []

    for (const field of HEADER_SPECS) {
      const chunk = hex.substring(offset, offset + field.length).padEnd(field.length, '0')
      fields.push(makeHeaderField(field.name, chunk))
      offset += field.length
    }

    // 参数数量根据封包实际长度计算，如果只有封包头则为0
    const bodyLength = Math.max(0, hex.length - 34)
    const paramCountFromLength = Math.floor(bodyLength / 8)
    const paramCountHex = decimalToHex(paramCountFromLength, 8)
    const paramCountField = makeHeaderField('参数数量', paramCountHex)

    return {
      header: {
        packetLength: fields[0],
        version: fields[1],
        commandId: fields[2],
        mimiId: fields[3],
        sequence: fields[4],
        paramCount: paramCountField,
      },
      offset,
    }
  }

  function splitIntoSegments(bodyHex: string, chunkSize: number): BodySegment[] {
    const segments: BodySegment[] = []
    for (let i = 0, idx = 1; i + chunkSize <= bodyHex.length; i += chunkSize, idx++) {
      const chunk = bodyHex.substring(i, i + chunkSize).padEnd(chunkSize, '0')
      segments.push({ index: idx, hex: chunk, decimal: hexToDecimal(chunk), binary: hexToBinary(chunk) })
    }
    return segments
  }

  function splitBodySegments(bodyHex: string) {
    return {
      seg1: splitIntoSegments(bodyHex, 2),
      seg2: splitIntoSegments(bodyHex, 4),
      seg4: splitIntoSegments(bodyHex, 8),
    }
  }

  function parseSinglePacket(id: number, rawHex: string, label: string): ParsedPacket {
    const hex = cleanHex(rawHex)
    const { header } = parseHeader(hex)
    const commandIdDec = header.commandId.decimal

    // 封包体：header 之后的所有内容
    const bodyHex = hex.substring(34)
    const { seg1, seg2, seg4 } = splitBodySegments(bodyHex)

    // 解析封包体
    // 发包：通用解析，按4字节分段
    // 收包：42023特殊处理（第一个4字节，后续1字节）
    let params: ParamItem[] = []
    const isSendPacket = label === '发包'

    if (commandIdDec === SPECIAL_COMMAND_ID && !isSendPacket) {
      // 42023 收包: 第一个4字节，后续1字节
      const firstParam = seg4[0]
      if (firstParam) {
        params.push({
          index: 1,
          hex: firstParam.hex,
          decimal: firstParam.decimal,
          binary: firstParam.binary,
        })
      }
      // 后续用1字节，跳过第一个4字节参数的4个字节
      for (let i = 4; i < seg1.length; i++) {
        params.push({
          index: params.length + 1,
          hex: seg1[i].hex,
          decimal: seg1[i].decimal,
          binary: seg1[i].binary,
        })
      }
    } else {
      // 发包或非42023：全部按4字节分段
      params = seg4.map((s, idx) => ({
        index: idx + 1,
        hex: s.hex,
        decimal: s.decimal,
        binary: s.binary,
      }))
    }

    // 重新计算参数数量
    const paramCountHex = decimalToHex(params.length, 8)
    const paramCountField = makeHeaderField('参数数量', paramCountHex)

    return {
      id,
      label,
      raw: hex,
      header: {
        ...header,
        paramCount: paramCountField,
      },
      params,
      isGrouped: params.length > 1,
      groupSize: 4,
      bodySegments1: seg1,
      bodySegments2: seg2,
      bodySegments4: seg4,
    }
  }

  function validate(inputs: { raw: string; enabled: boolean; label: string }[]): ValidationError[] {
    // 仅校验封包头的命令号一致性
    const dataInputs = inputs.filter(i => i.enabled && i.raw.trim())
    if (dataInputs.length < 2) return []

    const sendPacketIndex = dataInputs.findIndex(i => i.label === '发包')
    const baselineInput = sendPacketIndex >= 0 ? dataInputs[sendPacketIndex] : dataInputs[0]
    const baseline = parseSinglePacket(0, baselineInput.raw, baselineInput.label)
    const errors: ValidationError[] = []

    const inputsToValidate = dataInputs.filter(i => i !== baselineInput)

    for (const input of inputsToValidate) {
      const current = parseSinglePacket(0, input.raw, input.label)
      const reasons: string[] = []

      if (current.header.commandId.hex !== baseline.header.commandId.hex) {
        reasons.push(`命令号不一致：${current.header.commandId.decimal} ≠ ${baseline.header.commandId.decimal}`)
      }

      if (reasons.length > 0) {
        errors.push({ label: input.label, reasons })
      }
    }

    return errors
  }

  function analyze(inputs: { raw: string; enabled: boolean; label: string }[]): AnalysisResult {
    const enabledInputs = inputs.filter(i => i.enabled && i.raw.trim())
    const packets = enabledInputs.map((input, idx) => parseSinglePacket(idx + 1, input.raw, input.label))
    
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
