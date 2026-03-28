<script setup lang="ts">
import { computed, toRef } from 'vue'
import { formatValue, getHighlightClass } from '@/utils/hex'
import { useDiffIndexSet, useReceivePackets } from '@/composables/usePacketData'
import type { AnalysisResult, DisplayFormat } from '@/types'

const props = defineProps<{
  result: AnalysisResult | null
  format: DisplayFormat
}>()

const resultRef = toRef(props, 'result')
const diffIndexSet = useDiffIndexSet(resultRef)
const receivePackets = useReceivePackets(resultRef)

const diffPackets = computed(() => {
  return receivePackets.value.filter(p =>
    p.params.some(param => diffIndexSet.value.has(param.index))
  )
})

const hasDiffParams = computed(() => {
  return diffPackets.value.length > 0
})
</script>

<template>
  <div class="panel h-full flex flex-col">
    <div class="section-title">
      <span class="label-with-icon">
        <svg class="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        输出区 - 相异参数区
      </span>
    </div>

    <div v-if="!result || !hasDiffParams" class="text-gray-400 text-xs text-center py-4 flex-1">
      暂无相异参数
    </div>

    <div v-else class="flex-1 overflow-x-auto overflow-y-auto">
      <div class="flex gap-2">
        <div
          v-for="(packet, pIdx) in diffPackets"
          :key="packet.id"
          class="card inline-block flex-shrink-0"
        >
          <div class="text-purple-600 font-bold mb-1">{{ packet.label }}</div>
          <div class="space-y-0.5">
            <div
              v-for="param in packet.params.filter(p => diffIndexSet.has(p.index))"
              :key="param.index"
              class="diff-item"
              :class="getHighlightClass(pIdx, param.index, diffIndexSet)"
            >
              <span class="param-index">[{{ param.index }}]</span>
              <span>{{ formatValue(param.hex, param.decimal, param.binary, format) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
