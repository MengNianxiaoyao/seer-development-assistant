import type {
  AnalysisResult,
  BodySegment,
  HeaderField,
  PacketHeader,
  ParamItem,
  ParsedPacket,
  ValidationError,
} from '@/types'
import { ref } from 'vue'
import {
  cleanHex,
  decimalToHex,
  findDifferences,
  getReceivePackets,
  makeBodySegment,
  makeHeaderField,
  makeParamItem,
} from '@/utils'
import {
  HEADER_SPECS,
  SPECIAL_COMMAND_ID,
  HEADER_LENGTH,
} from '@/constants'

export function useHexParser() {
  const result = ref<AnalysisResult | null>(null)
  const isAnalyzed = ref(false)

  function parseHeader(hex: string): { header: PacketHeader, offset: number } {
    let offset = 0
    const fields: HeaderField[] = []

    for (const field of HEADER_SPECS) {
      const chunk = hex
        .substring(offset, offset + field.length)
        .padEnd(field.length, '0')
      fields.push(makeHeaderField(field.name, chunk))
      offset += field.length
    }

    const bodyLength = Math.max(0, hex.length - HEADER_LENGTH)
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

  function splitIntoSegments(
    bodyHex: string,
    chunkSize: number,
  ): BodySegment[] {
    const segments: BodySegment[] = []
    for (
      let i = 0, idx = 1;
      i + chunkSize <= bodyHex.length;
      i += chunkSize, idx++
    ) {
      const chunk = bodyHex.substring(i, i + chunkSize).padEnd(chunkSize, '0')
      segments.push(makeBodySegment(idx, chunk))
    }
    return segments
  }

  function parseParams(
    bodyHex: string,
    commandIdDec: number,
    isSendPacket: boolean,
  ): ParamItem[] {
    const seg1 = splitIntoSegments(bodyHex, 2)
    const seg4 = splitIntoSegments(bodyHex, 8)

    if (commandIdDec === SPECIAL_COMMAND_ID && !isSendPacket) {
      const params: ParamItem[] = []
      const firstParam = seg4[0]
      if (firstParam) {
        params.push(makeParamItem(1, firstParam.hex))
      }
      for (let i = 4; i < seg1.length; i++) {
        params.push(makeParamItem(params.length + 1, seg1[i].hex))
      }
      return params
    }

    return seg4.map((s, idx) => makeParamItem(idx + 1, s.hex))
  }

  function parseSinglePacket(
    id: number,
    rawHex: string,
    label: string,
  ): ParsedPacket {
    const hex = cleanHex(rawHex)
    const { header } = parseHeader(hex)
    const commandIdDec = header.commandId.decimal
    const bodyHex = hex.substring(HEADER_LENGTH)
    const isSendPacket = label === '发包'

    const seg1 = splitIntoSegments(bodyHex, 2)
    const seg2 = splitIntoSegments(bodyHex, 4)
    const seg4 = splitIntoSegments(bodyHex, 8)
    const params = parseParams(bodyHex, commandIdDec, isSendPacket)

    const paramCountField = makeHeaderField(
      '参数数量',
      decimalToHex(params.length, 8),
    )

    return {
      id,
      label,
      raw: hex,
      header: { ...header, paramCount: paramCountField },
      params,
      isGrouped: params.length > 1,
      groupSize: 4,
      bodySegments1: seg1,
      bodySegments2: seg2,
      bodySegments4: seg4,
    }
  }

  function validate(
    inputs: { raw: string, enabled: boolean, label: string, order?: number }[],
  ): ValidationError[] {
    const dataInputs = inputs.filter(i => i.enabled && i.raw.trim())
    if (dataInputs.length < 1)
      return []

    const cleanedInputs = dataInputs.map(i => ({
      ...i,
      raw: cleanHex(i.raw),
    }))

    const receivePackets = cleanedInputs
      .filter(i => i.label !== '发包')
      .sort((a, b) => (a.order || 0) - (b.order || 0))

    const sendPacket = cleanedInputs.find(i => i.label === '发包')

    let baselineInput: (typeof cleanedInputs)[0] | undefined

    if (receivePackets.length > 0) {
      baselineInput = receivePackets[0]
    }
    else if (sendPacket) {
      baselineInput = sendPacket
    }

    if (!baselineInput || cleanHex(baselineInput.raw).length < 34) {
      return []
    }

    const baseline = parseSinglePacket(
      0,
      baselineInput.raw,
      baselineInput.label,
    )
    const errors: ValidationError[] = []

    for (const input of cleanedInputs.filter(i => i !== baselineInput)) {
      const hex = cleanHex(input.raw)
      if (hex.length < 34)
        continue

      const current = parseSinglePacket(0, input.raw, input.label)
      const reasons: string[] = []

      if (current.header.commandId.hex !== baseline.header.commandId.hex) {
        reasons.push(
          `命令号不一致：${current.header.commandId.decimal} ≠ ${baseline.header.commandId.decimal}`,
        )
      }

      if (reasons.length > 0) {
        errors.push({ label: input.label, reasons })
      }
    }

    return errors
  }

  function analyze(
    inputs: { raw: string, enabled: boolean, label: string }[],
  ): AnalysisResult {
    const enabledInputs = inputs.filter(i => i.enabled && i.raw.trim())
    const packets = enabledInputs.map((input, idx) =>
      parseSinglePacket(idx + 1, input.raw, input.label),
    )

    const receivePackets = getReceivePackets(packets)
    const diffs
      = receivePackets.length >= 2 ? findDifferences(receivePackets) : []
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

  return { result, isAnalyzed, validate, analyze, reset, parseSinglePacket }
}
