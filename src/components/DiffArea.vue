<script setup lang="ts">
import type { AnalysisResult, HexByteSize } from '@/types'
import { computed } from 'vue'
import { usePacketData } from '@/composables/usePacketData'
import { formatValue, getHighlightClass, getPlaceholder } from '@/utils'

const props = defineProps<{
  result: AnalysisResult | null
  hexByteSize: HexByteSize
}>()

const { diffPackets, diffIndexSet, hasDiffParams } = usePacketData(
  computed(() => props.result),
)

const diffIndices = computed(() => {
  return [...diffIndexSet.value].sort((a, b) => a - b)
})

function formatParamValue(
  packet: { params: { index: number, hex: string }[], header: { commandId: { decimal: number } } },
  index: number,
): string {
  const param = packet.params.find(p => p.index === index)
  if (!param)
    return ''
  return formatValue(param.hex, props.hexByteSize, packet.header.commandId.decimal)
}

function hasParam(packet: { params: { index: number, hex: string }[] }, index: number): boolean {
  return packet.params.some(p => p.index === index)
}
</script>

<template>
  <div class="panel h-full flex flex-col">
    <div class="section-title">
      <span class="label-with-icon">
        <svg
          class="w-4 h-4 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        输出区 - 相异参数区
      </span>
    </div>

    <div
      v-if="!result || !hasDiffParams"
      class="h-full flex flex-col items-center justify-center text-gray-400"
    >
      <svg
        class="w-10 h-10 mb-2 opacity-40"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span class="text-xs">暂无相异参数</span>
    </div>

    <div v-else class="flex-1 overflow-x-auto overflow-y-auto">
      <div class="flex gap-2">
        <div
          v-for="(packet, pIdx) in diffPackets"
          :key="packet.id"
          class="card inline-block flex-shrink-0"
        >
          <div class="text-purple-600 font-bold mb-1">
            {{ packet.label }}
          </div>
          <div class="space-y-0.5">
            <div
              v-for="idx in diffIndices"
              :key="idx"
              class="diff-item"
              :class="getHighlightClass(pIdx, idx, diffIndexSet)"
            >
              <span class="param-index">[{{ idx }}]</span>
              <span v-if="hasParam(packet, idx)">{{
                formatParamValue(packet, idx)
              }}</span>
              <span v-else class="text-gray-400 italic text-center w-full block">{{ getPlaceholder(props.hexByteSize) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
