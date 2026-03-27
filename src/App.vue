<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import HexInput from '@/components/HexInput.vue'
import ActionPanel from '@/components/ActionPanel.vue'
import BinaryDisplay from '@/components/BinaryDisplay.vue'
import OutputArea from '@/components/OutputArea.vue'
import DiffArea from '@/components/DiffArea.vue'
import HeaderPanel from '@/components/HeaderPanel.vue'
import StatusBar from '@/components/StatusBar.vue'
import { useHexParser } from '@/composables/useHexParser'
import type { InputEntry, DisplayFormat } from '@/types'

const { result, isAnalyzed, analyze, reset: resetParser } = useHexParser()

const inputs = ref<InputEntry[]>([
  { id: 1, label: '输入1', value: '', enabled: true },
  { id: 2, label: '输入2', value: '', enabled: true },
  { id: 3, label: '输入3', value: '', enabled: true },
])

const displayFormat = ref<DisplayFormat>('hex')

function handleAnalyze() {
  analyze(inputs.value.filter(i => i.value.trim()).map(i => ({ raw: i.value, enabled: i.enabled, label: i.label })))
}

function handleReset() {
  inputs.value = [
    { id: 1, label: '输入1', value: '', enabled: true },
    { id: 2, label: '输入2', value: '', enabled: true },
    { id: 3, label: '输入3', value: '', enabled: true },
  ]
  displayFormat.value = 'hex'
  resetParser()
}

function handleConvertDecimal() {
  displayFormat.value = 'decimal'
}

function handleExport() {
  if (!result.value) {
    alert('请先进行分析')
    return
  }

  const exportData = {
    exportTime: new Date().toISOString(),
    validPackets: result.value.validPackets,
    totalParams: result.value.totalParams,
    diffCount: result.value.diffCount,
    packets: result.value.packets.map(p => ({
      id: p.id,
      header: {
        packetLength: p.header.packetLength.decimal,
        version: p.header.version.decimal,
        commandId: p.header.commandId.decimal,
        mimiId: p.header.mimiId.decimal,
        sequence: p.header.sequence.decimal,
        paramCount: p.header.paramCount.decimal,
      },
      params: p.params.map(param => ({
        index: param.index,
        hex: param.hex,
        decimal: param.decimal,
        binary: param.binary,
      })),
    })),
    diffs: result.value.diffs.map(d => ({
      index: d.index,
      hex: d.hex,
      decimal: d.decimal,
      binary: d.binary,
    })),
  }

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `hex-analysis-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function handleImport(hexStrings: string[]) {
  inputs.value = hexStrings.map((hex, idx) => ({
    id: idx + 1,
    label: `输入${idx + 1}`,
    value: hex,
    enabled: true,
  }))
}

function onImportEvent(e: Event) {
  const custom = e as CustomEvent<string[]>
  handleImport(custom.detail)
}

onMounted(() => {
  window.addEventListener('hex-import', onImportEvent)
})

onUnmounted(() => {
  window.removeEventListener('hex-import', onImportEvent)
})
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex flex-col">
    <header class="bg-white shadow-sm border-b border-gray-200 px-4 py-2">
      <h1 class="text-base font-bold text-gray-800">分析助手</h1>
    </header>

    <div class="flex-1 flex flex-col gap-3 p-3">
      <!-- Top Row: Input + Actions + Binary Display -->
      <div class="flex gap-3" style="height: 280px;">
        <div class="w-[45%]">
          <HexInput v-model:inputs="inputs" />
        </div>
        <div class="w-[10%]">
          <ActionPanel
            :inputs="inputs"
            @import="() => {}"
            @export="handleExport"
            @analyze="handleAnalyze"
            @convert-decimal="handleConvertDecimal"
            @reset="handleReset"
          />
        </div>
        <div class="w-[45%]">
          <BinaryDisplay :inputs="inputs" />
        </div>
      </div>

      <!-- Bottom Row: Output Container + Header -->
      <div class="flex gap-3 flex-1" style="min-height: 300px;">
        <!-- Output Container: 所有参数区 + 相异参数区 -->
        <div class="w-[80%] flex flex-col gap-3">
          <div class="flex-1">
            <OutputArea :result="result" :format="displayFormat" />
          </div>
          <div class="flex-1">
            <DiffArea :result="result" :format="displayFormat" />
          </div>
        </div>
        <!-- Header Panel -->
        <div class="w-[20%]">
          <HeaderPanel :result="result" />
        </div>
      </div>
    </div>

    <StatusBar
      :valid-packets="result?.validPackets ?? 0"
      :param-count="result?.packets?.[0]?.header?.paramCount?.decimal ?? 0"
      :diff-count="result?.diffCount ?? 0"
      :analyzed="isAnalyzed"
    />
  </div>
</template>
