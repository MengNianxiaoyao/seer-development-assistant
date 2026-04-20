import type {
  BodySegment,
  HeaderField,
  HexByteSize,
  ParamItem,
} from '@/types'
import { SPECIAL_COMMAND_ID } from '@/constants'

const HEX_TO_BINARY_MAP: Record<string, string> = {
  0: '0000',
  1: '0001',
  2: '0010',
  3: '0011',
  4: '0100',
  5: '0101',
  6: '0110',
  7: '0111',
  8: '1000',
  9: '1001',
  A: '1010',
  B: '1011',
  C: '1100',
  D: '1101',
  E: '1110',
  F: '1111',
}

export function hexToBinary(hex: string): string {
  let result = ''
  for (let i = 0; i < hex.length; i++) {
    result += HEX_TO_BINARY_MAP[hex[i]] || '0000'
  }
  return result
}

export function hexToDecimal(hex: string): number {
  return Number.parseInt(hex, 16)
}

export function decimalToHex(num: number, length: number): string {
  return num.toString(16).toUpperCase().padStart(length, '0')
}

export function cleanHex(raw: string): string {
  return raw.replace(/[^0-9a-f]/gi, '').toUpperCase()
}

export function parseSpecialFormat(raw: string): { commandId: string, params: string } | null {
  const match = raw.match(/^(\d+)[,\s]+0x([0-9a-fA-F]+)$/)
  if (match) {
    const commandId = Number.parseInt(match[1], 10)
    return {
      commandId: decimalToHex(commandId, 8),
      params: match[2].toUpperCase().padStart(8, '0'),
    }
  }
  return null
}

export function parseRawToHex(raw: string, headerLength: number): string {
  const specialParsed = parseSpecialFormat(raw)
  if (specialParsed) {
    const paramsHex = specialParsed.params
    const packetLength = headerLength + paramsHex.length
    return `${decimalToHex(packetLength, 8)}00${specialParsed.commandId}0000000000000000${paramsHex}`
  }
  return cleanHex(raw)
}

export function createHexValue(hex: string): Omit<ParamItem, 'index'> {
  return {
    hex,
    decimal: hexToDecimal(hex),
    binary: hexToBinary(hex),
  }
}

export function createHeaderField(name: string, hex: string): HeaderField {
  return {
    name,
    ...createHexValue(hex),
  }
}

export function createBodySegment(index: number, hex: string): BodySegment {
  return {
    index,
    ...createHexValue(hex),
  }
}

export function createParamItem(index: number, hex: string): ParamItem {
  return {
    index,
    ...createHexValue(hex),
  }
}

const MAX_DIGITS: Record<number, number> = { 1: 2, 2: 3, 4: 5 }

export function formatValue(hex: string, hexByteSize: HexByteSize, commandId?: number): string {
  if (commandId === SPECIAL_COMMAND_ID)
    return hex

  const maxDigits = MAX_DIGITS[hexByteSize] ?? 0
  const parts: string[] = []
  for (let i = 0; i < hex.length; i += hexByteSize) {
    const num = Number.parseInt(hex.slice(i, i + hexByteSize), 16)
    parts.push(maxDigits ? num.toString().padEnd(maxDigits, '\u00A0') : String(num))
  }
  return parts.join('\u00A0')
}

export function getHighlightClass(
  packetIdx: number,
  paramIdx: number,
  diffIndexSet: Set<number>,
): string {
  if (!diffIndexSet.has(paramIdx))
    return 'bg-green-100 text-green-700'
  return packetIdx % 2 === 0
    ? 'bg-red-100 text-red-600'
    : 'bg-blue-100 text-blue-600'
}

export function getPlaceholder(hexByteSize: HexByteSize): string {
  const maxDigits = MAX_DIGITS[hexByteSize] ?? 0
  if (maxDigits === 0) {
    return '--'
  }
  const partCount = 8 / hexByteSize
  const placeholder = maxDigits > 0 ? '--'.padEnd(maxDigits, '\u00A0') : '--'
  return Array.from({ length: partCount }, () => placeholder).join('\u00A0')
}
