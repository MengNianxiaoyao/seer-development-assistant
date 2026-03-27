<script setup lang="ts">
import type { InputEntry } from '@/types'

const inputs = defineModel<InputEntry[]>('inputs', { required: true })

let nextId = inputs.value.length + 1

function addInput() {
  inputs.value.push({
    id: nextId++,
    label: `输入${inputs.value.length + 1}`,
    value: '',
    enabled: true,
  })
}

function removeInput(id: number) {
  if (inputs.value.length <= 1) return
  inputs.value = inputs.value.filter(i => i.id !== id)
  reindexLabels()
}

function reindexLabels() {
  inputs.value.forEach((entry, idx) => {
    entry.label = `输入${idx + 1}`
  })
}
</script>

<template>
  <div class="panel h-full flex flex-col">
    <div class="section-title">输入区</div>
    <div class="flex-1 overflow-y-auto space-y-2 pr-1" style="max-height: 220px;">
      <div
        v-for="entry in inputs"
        :key="entry.id"
        class="flex items-center gap-2"
      >
        <input
          v-model="entry.enabled"
          type="checkbox"
          class="w-4 h-4 accent-purple-600 cursor-pointer flex-shrink-0"
        />
        <span class="text-xs text-gray-500 w-14 flex-shrink-0">{{ entry.label }}</span>
        <input
          v-model="entry.value"
          type="text"
          placeholder="请输入HEX数据..."
          class="flex-1 min-w-0 px-2 py-1 border border-gray-300 rounded text-xs font-mono focus:outline-none focus:border-purple-500"
        />
        <button
          v-if="inputs.indexOf(entry) > 0"
          class="btn bg-red-100 text-red-600 hover:bg-red-200 text-xs px-2 py-1 flex-shrink-0"
          @click="removeInput(entry.id)"
        >
          删除
        </button>
      </div>
    </div>
    <button
      class="btn bg-green-500 text-white hover:bg-green-600 mt-2 text-xs"
      @click="addInput"
    >
      + 新增
    </button>
  </div>
</template>
