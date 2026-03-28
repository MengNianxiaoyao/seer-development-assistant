<script setup lang="ts">
import { ref, computed } from 'vue'
import RadioGroup from '@/components/RadioGroup.vue'
import { splitByGroupSize, getHighlightClass } from '@/utils/hex'
import type { BinaryGroupSize, InputEntry } from '@/types'

const props = defineProps<{
  inputs: InputEntry[]
}>()

const groupSize = ref<BinaryGroupSize>(8)

const radioOptions = [
  { value: 1, label: '0' },
  { value: 2, label: '00' },
  { value: 4, label: '0000' },
  { value: 8, label: '00000000' },
]

function getEnabledInputs() {
  return props.inputs.filter(i => i.enabled && i.value.trim() && i.label !== '发包')
}

const parsedData = computed(() => {
  return getEnabledInputs().map(entry => ({
    id: entry.id,
    label: entry.label,
    groups: splitByGroupSize(entry.value, groupSize.value),
  }))
})

const diffIndexSet = computed(() => {
  if (parsedData.value.length < 2) return new Set<number>()
  const maxLen = Math.max(...parsedData.value.map(d => d.groups.length))
  const diffs = new Set<number>()

  for (let i = 0; i < maxLen; i++) {
    const values = parsedData.value.map(d => d.groups[i]?.hex ?? '')
    const first = values[0]
    if (values.some(v => v !== first)) {
      diffs.add(i + 1)
    }
  }

  return diffs
})
</script>

<template>
  <div class="panel h-full flex flex-col">
    <div class="section-title flex items-center gap-3">
      <span class="flex items-center gap-2">
        <svg class="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
        </svg>
        二进制显示区
      </span>
      <span class="text-xs text-gray-500">选择十六进制格式:</span>
      <RadioGroup v-model="groupSize" :options="radioOptions" />
    </div>

    <div class="flex-1 overflow-x-auto overflow-y-auto">
      <div v-if="parsedData.length === 0" class="text-gray-400 text-xs text-center py-4">
        暂无输入数据
      </div>
      <div v-else class="flex gap-2">
        <div v-for="(data, pIdx) in parsedData" :key="data.id" class="card inline-block flex-shrink-0">
          <div class="text-purple-600 font-bold mb-1">{{ data.label }}</div>
          <div v-if="data.groups.length === 0" class="text-gray-400">无数据</div>
          <div v-else class="space-y-0.5">
            <div
              v-for="group in data.groups"
              :key="group.index"
              class="flex gap-1 px-1 py-0.5 rounded"
              :class="getHighlightClass(pIdx, group.index, diffIndexSet)"
            >
              <span class="opacity-60 w-8 inline-block">[{{ group.index }}]</span>
              <span>{{ group.binary }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
