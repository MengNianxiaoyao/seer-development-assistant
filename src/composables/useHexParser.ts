import { ref } from 'vue'
import type {
  PacketHeader,
  HeaderField,
  ParamItem,
  ParsedPacket,
  AnalysisResult,
  DiffResult,
  BinaryGroupSize,
  ValidationError,
} from '@/types'

function hexToBinary(hex: string): string {
  return hex.split('').map(c => parseInt(c, 16).toString(2).padStart(4, '0')).join('')
}

function hexToDecimal(hex: string): number {
  return parseInt(hex, 16)
}

function cleanHex(raw: string): string {
  return raw.replace(/[^0-9a-fA-F]/g, '').toUpperCase()
}

function makeHeaderField(name: string, hex: string): HeaderField {
  const decimal = hexToDecimal(hex)
  const binary = hexToBinary(hex)
  return { name, hex, decimal, binary }
}

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

    return {
      id,
      label,
      raw: hex,
      header,
      params,
      isGrouped,
      groupSize,
    }
  }

  function findDifferences(packets: ParsedPacket[]): DiffResult[] {
    if (packets.length < 2) return []

    const maxLen = Math.max(...packets.map(p => p.params.length))
    const diffs: DiffResult[] = []

    for (let i = 0; i < maxLen; i++) {
      const values = packets.map(p => p.params[i]?.hex ?? '')
      const first = values[0]
      if (values.some(v => v !== first)) {
        const ref = packets[0].params[i]
        if (ref) {
          diffs.push({ index: i + 1, hex: ref.hex, decimal: ref.decimal, binary: ref.binary })
        }
      }
    }

    return diffs
  }

  function validate(inputs: { raw: string; enabled: boolean; label: string }[]): ValidationError[] {
    const dataInputs = inputs.filter(i => i.enabled && i.raw.trim())
    if (dataInputs.length < 2) return []

    const HEADER_LENGTH = 42

    const baseline = parseSinglePacket(0, dataInputs[0].raw, dataInputs[0].label)
    const errors: ValidationError[] = []

    for (let i = 1; i < dataInputs.length; i++) {
      const current = parseSinglePacket(0, dataInputs[i].raw, dataInputs[i].label)
      const reasons: string[] = []

      // Format check: length must be at least header length
      const rawLen = current.raw.length
      if (rawLen < HEADER_LENGTH) {
        reasons.push(`封包格式异常：长度不足（${rawLen} < ${HEADER_LENGTH}）`)
      }

      // Packet length check
      if (current.header.packetLength.hex !== baseline.header.packetLength.hex) {
        reasons.push(`封包长度不一致：${current.header.packetLength.decimal} ≠ ${baseline.header.packetLength.decimal}`)
      }

      // Command ID check
      if (current.header.commandId.hex !== baseline.header.commandId.hex) {
        reasons.push(`命令号不一致：${current.header.commandId.decimal} ≠ ${baseline.header.commandId.decimal}`)
      }

      // Parameter count check
      if (current.header.paramCount.hex !== baseline.header.paramCount.hex) {
        reasons.push(`参数数量不一致：${current.header.paramCount.decimal} ≠ ${baseline.header.paramCount.decimal}`)
      }

      if (reasons.length > 0) {
        errors.push({ label: dataInputs[i].label, reasons })
      }
    }

    return errors
  }

  function analyze(inputs: { raw: string; enabled: boolean; label: string }[]): AnalysisResult {
    const enabledInputs = inputs.filter(i => i.enabled && i.raw.trim())
    const packets = enabledInputs.map((input, idx) =>
      parseSinglePacket(idx + 1, input.raw, input.label),
    )
    const diffs = findDifferences(packets)
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

  function splitByGroupSize(hex: string, size: BinaryGroupSize): { index: number; hex: string; binary: string }[] {
    const clean = cleanHex(hex)
    const groups: { index: number; hex: string; binary: string }[] = []
    let pos = 0
    let idx = 1

    while (pos < clean.length) {
      const chunk = clean.substring(pos, pos + size)
      groups.push({
        index: idx,
        hex: chunk,
        binary: hexToBinary(chunk),
      })
      pos += size
      idx++
    }

    return groups
  }

  function reset() {
    result.value = null
    isAnalyzed.value = false
  }

  return {
    result,
    isAnalyzed,
    validate,
    analyze,
    splitByGroupSize,
    reset,
  }
}
