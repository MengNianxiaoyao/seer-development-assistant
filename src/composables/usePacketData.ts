import { computed, type Ref } from "vue";
import type { AnalysisResult } from "@/types";
import {
  getReceivePackets,
  getSendPacket,
  createDiffIndexSet,
} from "@/utils/hex";

export function usePacketData(result: Ref<AnalysisResult | null>) {
  const receivePackets = computed(() => {
    if (!result.value) return [];
    return getReceivePackets(result.value.packets);
  });

  const sendPacket = computed(() => {
    if (!result.value) return undefined;
    return getSendPacket(result.value.packets);
  });

  const sendPacketParams = computed(() => {
    return sendPacket.value?.params ?? [];
  });

  const diffIndexSet = computed(() => {
    if (!result.value?.diffs.length) return new Set<number>();
    return createDiffIndexSet(result.value.diffs);
  });

  const diffPackets = computed(() => {
    return receivePackets.value.filter((p) =>
      p.params.some((param) => diffIndexSet.value.has(param.index)),
    );
  });

  const hasDiffParams = computed(() => diffPackets.value.length > 0);

  return {
    receivePackets,
    sendPacket,
    sendPacketParams,
    diffIndexSet,
    diffPackets,
    hasDiffParams,
  };
}
