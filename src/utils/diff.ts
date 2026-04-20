import type { DiffResult, ParsedPacket } from '@/types'

/**
 * 查找多个数据包之间的参数差异
 * 比较相同位置参数的值，找出不一致或缺失的参数
 * @param packets - 数据包数组（至少需要2个数据包才能比较）
 * @returns 差异结果数组
 */
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

/**
 * 从差异数组创建索引集合
 * 用于快速判断某个索引位置是否为差异点
 * @param diffs - 差异结果数组
 * @returns 差异索引的 Set 集合
 */
export function createDiffIndexSet(diffs: DiffResult[]): Set<number> {
  return new Set(diffs.map(d => d.index))
}

/**
 * 从数据包数组直接创建差异索引集合
 * @param packets - 数据包数组
 * @returns 差异索引的 Set 集合
 */
export function diffIndexSetFromPackets(packets: ParsedPacket[]): Set<number> {
  if (packets.length < 2)
    return new Set()
  const diffs = findDifferences(packets)
  return createDiffIndexSet(diffs)
}
