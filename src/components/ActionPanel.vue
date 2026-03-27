<script setup lang="ts">
import FilePicker from '@/components/FilePicker.vue'
import Button from '@/components/Button.vue'

const emit = defineEmits<{
  import: []
  export: []
  analyze: []
  convertDecimal: []
  reset: []
  importFile: [data: string[]]
}>()

function handleFileSelected(file: File) {
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
        emit('importFile', hexStrings)
      }
    } catch {
      emit('import')
    }
  }
  reader.readAsText(file)
}
</script>

<template>
  <div class="panel h-full flex flex-col gap-2">
    <div class="section-title">功能选择区</div>

    <FilePicker @selected="handleFileSelected" />

    <Button type="warning" class="w-full" @click="emit('export')">
      导出数据
    </Button>

    <Button type="primary" class="w-full" @click="emit('analyze')">
      开始分析
    </Button>

    <Button type="warning" class="w-full" @click="emit('convertDecimal')">
      转为十进制
    </Button>

    <Button type="danger" class="w-full" @click="emit('reset')">
      一键重置
    </Button>
  </div>
</template>
