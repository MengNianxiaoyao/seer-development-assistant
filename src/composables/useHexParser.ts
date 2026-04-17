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
  HEADER_LENGTH,
  HEADER_SPECS,
  SEND_PACKET_LABEL,
  SPECIAL_COMMAND_ID,
} from '@/constants'
import {
  createBodySegment,
  createHeaderField,
  createParamItem,
  decimalToHex,
  findDifferences,
  parseRawToHex,
} from '@/utils'

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
      fields.push(createHeaderField(field.name, chunk))
      offset += field.length
    }

    const bodyLength = Math.max(0, hex.length - HEADER_LENGTH)
    const paramCountFromLength = Math.floor(bodyLength / 8)
    const paramCountHex = decimalToHex(paramCountFromLength, 8)
    const paramCountField = createHeaderField('参数数量', paramCountHex)

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
      segments.push(createBodySegment(idx, chunk))
    }
    return segments
  }

  function parseParams(
    commandIdDec: number,
    isSendPacket: boolean,
    bodyHex: string,
  ): ParamItem[] {
    if (commandIdDec === SPECIAL_COMMAND_ID && !isSendPacket) {
      const seg1 = splitIntoSegments(bodyHex, 2)
      const seg4 = splitIntoSegments(bodyHex, 8)
      const params: ParamItem[] = []
      const firstParam = seg4[0]
      if (firstParam) {
        params.push(createParamItem(1, firstParam.hex))
      }
      for (let i = 4; i < seg1.length; i++) {
        params.push(createParamItem(params.length + 1, seg1[i].hex))
      }
      return params
    }

    const seg4 = splitIntoSegments(bodyHex, 8)
    return seg4.map((s, idx) => createParamItem(idx + 1, s.hex))
  }

  function parseSinglePacket(
    id: number,
    rawHex: string,
    label: string,
  ): ParsedPacket {
    const hex = parseRawToHex(rawHex, HEADER_LENGTH)

    const { header } = parseHeader(hex)
    const commandIdDec = header.commandId.decimal
    const bodyHex = hex.substring(HEADER_LENGTH)
    const isSendPacket = label === SEND_PACKET_LABEL
    const packetType = isSendPacket ? 'send' : 'receive'

    const params = parseParams(commandIdDec, isSendPacket, bodyHex)

    const seg1 = splitIntoSegments(bodyHex, 2)
    const seg2 = splitIntoSegments(bodyHex, 4)
    const seg4 = splitIntoSegments(bodyHex, 8)

    const paramCountField = createHeaderField(
      '参数数量',
      decimalToHex(params.length, 8),
    )

    return {
      id,
      label,
      type: packetType,
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
    const dataInputs = inputs.filter(input => input.enabled && input.raw.trim())
    if (dataInputs.length < 1)
      return []

    const receiveInputs: typeof dataInputs = []
    let sendInput: typeof dataInputs[0] | undefined

    for (const input of dataInputs) {
      if (input.label === SEND_PACKET_LABEL) {
        sendInput = input
      }
      else {
        receiveInputs.push(input)
      }
    }

    receiveInputs.sort((a, b) => (a.order || 0) - (b.order || 0))

    const baselineInput = receiveInputs.length > 0 ? receiveInputs[0] : sendInput

    if (!baselineInput)
      return []

    const baselineHex = parseRawToHex(baselineInput.raw, HEADER_LENGTH)
    if (baselineHex.length < 34)
      return []

    const baseline = parseSinglePacket(
      0,
      baselineInput.raw,
      baselineInput.label,
    )
    const errors: ValidationError[] = []

    for (let i = 0; i < dataInputs.length; i++) {
      const input = dataInputs[i]
      if (input === baselineInput)
        continue

      const hex = parseRawToHex(input.raw, HEADER_LENGTH)
      if (hex.length < 34)
        continue

      const current = parseSinglePacket(0, input.raw, input.label)

      if (current.header.commandId.hex !== baseline.header.commandId.hex) {
        errors.push({
          label: input.label,
          reasons: [`命令号不一致：${current.header.commandId.decimal} ≠ ${baseline.header.commandId.decimal}`],
        })
      }
    }

    return errors
  }

  function analyze(
    inputs: { raw: string, enabled: boolean, label: string }[],
  ): AnalysisResult {
    const enabledInputs = inputs.filter(input => input.enabled && input.raw.trim())
    const packets: ParsedPacket[] = []
    const receivePackets: ParsedPacket[] = []
    let totalParams = 0

    for (let i = 0; i < enabledInputs.length; i++) {
      const input = enabledInputs[i]
      const packet = parseSinglePacket(i + 1, input.raw, input.label)
      packets.push(packet)
      totalParams += packet.params.length
      if (packet.type === 'receive') {
        receivePackets.push(packet)
      }
    }

    const diffs = receivePackets.length >= 2 ? findDifferences(receivePackets) : []

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
