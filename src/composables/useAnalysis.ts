import type { DisplayFormat, InputEntry, ValidationError } from '@/types'
import { ref, watch } from 'vue'
import { useHexParser } from './useHexParser'
import { useImportExport } from './useImportExport'

const DEFAULT_INPUTS: InputEntry[] = [
  { id: 1, label: '收包1', value: '', enabled: true, order: 0 },
  { id: 2, label: '收包2', value: '', enabled: true, order: 0 },
  { id: 3, label: '收包3', value: '', enabled: true, order: 0 },
]

const inputs = ref<InputEntry[]>([...DEFAULT_INPUTS.map(i => ({ ...i }))])
const sendPacket = ref('')
let inputOrder = 3

export function useAnalysis() {
  const {
    result,
    isAnalyzed,
    validate,
    analyze,
    reset: resetParser,
  } = useHexParser()
  const {
    alertMessage,
    showAlertModal,
    handleImport,
    handleExport,
    closeAlertModal,
  } = useImportExport()

  const displayFormat = ref<DisplayFormat>('hex')
  const isLoading = ref(false)

  const validationErrors = ref<ValidationError[]>([])
  const showValidationModal = ref(false)

  function doAnalyze() {
    const dataInputs = inputs.value.filter(i => i.value.trim())
    const hasSendPacket = sendPacket.value.trim().length > 0

    if (dataInputs.length === 0 && !hasSendPacket) {
      resetParser()
      return
    }

    displayFormat.value = 'hex'

    dataInputs.forEach((i) => {
      if (i.order === undefined || i.order === 0) {
        inputOrder++
        i.order = inputOrder
      }
    })

    const sendPacketOrder = ++inputOrder

    const allInputs = dataInputs.map(i => ({
      raw: i.value,
      enabled: i.enabled,
      label: i.label,
      order: i.order,
    }))

    if (hasSendPacket) {
      allInputs.push({
        raw: sendPacket.value,
        enabled: true,
        label: '发包',
        order: sendPacketOrder,
      })
    }

    const errors = validate(allInputs)

    if (errors.length > 0) {
      validationErrors.value = errors
      showValidationModal.value = true
      return
    }

    analyze(allInputs)
  }

  watch(
    [inputs, sendPacket],
    () => {
      doAnalyze()
    },
    { deep: true, immediate: false },
  )

  function handleReset() {
    inputs.value = DEFAULT_INPUTS.map(i => ({ ...i }))
    sendPacket.value = ''
    inputOrder = 0
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
        inputs.value = state.inputs
        sendPacket.value = state.sendPacket
        result.value = state.result
        isAnalyzed.value = true
        displayFormat.value = 'hex'
      },
      (hexInputs) => {
        inputs.value = hexInputs
        displayFormat.value = 'hex'
        doAnalyze()
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
    doAnalyze,
    handleReset,
    handleConvertDecimal,
    handleExport: handleExportClick,
    handleImportFile,
    closeValidationModal,
    closeAlertModal,
  }
}

export function useInputData() {
  return {
    inputs,
    sendPacket,
  }
}
