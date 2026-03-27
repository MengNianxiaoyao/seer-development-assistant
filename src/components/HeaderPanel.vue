<script setup lang="ts">
import { computed } from 'vue'
import type { AnalysisResult } from '@/types'

const props = defineProps<{
  result: AnalysisResult | null
}>()

const headerFields = computed(() => {
  if (!props.result?.packets.length) return []

  const first = props.result.packets[0]
  return [
    { name: '包长度', decimal: first.header.packetLength.decimal },
    { name: '版本号', decimal: first.header.version.decimal },
    { name: '命令号', decimal: first.header.commandId.decimal },
    { name: '米米号', decimal: first.header.mimiId.decimal },
    { name: '序列号', decimal: first.header.sequence.decimal },
    { name: '参数总数', decimal: 1 + first.header.paramCount.decimal },
    { name: '参数数量', decimal: first.header.paramCount.decimal },
  ]
})

const diffIndices = computed(() => {
  if (!props.result?.diffs.length) return ''
  return props.result.diffs.map((d: { index: number }) => `[${d.index}]`).join('')
})
</script>

<template>
  <div class="panel h-full flex flex-col">
    <div class="section-title">标识参数区</div>

    <div v-if="!props.result || props.result.packets.length === 0" class="text-gray-400 text-xs text-center py-4 flex-1">
      暂无数据
    </div>

    <div v-else class="flex-1 space-y-1.5 text-xs">
      <div
        v-for="field in headerFields"
        :key="field.name"
        class="flex items-center gap-2"
      >
        <span class="text-gray-500 w-20 flex-shrink-0">{{ field.name }}:</span>
        <span class="font-mono text-green-700 bg-gray-100 px-2 py-0.5 rounded">{{ field.decimal }}</span>
      </div>

      <div class="border-t border-gray-200 pt-1.5 mt-1.5">
        <div class="flex items-center gap-2">
          <span class="text-gray-500 w-20 flex-shrink-0">相异参数数量:</span>
          <span class="font-mono text-red-600 bg-red-50 px-2 py-0.5 rounded">{{ props.result.diffCount }}</span>
        </div>
        <div v-if="diffIndices" class="flex items-center gap-2 mt-1">
          <span class="text-gray-500 w-20 flex-shrink-0">相异参数序号:</span>
          <span class="font-mono text-red-600 bg-red-50 px-2 py-0.5 rounded">{{ diffIndices }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
