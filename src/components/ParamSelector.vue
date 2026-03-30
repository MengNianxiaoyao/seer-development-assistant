<script setup lang="ts">
import { computed, ref } from 'vue'
import Button from '@/components/Button.vue'
import Checkbox from '@/components/Checkbox.vue'

interface Param {
  index: number
  value: string
  selected: boolean
}

const props = defineProps<{
  params: Param[]
  filteredCount: number
  isSpecialCommand?: boolean
}>()

const emit = defineEmits<{
  selectAll: []
  deselectAll: []
  toggle: [index: number]
}>()

const displayParams = computed(() => {
  if (props.isSpecialCommand) {
    return props.params.filter(p => p.index !== 1)
  }
  return props.params
})

const showHint = ref(false)
let hintTimer: ReturnType<typeof setTimeout> | null = null

function toggleParam(index: number) {
  if (props.isSpecialCommand) {
    const param = props.params.find(p => p.index === index)
    if (param?.selected && props.filteredCount <= 1) {
      if (hintTimer)
        clearTimeout(hintTimer)
      showHint.value = true
      hintTimer = setTimeout(() => {
        showHint.value = false
        hintTimer = null
      }, 2000)
      return
    }
  }
  emit('toggle', index)
}
</script>

<template>
  <div class="flex flex-col gap-2 flex-1 overflow-hidden">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
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
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <span class="text-xs font-medium text-gray-600">选择参数</span>
        <span
          class="px-1.5 py-0.5 bg-indigo-100 text-indigo-600 rounded text-[10px] font-medium"
        >
          {{ filteredCount }} / {{ displayParams.length }}
        </span>
      </div>
      <div class="flex gap-2">
        <Button type="primary" size="sm" @click="emit('selectAll')">
          全选
        </Button>
        <Button
          type="primary"
          size="sm"
          :disabled="isSpecialCommand"
          @click="emit('deselectAll')"
        >
          取消
        </Button>
      </div>
    </div>
    <div
      class="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-indigo-50/30 rounded-xl border border-gray-200 p-3"
    >
      <div class="flex flex-wrap gap-2">
        <div
          v-for="(param, idx) in displayParams"
          :key="param.index"
          class="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer select-none transition-all duration-200"
          :class="[
            param.selected
              ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/25 scale-[1.02]'
              : 'bg-white border border-gray-200 hover:border-indigo-300 hover:shadow-sm',
          ]"
          @click="toggleParam(param.index)"
        >
          <Checkbox v-model="param.selected" />
          <span
            class="text-xs font-mono font-medium"
            :class="param.selected ? 'text-white' : 'text-gray-600'"
          >
            参数{{ idx + 1 }}
          </span>
          <span
            class="text-xs font-mono"
            :class="param.selected ? 'text-indigo-100' : 'text-gray-400'"
          >:</span>
          <span
            class="text-xs font-mono font-semibold"
            :class="param.selected ? 'text-white' : 'text-gray-800'"
          >
            {{ param.value }}
          </span>
        </div>
      </div>
      <div
        v-if="showHint"
        class="mt-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-600"
      >
        至少需要保留1个参数
      </div>
    </div>
  </div>
</template>
