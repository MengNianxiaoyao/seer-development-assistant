<script setup lang="ts">
import { ref } from 'vue'
import Button from '@/components/Button.vue'

const emit = defineEmits<{
  selected: [file: File]
}>()

const fileInput = ref<HTMLInputElement>()
const isDragging = ref(false)

function handleClick() {
  fileInput.value?.click()
}

function handleChange(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files?.length) {
    emit('selected', input.files[0])
    input.value = ''
  }
}

function handleDrop(e: DragEvent) {
  isDragging.value = false
  if (e.dataTransfer?.files.length) {
    emit('selected', e.dataTransfer.files[0])
  }
}
</script>

<template>
  <div
    class="rounded-lg border-2 border-dashed transition-all duration-200"
    :class="isDragging
      ? 'border-purple-400 bg-purple-50'
      : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/30'
    "
    @dragover.prevent="isDragging = true"
    @dragleave="isDragging = false"
    @drop.prevent="handleDrop"
  >
    <Button type="primary" class="w-full !rounded-md" @click="handleClick">
      <span class="flex items-center justify-center gap-1.5">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        导入数据
      </span>
    </Button>
    <input
      ref="fileInput"
      type="file"
      accept=".json"
      class="hidden"
      @change="handleChange"
    />
  </div>
</template>
