import type {
  DisplayFormat,
  InputEntry,
  ValidationError,
} from '@/types'
import { useDebounceFn } from '@vueuse/core'
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { useHexParser } from '@/composables/useHexParser'
import { useImportExport } from '@/composables/useImportExport'
import { DEFAULT_INPUTS } from '@/constants'

export const useAnalysisStore = defineStore('analysis', () => {
  const inputs = ref<InputEntry[]>([...DEFAULT_INPUTS.map(entry => ({ ...entry }))])
  const sendPacket = ref('')
  let inputOrder = 3

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
    const dataInputs = inputs.value.filter(input => input.value.trim())
    const hasSendPacket = sendPacket.value.trim().length > 0

    if (dataInputs.length === 0 && !hasSendPacket) {
      resetParser()
      return
    }

    displayFormat.value = 'hex'

    dataInputs.forEach((input) => {
      if (input.order === undefined || input.order === 0) {
        inputOrder++
        input.order = inputOrder
      }
    })

    const sendPacketOrder = ++inputOrder

    const allInputs = dataInputs.map(input => ({
      raw: input.value,
      enabled: input.enabled,
      label: input.label,
      order: input.order,
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

  const debouncedAnalyze = useDebounceFn(doAnalyze, 300)

  watch(
    [inputs, sendPacket],
    () => {
      debouncedAnalyze()
    },
    { deep: true, immediate: false },
  )

  function handleReset() {
    inputs.value = DEFAULT_INPUTS.map(entry => ({ ...entry }))
    sendPacket.value = ''
    inputOrder = 0
    displayFormat.value = 'hex'
    resetParser()
  }

  function handleConvertDecimal() {
    displayFormat.value = displayFormat.value === 'hex' ? 'decimal' : 'hex'
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

  function updateInput(id: number, updates: Partial<InputEntry>) {
    const index = inputs.value.findIndex(input => input.id === id)
    if (index !== -1) {
      inputs.value[index] = { ...inputs.value[index], ...updates }
    }
  }

  function addInput() {
    const maxId = Math.max(...inputs.value.map(input => input.id), 0)
    const maxOrder = Math.max(...inputs.value.map(input => input.order || 0), 0)
    inputs.value.push({
      id: maxId + 1,
      label: `收包${inputs.value.length + 1}`,
      value: '',
      enabled: true,
      order: maxOrder + 1,
    })
  }

  function removeInput(id: number) {
    if (inputs.value.length <= 1)
      return
    inputs.value = inputs.value.filter(input => input.id !== id)
    reindexLabels()
  }

  function reindexLabels() {
    inputs.value.forEach((entry, idx) => {
      entry.label = `收包${idx + 1}`
    })
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
    updateInput,
    addInput,
    removeInput,
  }
})
