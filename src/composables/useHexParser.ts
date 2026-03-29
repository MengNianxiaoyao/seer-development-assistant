import { ref } from 'vue'
import { hexToDecimal, hexToBinary, cleanHex, makeHeaderField, findDifferences, decimalToHex } from '@/utils/hex'
import type {
  PacketHeader,
  HeaderField,
  ParamItem,
  ParsedPacket,
  AnalysisResult,
  ValidationError,
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

const HEADER_FIXED_PART = 17 // 封包头固定部分字节数

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

    const packetLength = fields[0]
    const paramCountFromLength = Math.max(0, (packetLength.decimal - HEADER_FIXED_PART) / 4)
    const paramCountHex = decimalToHex(Math.floor(paramCountFromLength), 8)
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

  function splitBodySegments(bodyHex: string) {
    const clean = bodyHex
    // 1-byte segments: 2 hex chars
    const seg1: { index: number; hex: string; decimal: number; binary: string }[] = []
    for (let i = 0, idx = 1; i + 2 <= clean.length; i += 2, idx++) {
      const chunk = clean.substring(i, i + 2).padEnd(2, '0')
      seg1.push({ index: idx, hex: chunk, decimal: hexToDecimal(chunk), binary: hexToBinary(chunk) })
    }
    // 2-byte segments: 4 hex chars
    const seg2: { index: number; hex: string; decimal: number; binary: string }[] = []
    for (let i = 0, idx = 1; i + 4 <= clean.length; i += 4, idx++) {
      const chunk = clean.substring(i, i + 4).padEnd(4, '0')
      seg2.push({ index: idx, hex: chunk, decimal: hexToDecimal(chunk), binary: hexToBinary(chunk) })
    }
    // 4-byte segments: 8 hex chars
    const seg4: { index: number; hex: string; decimal: number; binary: string }[] = []
    for (let i = 0, idx = 1; i + 8 <= clean.length; i += 8, idx++) {
      const chunk = clean.substring(i, i + 8).padEnd(8, '0')
      seg4.push({ index: idx, hex: chunk, decimal: hexToDecimal(chunk), binary: hexToBinary(chunk) })
    }
    return { seg1, seg2, seg4 }
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
      // 后续用1字节
      for (let i = 0; i < seg1.length; i++) {
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

    return {
      id,
      label,
      raw: hex,
      header,
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
