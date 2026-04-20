import type { Ref } from 'vue'
import type { AnalysisResult } from '@/types'
import { computed } from 'vue'
import {
  createDiffIndexSet,
  separatePackets,
} from '@/utils'

/**
 * 数据包数据处理 composable
 * 从分析结果中提取和分类数据包信息
 * @param result - 分析结果引用
 * @returns 数据包相关的数据和方法
 */
export function usePacketData(result: Ref<AnalysisResult | null>) {
  /** 分离后的数据包（接收包和发送包） */
  const separated = computed(() => {
    const data = result.value
    if (!data)
      return { receivePackets: [], sendPacket: undefined }
    return separatePackets(data.packets)
  })

  /** 接收包列表 */
  const receivePackets = computed(() => separated.value.receivePackets)

  /** 发送包（如果有） */
  const sendPacket = computed(() => separated.value.sendPacket)

  /** 发送包参数列表 */
  const sendPacketParams = computed(() => {
    const packet = sendPacket.value
    return packet ? packet.params : []
  })

  /** 差异参数索引集合 */
  const diffIndexSet = computed(() => {
    const diffs = result.value?.diffs
    if (!diffs?.length)
      return new Set<number>()
    return createDiffIndexSet(diffs)
  })

  /** 包含差异参数的接收包列表 */
  const diffPackets = computed(() =>
    receivePackets.value.filter(packet =>
      packet.params.some(param => diffIndexSet.value.has(param.index)),
    ),
  )

  /** 是否存在差异参数 */
  const hasDiffParams = computed(() => diffPackets.value.length > 0)

  return {
    receivePackets,
    sendPacket,
    sendPacketParams,
    diffIndexSet,
    diffPackets,
    hasDiffParams,
  }
}
