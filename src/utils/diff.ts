import type { DiffResult, ParsedPacket } from '@/types'

export function findDifferences(packets: ParsedPacket[]): DiffResult[] {
  const packetCount = packets.length
  if (packetCount < 2)
    return []

  let maxLen = 0
  for (let i = 0; i < packetCount; i++) {
    const len = packets[i].params.length
    if (len > maxLen)
      maxLen = len
  }

  if (maxLen === 0)
    return []

  const diffs: DiffResult[] = []

  for (let i = 0; i < maxLen; i++) {
    let hasAny = false
    let allExist = true
    let firstValue: string | undefined
    let valuesMatch = true
    let refParam: typeof packets[0]['params'][0] | undefined

    for (let j = 0; j < packetCount; j++) {
      const param = packets[j].params[i]
      if (param) {
        if (!hasAny) {
          hasAny = true
          refParam = param
          firstValue = param.hex
        }
        else if (param.hex !== firstValue) {
          valuesMatch = false
        }
      }
      else {
        allExist = false
      }
    }

    if (!hasAny)
      continue

    if (!allExist || !valuesMatch) {
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
  const set = new Set<number>()
  for (let i = 0; i < diffs.length; i++) {
    set.add(diffs[i].index)
  }
  return set
}

export function diffIndexSetFromPackets(packets: ParsedPacket[]): Set<number> {
  if (packets.length < 2)
    return new Set()
  const diffs = findDifferences(packets)
  return createDiffIndexSet(diffs)
}
