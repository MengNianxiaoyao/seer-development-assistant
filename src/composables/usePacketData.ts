import { computed, type Ref } from 'vue'
import type { AnalysisResult, ParsedPacket } from '@/types'

/**
 * 从分析结果中提取差异参数索引集合
 */
export function useDiffIndexSet(result: Ref<AnalysisResult | null>) {
  return computed(() => {
    if (!result.value?.diffs.length) return new Set<number>()
    return new Set(result.value.diffs.map(d => d.index))
  })
}

/**
 * 从分析结果中提取收包数据（排除发包）
 */
export function useReceivePackets(result: Ref<AnalysisResult | null>) {
  return computed((): ParsedPacket[] => {
    if (!result.value) return []
    return result.value.packets.filter(p => p.label !== '发包')
  })
}

/**
 * 从分析结果中提取发包参数
 */
export function useSendPacketParams(result: Ref<AnalysisResult | null>) {
  return computed(() => {
    if (!result.value) return []
    const sendPacket = result.value.packets.find(p => p.label === '发包')
    return sendPacket?.params ?? []
  })
}
