<script setup lang="ts">
import Checkbox from '@/components/Checkbox.vue'
import Input from '@/components/Input.vue'
import Button from '@/components/Button.vue'
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
        <Checkbox v-model="entry.enabled" />
        <span class="text-xs text-gray-500 w-14 flex-shrink-0">{{ entry.label }}</span>
        <Input v-model="entry.value" placeholder="请输入HEX数据..." class="flex-1 min-w-0" />
        <Button
          v-if="inputs.indexOf(entry) > 0"
          type="danger"
          size="sm"
          @click="removeInput(entry.id)"
        >
          删除
        </Button>
      </div>
    </div>
    <Button type="success" size="sm" class="mt-2 w-full" @click="addInput">
      + 新增
    </Button>
  </div>
</template>
