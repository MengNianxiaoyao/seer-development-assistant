import type { Ref } from 'vue'
import type { AnalysisResult } from '@/types'
import { computed } from 'vue'
import {
  createDiffIndexSet,
  separatePackets,
} from '@/utils'

export function usePacketData(result: Ref<AnalysisResult | null>) {
  const separated = computed(() => {
    const data = result.value
    if (!data)
      return { receivePackets: [], sendPacket: undefined }
    return separatePackets(data.packets)
  })

  const receivePackets = computed(() => separated.value.receivePackets)

  const sendPacket = computed(() => separated.value.sendPacket)

  const sendPacketParams = computed(() => {
    const packet = sendPacket.value
    return packet ? packet.params : []
  })

  const diffIndexSet = computed(() => {
    const diffs = result.value?.diffs
    if (!diffs?.length)
      return new Set<number>()
    return createDiffIndexSet(diffs)
  })

  const diffPackets = computed(() =>
    receivePackets.value.filter(packet =>
      packet.params.some(param => diffIndexSet.value.has(param.index)),
    ),
  )

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
