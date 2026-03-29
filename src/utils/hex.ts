import type {
  BodySegment,
  DiffResult,
  DisplayFormat,
  HeaderField,
  ParamItem,
  ParsedPacket,
} from '@/types'

export function hexToBinary(hex: string): string {
  return hex
    .split('')
    .map(c => Number.parseInt(c, 16).toString(2).padStart(4, '0'))
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

export function makeHexValue(hex: string): Omit<ParamItem, 'index'> {
  return {
    hex,
    decimal: hexToDecimal(hex),
    binary: hexToBinary(hex),
  }
}

export function makeHeaderField(name: string, hex: string): HeaderField {
  return {
    name,
    ...makeHexValue(hex),
  }
}

export function makeBodySegment(index: number, hex: string): BodySegment {
  return {
    index,
    ...makeHexValue(hex),
  }
}

export function makeParamItem(index: number, hex: string): ParamItem {
  return {
    index,
    ...makeHexValue(hex),
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

export function findDifferences(packets: ParsedPacket[]): DiffResult[] {
  if (packets.length < 2)
    return []

  let maxLen = 0
  for (let i = 0; i < packets.length; i++) {
    const len = packets[i].params.length
    if (len > maxLen)
      maxLen = len
  }

  const diffs: DiffResult[] = []

  for (let i = 0; i < maxLen; i++) {
    let hasAny = false
    let allExist = true
    let firstValue: string | undefined
    let valuesMatch = true

    for (let j = 0; j < packets.length; j++) {
      const param = packets[j].params[i]
      if (param) {
        hasAny = true
        if (firstValue === undefined)
          firstValue = param.hex
        else if (param.hex !== firstValue)
          valuesMatch = false
      }
      else {
        allExist = false
      }
    }

    if (!hasAny)
      continue

    if (!allExist || !valuesMatch) {
      const refParam = packets.find(p => p.params[i])?.params[i]
      if (refParam) {
        diffs.push({
          index: i + 1,
          hex: refParam.hex,
          decimal: refParam.decimal,
          binary: refParam.binary,
        })
      }
    }
  }

  return diffs
}

export function getReceivePackets(packets: ParsedPacket[]): ParsedPacket[] {
  return packets.filter(p => p.label !== '发包')
}

export function getSendPacket(
  packets: ParsedPacket[],
): ParsedPacket | undefined {
  return packets.find(p => p.label === '发包')
}

export function createDiffIndexSet(diffs: DiffResult[]): Set<number> {
  return new Set(diffs.map(d => d.index))
}

export function diffIndexSetFromPackets(packets: ParsedPacket[]): Set<number> {
  if (packets.length < 2)
    return new Set()
  const diffs = findDifferences(packets)
  return createDiffIndexSet(diffs)
}

export function formatParamCount(packets: ParsedPacket[]): string {
  if (!packets.length)
    return '0'
  const counts = packets.map(p => p.params.length)
  const min = Math.min(...counts)
  const max = Math.max(...counts)
  if (min === max)
    return String(min)
  return `${min}-${max}`
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  }
  catch {
    return false
  }
}

export function downloadJson(data: unknown, filename?: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename || `seer-analysis-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}
