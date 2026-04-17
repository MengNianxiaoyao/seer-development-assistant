<script setup lang="ts">
import Button from '@/components/base/Button.vue'
import FilePicker from '@/components/FilePicker.vue'

const emit = defineEmits<{
  export: []
  reset: []
  importFile: [content: string]
}>()

function handleFileSelected(file: File) {
  const reader = new FileReader()
  reader.onload = () => {
    emit('importFile', reader.result as string)
  }
  reader.readAsText(file)
}
</script>

<template>
  <div class="panel h-full">
    <div class="section-title mb-3">
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
            d="M4 6h16M4 12h16M4 18h7"
          />
        </svg>
        功能选择区
      </span>
    </div>

    <div class="space-y-1.5 -mt-1">
      <Button type="danger" class="w-full" @click="emit('reset')">
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
              d="M4 4v5h.582m15.582 0a8.002 8.002 0 011.582 7.935M4 4v5h.582m15.582 0a8.002 8.002 0 011.582 7.935M4 4h16a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z"
            />
          </svg>
          一键重置
        </span>
      </Button>

      <FilePicker @selected="handleFileSelected" />

      <Button type="warning" class="w-full" @click="emit('export')">
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
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
          导出数据
        </span>
      </Button>
    </div>
  </div>
</template>
