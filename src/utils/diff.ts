import type { DiffResult, ParsedPacket } from '@/types'

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

export function createDiffIndexSet(diffs: DiffResult[]): Set<number> {
  return new Set(diffs.map(d => d.index))
}

export function diffIndexSetFromPackets(packets: ParsedPacket[]): Set<number> {
  if (packets.length < 2)
    return new Set()
  const diffs = findDifferences(packets)
  return createDiffIndexSet(diffs)
}
