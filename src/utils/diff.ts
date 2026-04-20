import type { DiffResult, ParsedPacket } from '@/types'

export function findDifferences(packets: ParsedPacket[]): DiffResult[] {
  if (packets.length < 2)
    return []

  const maxLen = Math.max(...packets.map(p => p.params.length))
  if (maxLen === 0)
    return []

  const diffs: DiffResult[] = []

  for (let i = 0; i < maxLen; i++) {
    const values = packets.map(p => p.params[i]?.hex)
    const definedValues = values.filter(Boolean) as string[]

    if (definedValues.length === 0)
      continue

    const firstValue = definedValues[0]
    const allMatch = definedValues.every(v => v === firstValue)
    const allExist = definedValues.length === packets.length

    if (!allMatch || !allExist) {
      const refPacket = packets.find(p => p.params[i])
      if (refPacket) {
        const refParam = refPacket.params[i]
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

export function createDiffIndexSet(diffs: DiffResult[]): Set<number> {
  return new Set(diffs.map(d => d.index))
}

export function diffIndexSetFromPackets(packets: ParsedPacket[]): Set<number> {
  if (packets.length < 2)
    return new Set()
  const diffs = findDifferences(packets)
  return createDiffIndexSet(diffs)
}
