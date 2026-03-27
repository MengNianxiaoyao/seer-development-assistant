<script setup lang="ts">
import type { InputEntry } from '@/types'

const emit = defineEmits<{
  import: []
  export: []
  analyze: []
  convertDecimal: []
  reset: []
}>()

defineProps<{
  inputs: InputEntry[]
}>()

function handleImportFile(e: Event) {
  const input = e.target as HTMLInputElement
  if (!input.files?.length) return

  const file = input.files[0]
  const reader = new FileReader()
  reader.onload = () => {
    try {
      const json = JSON.parse(reader.result as string)
      const data = Array.isArray(json) ? json : [json]
      const hexStrings: string[] = []

      for (const item of data) {
        if (typeof item === 'string') {
          hexStrings.push(item)
        } else if (item.hex) {
          hexStrings.push(item.hex)
        } else if (item.data) {
          hexStrings.push(item.data)
        } else if (item.value) {
          hexStrings.push(item.value)
        }
      }

      if (hexStrings.length > 0) {
        // Dynamically import to pass data up
        window.dispatchEvent(new CustomEvent('hex-import', { detail: hexStrings }))
      }
    } catch {
      alert('JSON 解析失败，请检查文件格式')
    }
  }
  reader.readAsText(file)
  input.value = ''
}
</script>

<template>
  <div class="panel h-full flex flex-col gap-2">
    <div class="section-title">功能选择区</div>

    <div class="relative">
      <button class="btn-primary w-full" @click="($refs.fileInput as HTMLInputElement).click()">
        导入数据
      </button>
      <input
        ref="fileInput"
        type="file"
        accept=".json"
        class="hidden"
        @change="handleImportFile"
      />
    </div>

    <button class="btn-warning w-full" @click="emit('export')">
      导出数据
    </button>

    <button class="btn-primary w-full" @click="emit('analyze')">
      开始分析
    </button>

    <button class="btn-warning w-full" @click="emit('convertDecimal')">
      转为十进制
    </button>

    <button class="btn bg-red-500 text-white hover:bg-red-600 w-full" @click="emit('reset')">
      一键重置
    </button>
  </div>
</template>
