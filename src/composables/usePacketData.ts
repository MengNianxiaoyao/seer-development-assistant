import type { Ref } from 'vue'
import type { AnalysisResult, ParsedPacket } from '@/types'
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

  const diffPackets = computed(() => {
    const packets = receivePackets.value
    const indices = diffIndexSet.value
    if (indices.size === 0)
      return []

    const result: ParsedPacket[] = []
    for (let i = 0; i < packets.length; i++) {
      const params = packets[i].params
      for (let j = 0; j < params.length; j++) {
        if (indices.has(params[j].index)) {
          result.push(packets[i])
          break
        }
      }
    }
    return result
  })

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
