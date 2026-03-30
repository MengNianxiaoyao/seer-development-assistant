<script setup lang="ts">
import type { AnalysisResult } from '@/types'
import { computed } from 'vue'
import { usePacketData } from '@/composables/usePacketData'
import { getHighlightClass } from '@/utils/hex'

const props = defineProps<{
  result: AnalysisResult | null
}>()

const SPECIAL_COMMAND_IDS = [46046, 45866]

function formatBinary(binary: string): string {
  return binary.replace(/(.{4})/g, '$1 ').trim()
}

const { receivePackets } = usePacketData(computed(() => props.result))

const parsedData = computed(() => {
  return receivePackets.value
    .filter(p => SPECIAL_COMMAND_IDS.includes(p.header.commandId.decimal))
    .map(p => ({
      id: p.id,
      label: p.label,
      commandId: p.header.commandId.decimal,
      groups: p.bodySegments4 ?? [],
    }))
})

const diffIndexSet = computed(() => {
  if (parsedData.value.length < 2)
    return new Set<number>()
  const maxLen = Math.max(...parsedData.value.map(d => d.groups.length))
  const diffs = new Set<number>()
  for (let i = 0; i < maxLen; i++) {
    const values = parsedData.value.map(d => d.groups[i]?.hex ?? '')
    const first = values[0]
    if (values.some(v => v !== first))
      diffs.add(i + 1)
  }
  return diffs
})
</script>

<template>
  <div class="panel h-full flex flex-col">
    <div class="section-title">
      <span class="flex items-center gap-2">
        <svg
          class="w-4 h-4 text-indigo-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79 8-4"
          />
        </svg>
        二进制显示区
      </span>
    </div>

    <div class="flex-1 overflow-x-auto overflow-y-auto">
      <div
        v-if="parsedData.length === 0"
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
            d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79 8-4"
          />
        </svg>
        <span class="text-xs">输入46046或45866收包后自动解析</span>
      </div>
      <div v-else class="flex gap-2">
        <div
          v-for="(data, pIdx) in parsedData"
          :key="data.id"
          class="card inline-block flex-shrink-0"
        >
          <div class="text-purple-600 font-bold mb-1">
            {{ data.label }}
          </div>
          <div v-if="data.groups.length === 0" class="text-gray-400">
            无数据
          </div>
          <div v-else class="space-y-0.5">
            <div
              v-for="group in data.groups"
              :key="group.index"
              class="flex gap-1 px-1 py-0.5 rounded"
              :class="getHighlightClass(pIdx, group.index, diffIndexSet)"
            >
              <span class="opacity-60 w-8 inline-block">[{{ group.index }}]</span>
              <span>{{ formatBinary(group.binary) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
