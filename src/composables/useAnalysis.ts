import { ref } from 'vue'
import { useHexParser } from './useHexParser'
import { useImportExport } from './useImportExport'
import type { InputEntry, DisplayFormat, ValidationError } from '@/types'

const DEFAULT_INPUTS: InputEntry[] = [
  { id: 1, label: '收包1', value: '', enabled: true },
  { id: 2, label: '收包2', value: '', enabled: true },
  { id: 3, label: '收包3', value: '', enabled: true },
]

export function useAnalysis() {
  const { result, isAnalyzed, validate, analyze, reset: resetParser } = useHexParser()
  const { alertMessage, showAlertModal, handleImport, handleExport, closeAlertModal } = useImportExport()

  const inputs = ref<InputEntry[]>([...DEFAULT_INPUTS.map((i) => ({ ...i }))])
  const sendPacket = ref('')
  const displayFormat = ref<DisplayFormat>('hex')
  const isLoading = ref(false)

  const validationErrors = ref<ValidationError[]>([])
  const showValidationModal = ref(false)

  function handleAnalyze() {
    const dataInputs = inputs.value.filter((i) => i.value.trim())
    const hasSendPacket = sendPacket.value.trim().length > 0

    if (dataInputs.length === 0 && !hasSendPacket) return

    displayFormat.value = 'hex'
    isLoading.value = true

    const allInputs = dataInputs.map((i) => ({ raw: i.value, enabled: i.enabled, label: i.label }))

    if (hasSendPacket) {
      allInputs.unshift({ raw: sendPacket.value, enabled: true, label: '发包' })
    }

    const errors = validate(allInputs)

    if (errors.length > 0) {
      validationErrors.value = errors
      showValidationModal.value = true
      isLoading.value = false
      return
    }

    analyze(allInputs)
    isLoading.value = false
  }

  function handleReset() {
    inputs.value = DEFAULT_INPUTS.map((i) => ({ ...i }))
    sendPacket.value = ''
    displayFormat.value = 'hex'
    resetParser()
  }

  function handleConvertDecimal() {
    displayFormat.value = 'decimal'
  }

  function handleExportClick() {
    handleExport(result.value)
  }

  function handleImportFile(fileContent: string) {
    handleImport(
      fileContent,
      (state) => {
        // 直接恢复导出的完整分析结果
        inputs.value = state.inputs
        sendPacket.value = state.sendPacket
        result.value = state.result
        isAnalyzed.value = true
        displayFormat.value = 'hex'
      },
      (hexInputs) => {
        inputs.value = hexInputs
        displayFormat.value = 'hex'
        handleAnalyze()
      },
    )
  }

  function closeValidationModal() {
    showValidationModal.value = false
    validationErrors.value = []
  }

  return {
    inputs,
    sendPacket,
    displayFormat,
    isLoading,
    result,
    isAnalyzed,
    validationErrors,
    showValidationModal,
    alertMessage,
    showAlertModal,
    handleAnalyze,
    handleReset,
    handleConvertDecimal,
    handleExport: handleExportClick,
    handleImportFile,
    closeValidationModal,
    closeAlertModal,
  }
}
