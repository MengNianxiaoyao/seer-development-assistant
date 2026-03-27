<script setup lang="ts">
import { ref } from 'vue'
import HexInput from '@/components/HexInput.vue'
import ActionPanel from '@/components/ActionPanel.vue'
import BinaryDisplay from '@/components/BinaryDisplay.vue'
import OutputArea from '@/components/OutputArea.vue'
import DiffArea from '@/components/DiffArea.vue'
import HeaderPanel from '@/components/HeaderPanel.vue'
import StatusBar from '@/components/StatusBar.vue'
import AlertModal from '@/components/AlertModal.vue'
import Button from '@/components/Button.vue'
import { useHexParser } from '@/composables/useHexParser'
import type { InputEntry, DisplayFormat, ValidationError, AnalysisResult, ParsedPacket, HeaderField, ParamItem } from '@/types'

const { result, isAnalyzed, validate, analyze, reset: resetParser } = useHexParser()

const inputs = ref<InputEntry[]>([
  { id: 1, label: '输入1', value: '', enabled: true },
  { id: 2, label: '输入2', value: '', enabled: true },
  { id: 3, label: '输入3', value: '', enabled: true },
])

const displayFormat = ref<DisplayFormat>('hex')
const validationErrors = ref<ValidationError[]>([])
const showValidationModal = ref(false)
const alertMessage = ref('')
const showAlertModal = ref(false)

function handleAnalyze() {
  const dataInputs = inputs.value.filter(i => i.value.trim())
  if (dataInputs.length === 0) return

  displayFormat.value = 'hex'

  const errors = validate(dataInputs.map(i => ({ raw: i.value, enabled: i.enabled, label: i.label })))

  if (errors.length > 0) {
    validationErrors.value = errors
    showValidationModal.value = true
    return
  }

  analyze(dataInputs.map(i => ({ raw: i.value, enabled: i.enabled, label: i.label })))
}

function closeValidationModal() {
  showValidationModal.value = false
  validationErrors.value = []
}

