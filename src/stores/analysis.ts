import type {
  HexByteSize,
  InputEntry,
  ValidationError,
} from '@/types'
import { useDebounceFn } from '@vueuse/core'
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { useHexParser } from '@/composables/useHexParser'
import { useImportExport } from '@/composables/useImportExport'
import { DEFAULT_INPUTS } from '@/constants'

/**
 * 分析 Store
 * 管理数据包分析的所有状态和操作
 */
export const useAnalysisStore = defineStore('analysis', () => {
  /** 输入条目列表（收包） */
  const inputs = ref<InputEntry[]>([...DEFAULT_INPUTS.map(entry => ({ ...entry }))])
  /** 发送包内容 */
  const sendPacket = ref('')
  /** 输入顺序计数器 */
  let inputOrder = 3

  /** 十六进制解析器 composable */
  const {
    result,
    isAnalyzed,
    validate,
    analyze,
    reset: resetParser,
  } = useHexParser()

  /** 导入导出 composable */
  const {
    alertMessage,
    showAlertModal,
    handleImport,
    handleExport,
    closeAlertModal,
  } = useImportExport()

  /** 十六进制字节大小 */
  const hexByteSize = ref<HexByteSize>(8)
  /** 是否正在加载 */
  const isLoading = ref(false)

  /** 验证错误列表 */
  const validationErrors = ref<ValidationError[]>([])
  /** 是否显示验证弹窗 */
  const showValidationModal = ref(false)

  /**
   * 执行分析操作
   */
  function doAnalyze() {
    const dataInputs = inputs.value.filter(input => input.value.trim())
    const hasSendPacket = sendPacket.value.trim().length > 0

    if (dataInputs.length === 0 && !hasSendPacket) {
      resetParser()
      return
    }

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

  /** 防抖分析函数 */
  const debouncedAnalyze = useDebounceFn(doAnalyze, 300)

  /** 监听输入变化自动分析 */
  watch(
    [inputs, sendPacket],
    () => {
      debouncedAnalyze()
    },
    { deep: true, immediate: false },
  )

  /**
   * 重置所有状态
   */
  function handleReset() {
    inputs.value = DEFAULT_INPUTS.map(entry => ({ ...entry }))
    sendPacket.value = ''
    inputOrder = 0
    hexByteSize.value = 8
    resetParser()
  }

  /**
   * 处理字节大小变化
   * @param size - 字节大小
   */
  function handleHexByteSizeChange(size: HexByteSize) {
    hexByteSize.value = size
  }

  /**
   * 处理导出点击
   */
  function handleExportClick() {
    handleExport(result.value, hexByteSize.value)
  }

  /**
   * 处理导入文件
   * @param fileContent - 文件内容
   */
  function handleImportFile(fileContent: string) {
    handleImport(
      fileContent,
      (state) => {
        inputs.value = state.inputs
        sendPacket.value = state.sendPacket
        result.value = state.result
        isAnalyzed.value = true
        hexByteSize.value = state.hexByteSize
      },
      (hexInputs) => {
        inputs.value = hexInputs
        doAnalyze()
      },
    )
  }

  /**
   * 关闭验证弹窗
   */
  function closeValidationModal() {
    showValidationModal.value = false
    validationErrors.value = []
  }

  /**
   * 更新输入条目
   * @param id - 输入ID
   * @param updates - 更新内容
   */
  function updateInput(id: number, updates: Partial<InputEntry>) {
    const index = inputs.value.findIndex(input => input.id === id)
    if (index !== -1) {
      inputs.value[index] = { ...inputs.value[index], ...updates }
    }
  }

  /**
   * 添加新的输入条目
   */
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

  /**
   * 移除输入条目
   * @param id - 输入ID
   */
  function removeInput(id: number) {
    if (inputs.value.length <= 1)
      return
    inputs.value = inputs.value.filter(input => input.id !== id)
    reindexLabels()
  }

  /**
   * 重新索引标签
   */
  function reindexLabels() {
    inputs.value.forEach((entry, idx) => {
      entry.label = `收包${idx + 1}`
    })
  }

  return {
    inputs,
    sendPacket,
    hexByteSize,
    isLoading,
    result,
    isAnalyzed,
    validationErrors,
    showValidationModal,
    alertMessage,
    showAlertModal,
    doAnalyze,
    handleReset,
    handleHexByteSizeChange,
    handleExport: handleExportClick,
    handleImportFile,
    closeValidationModal,
    closeAlertModal,
    updateInput,
    addInput,
    removeInput,
  }
})
