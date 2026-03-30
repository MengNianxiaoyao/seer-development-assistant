<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import Button from '@/components/base/Button.vue'

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

function handleWindowDragOver(e: DragEvent) {
  e.preventDefault()
  isDragging.value = true
}

function handleWindowDragLeave(e: DragEvent) {
  // 只有当拖拽完全离开窗口时才设置为false
  if (e.relatedTarget === null) {
    isDragging.value = false
  }
}

function handleWindowDrop(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
  if (e.dataTransfer?.files.length) {
    emit('selected', e.dataTransfer.files[0])
  }
}

onMounted(() => {
  window.addEventListener('dragover', handleWindowDragOver)
  window.addEventListener('dragleave', handleWindowDragLeave)
  window.addEventListener('drop', handleWindowDrop)
})

onUnmounted(() => {
  window.removeEventListener('dragover', handleWindowDragOver)
  window.removeEventListener('dragleave', handleWindowDragLeave)
  window.removeEventListener('drop', handleWindowDrop)
})
</script>

<template>
  <div
    class="rounded-lg transition-all duration-200"
    :class="isDragging ? 'ring-2 ring-purple-400 ring-offset-1' : ''"
    @drop.prevent="handleDrop"
  >
    <Button type="primary" class="w-full" @click="handleClick">
      <span class="flex items-center justify-center gap-1.5">
        <svg
          class="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        {{ isDragging ? "松开导入" : "导入数据" }}
      </span>
    </Button>
    <input
      ref="fileInput"
      type="file"
      accept=".json"
      class="hidden"
      @change="handleChange"
    >
  </div>
</template>