function closeAlertModal() {
  showAlertModal.value = false
  alertMessage.value = ''
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
    alertMessage.value = '请先进行分析'
    showAlertModal.value = true
    return
  }

  const exportData = {
    exportTime: new Date().toISOString(),
    validPackets: result.value.validPackets,
    totalParams: result.value.totalParams,
    diffCount: result.value.diffCount,
    packets: result.value.packets.map(p => ({
      id: p.id,
      raw: p.raw,
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

function handleImportFile(hexStringsOrJson: string[]) {
  // Check if it's already parsed analysis result
  if (hexStringsOrJson.length === 1) {
    try {
      const data = JSON.parse(hexStringsOrJson[0])
      if (data.packets && Array.isArray(data.packets)) {
        const packets: ParsedPacket[] = data.packets.map((p: any, idx: number) => ({
          id: idx + 1,
          label: p.label || `输入${idx + 1}`,
          raw: p.raw || '',
          header: {
            packetLength: makeHeaderField('封包长度', intToHex(p.header?.packetLength ?? 0, 8)),
            version: makeHeaderField('版本号', intToHex(p.header?.version ?? 0, 2)),
            commandId: makeHeaderField('命令号', intToHex(p.header?.commandId ?? 0, 8)),
            mimiId: makeHeaderField('米米号', intToHex(p.header?.mimiId ?? 0, 8)),
            sequence: makeHeaderField('序列号', intToHex(p.header?.sequence ?? 0, 8)),
            paramCount: makeHeaderField('参数数量', intToHex(p.header?.paramCount ?? 0, 8)),
          },
          params: (p.params || []).map((param: any): ParamItem => ({
            index: param.index,
            hex: param.hex || '',
            decimal: param.decimal ?? 0,
            binary: param.binary || '',
          })),
          isGrouped: (p.header?.paramCount ?? 0) > 1,
          groupSize: (p.header?.commandId ?? 0) === 42023 ? 2 : 8,
        }))

        const diffs = findDifferences(packets)
        const res: AnalysisResult = {
          packets,
          diffs,
          diffCount: diffs.length,
          totalParams: packets.reduce((sum, p) => sum + p.params.length, 0),
          validPackets: packets.length,
        }
        result.value = res
        isAnalyzed.value = true
        displayFormat.value = 'hex'
        inputs.value = packets.map((p, idx) => ({
          id: idx + 1,
          label: p.label,
          value: p.raw,
          enabled: true,
        }))
        return
      }
    } catch {
      // Not a parsed result, continue as hex strings
    }
  }

  // Handle as raw hex strings
  inputs.value = hexStringsOrJson.map((hex, idx) => ({
    id: idx + 1,
    label: `输入${idx + 1}`,
    value: hex,
    enabled: true,
  }))

  displayFormat.value = 'hex'
  handleAnalyze()
}

function intToHex(num: number, length: number): string {
  return num.toString(16).toUpperCase().padStart(length, '0')
}

function makeHeaderField(name: string, hex: string): HeaderField {
  return {
    name,
    hex,
    decimal: parseInt(hex, 16),
    binary: hex.split('').map(c => parseInt(c, 16).toString(2).padStart(4, '0')).join(''),
  }
}

function findDifferences(packets: ParsedPacket[]): AnalysisResult['diffs'] {
  if (packets.length < 2) return []
  const maxLen = Math.max(...packets.map(p => p.params.length))
  const diffs: AnalysisResult['diffs'] = []
  for (let i = 0; i < maxLen; i++) {
    const values = packets.map(p => p.params[i]?.hex ?? '')
    const first = values[0]
    if (values.some(v => v !== first)) {
      const ref = packets[0].params[i]
      if (ref) {
        diffs.push({ index: i + 1, hex: ref.hex, decimal: ref.decimal, binary: ref.binary })
      }
    }
  }
  return diffs
}

function handleImportError() {
  alertMessage.value = 'JSON 解析失败，请检查文件格式'
  showAlertModal.value = true
}
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
            @import-file="handleImportFile"
            @import="handleImportError"
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
      <div class="flex gap-3" style="height: 560px;">
        <!-- Output Container: 所有参数区 + 相异参数区 -->
        <div class="w-[80%] flex flex-col gap-3 h-full">
          <div class="flex-1 overflow-hidden">
            <OutputArea :result="result" :format="displayFormat" />
          </div>
          <div class="flex-1 overflow-hidden">
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

    <!-- Validation Error Modal -->
    <div
      v-if="showValidationModal"
      class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      @click.self="closeValidationModal"
    >
      <div class="bg-white rounded-2xl shadow-2xl w-[500px] max-h-[70vh] flex flex-col overflow-hidden animate-scale-in">
        <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-red-50 to-white">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
              <svg class="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 class="text-sm font-semibold text-red-600">校验不通过</h2>
          </div>
          <span
            class="w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer transition-colors text-lg leading-none"
            @click="closeValidationModal"
          >×</span>
        </div>
        <div class="p-5 overflow-y-auto flex-1 space-y-3">
          <div
            v-for="err in validationErrors"
            :key="err.label"
          >
            <div class="text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-red-400"></span>
              {{ err.label }}
            </div>
            <div class="bg-red-50 border border-red-100 rounded-lg p-3 space-y-1">
              <div
                v-for="(reason, idx) in err.reasons"
                :key="idx"
                class="text-xs text-red-500 flex items-start gap-1.5"
              >
                <span class="text-red-300 mt-0.5">·</span>
                <span>{{ reason }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="px-5 py-4 border-t border-gray-100 flex justify-end bg-gray-50/50">
          <Button type="default" size="sm" @click="closeValidationModal">关闭</Button>
        </div>
      </div>
    </div>

    <!-- Alert Modal -->
    <AlertModal
      v-if="showAlertModal"
      :message="alertMessage"
      @close="closeAlertModal"
    />
  </div>
</template>
