import type {
  BodySegment,
  DisplayFormat,
  HeaderField,
  ParamItem,
} from '@/types'

export function hexToBinary(hex: string): string {
  return hex
    .split('')
    .map(char => Number.parseInt(char, 16).toString(2).padStart(4, '0'))
    .join('')
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

export function formatValue(
  hex: string,
  decimal: number,
  binary: string,
  fmt: DisplayFormat,
): string {
  switch (fmt) {
    case 'decimal':
      return String(decimal)
    case 'binary':
      return binary
    default:
      return hex
  }
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
