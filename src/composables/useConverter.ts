import { computed, ref, watch } from 'vue'
import { HEADER_LENGTH } from '@/constants'
import { useSettingsStore } from '@/stores/settings'
import { cleanHex, decimalToHex, hexToDecimal } from '@/utils'

/**
 * 解析后的参数对象
 */
interface ParsedParam {
  index: number // 参数索引（从1开始）
  value: string // 参数值（十进制字符串）
  selected: boolean // 是否被选中
}

/**
 * 将十六进制字符串解析为参数列表
 * @param hex - 十六进制字符串
 * @returns 解析结果对象
 */
function parseHexToParams(hex: string) {
  const cleaned = cleanHex(hex)
  if (cleaned.length < HEADER_LENGTH) {
    return {
      commandId: '',
      params: [],
      error: `封包头不完整：需要${HEADER_LENGTH}位，当前${cleaned.length}位`,
    }
  }

  const cmdId = cleaned.substring(10, 18)
  const paramsHex = cleaned.substring(HEADER_LENGTH)
  const params: ParsedParam[] = []

  const remainder = paramsHex.length % 8

  const fullLength = paramsHex.length - remainder
  for (let i = 0; i < fullLength; i += 8) {
    params.push({
      index: params.length + 1,
      value: String(hexToDecimal(paramsHex.substring(i, i + 8))),
      selected: true,
    })
  }

  return {
    commandId: String(hexToDecimal(cmdId)),
    params,
    error: params.length === 0 ? '当前封包无参数，仅有封包头' : undefined,
  }
}

/**
 * 构建完整的封包十六进制字符串
 * @param commandId - 命令ID
 * @param params - 参数数组
 * @returns 完整的十六进制封包字符串
 */
function buildPacketHex(commandId: number, params: number[]) {
  const packetLength = (HEADER_LENGTH / 2) + (params.length * 4)
  return (
    `${decimalToHex(packetLength, 8)}00${decimalToHex(commandId, 8)}00000000`
    + `00000000${params.map(p => decimalToHex(p, 8)).join('')}`
  )
}

/**
 * 解析格式字符串为参数对象
 * 支持格式如 "{commandId}" 或 "{commandId,param1,param2}"
 * @param format - 格式字符串
 * @returns 解析后的对象或null
 */
function parseFormatToParams(format: string) {
  const match = format.trim().match(/^\{(\d+)(?:,(\d+(?:,\d+)*))?\}$/)
  if (!match)
    return null
  const [, cmdId, paramsStr] = match
  return {
    commandId: Number(cmdId),
    params: paramsStr ? paramsStr.split(',').map(Number) : [],
  }
}

/**
 * 格式转换 composable
 * 提供十六进制与格式字符串之间的双向转换功能
 * @returns 转换相关的状态和方法
 */
export function useConverter() {
  const settingsStore = useSettingsStore()
  /** 十六进制转格式输入 */
  const hexToFormatInput = ref('')
  /** 格式转十六进制输入 */
  const formatToHexInput = ref('')
  /** 解析出的参数列表（从十六进制） */
  const parsedParams = ref<ParsedParam[]>([])
  /** 解析出的参数列表（从格式输入） */
  const parsedParamsFromHex = ref<ParsedParam[]>([])
  /** 解析出的命令ID（从格式输入） */
  const parsedCommandIdFromHex = ref<string>('')

  /** 选中的参数列表（从十六进制输入） */
  const selectedParamsFromInput = ref<ParsedParam[]>([])

  /** 监听格式输入变化并解析 */
  watch(
    formatToHexInput,
    (val: string) => {
      const parsed = parseFormatToParams(val.trim())
      if (parsed) {
        parsedCommandIdFromHex.value = String(parsed.commandId)
        const params: ParsedParam[] = parsed.params.map((p, idx) => ({
          index: idx + 1,
          value: String(p),
          selected: true,
        }))
        parsedParamsFromHex.value = params
      }
      else {
        parsedCommandIdFromHex.value = ''
        parsedParamsFromHex.value = []
      }
    },
    { immediate: true },
  )

  /** 是否为特殊命令（从格式输入） */
  const isSpecialCommandFromHex = computed(() => {
    if (parsedParamsFromHex.value.length <= 1)
      return false
    const id = Number(parsedCommandIdFromHex.value)
    return settingsStore.isSpecialCommand(id)
  })

  /** 十六进制解析结果 */
  const hexResult = computed(() =>
    hexToFormatInput.value.trim()
      ? parseHexToParams(hexToFormatInput.value.trim())
      : null,
  )

  /** 命令ID */
  const commandId = computed(() => hexResult.value?.commandId ?? '')
  /** 十六进制转格式错误信息 */
  const hexToFormatError = computed(() => hexResult.value?.error ?? '')

  /** 是否为特殊命令（从十六进制输入） */
  const isSpecialCommand = computed(() => {
    if (parsedParams.value.length <= 1)
      return false
    const id = Number(commandId.value)
    return settingsStore.isSpecialCommand(id)
  })

  /** 监听十六进制输入变化并解析 */
  watch(
    hexToFormatInput,
    (val: string) => {
      parsedParams.value = val.trim()
        ? parseHexToParams(val.trim()).params
        : []
    },
    { immediate: true },
  )

  /** 选中的参数列表 */
  const selectedParams = ref<ParsedParam[]>([])

  /** 过滤后的左侧参数列表 */
  const leftFilteredParams = computed(() => {
    if (isSpecialCommand.value) {
      return selectedParams.value.filter(p => p.selected && p.index > 1)
    }
    return selectedParams.value.filter(p => p.selected)
  })

  /** 十六进制转格式输出 */
  const hexToFormatOutput = computed(() => {
    if (!commandId.value)
      return ''
    const params = leftFilteredParams.value
    const count = params.length
    const paramValues = params.map((p: ParsedParam) => p.value).join(',')
    if (isSpecialCommand.value) {
      return `{${commandId.value},${count},${paramValues}}`
    }
    return paramValues ? `{${commandId.value},${paramValues}}` : `{${commandId.value}}`
  })

  /** 是否有封包文本输入 */
  const hasPacketTextInput = computed(() => !!commandId.value)
  /** 是否有格式输入 */
  const hasFormatInput = computed(() => formatToHexInput.value.trim().length > 0)

  /** 格式转十六进制错误信息 */
  const formatToHexError = computed(() => {
    if (!formatToHexInput.value.trim())
      return ''
    const parsed = parseFormatToParams(formatToHexInput.value.trim())
    if (!parsed)
      return '格式错误，正确格式: {commandId} 或 {commandId,param1,param2}'
    if (Number.isNaN(parsed.commandId) || parsed.commandId < 0)
      return '命令号必须是有效的正整数'
    return parsed.params.length === 0 ? '当前封包无参数，仅有封包头' : ''
  })

  /** 重建的封包文本（左侧） */
  const leftRebuiltPacketText = computed(() => {
    if (!hexToFormatOutput.value)
      return ''
    const parsed = parseFormatToParams(hexToFormatOutput.value)
    if (!parsed)
      return ''
    return buildPacketHex(parsed.commandId, parsed.params)
  })

  /** 监听解析参数变化并更新选中状态 */
  watch(
    parsedParams,
    (params) => {
      selectedParams.value = params.map(p => ({ ...p }))
    },
    { immediate: true },
  )

  watch(
    parsedParamsFromHex,
    (params) => {
      selectedParamsFromInput.value = params.map(p => ({ ...p }))
    },
    { immediate: true },
  )

  /** 过滤后的右侧参数列表 */
  const rightFilteredParams = computed(() => {
    if (isSpecialCommandFromHex.value) {
      return selectedParamsFromInput.value.filter(p => p.selected && p.index > 1)
    }
    return selectedParamsFromInput.value.filter(p => p.selected)
  })

  /** 格式转十六进制输出（右侧） */
  const rightFormatOutput = computed(() => {
    if (!formatToHexInput.value.trim())
      return ''
    const parsed = parseFormatToParams(formatToHexInput.value.trim())
    if (!parsed)
      return ''
    const params = rightFilteredParams.value
    const count = params.length
    const paramValues = params.map((p: ParsedParam) => p.value).join(',')
    if (isSpecialCommandFromHex.value) {
      return `{${parsedCommandIdFromHex.value},${count},${paramValues}}`
    }
    return paramValues ? `{${parsedCommandIdFromHex.value},${paramValues}}` : `{${parsedCommandIdFromHex.value}}`
  })

  /** 重建的封包文本（右侧） */
  const rightRebuiltPacketText = computed(() => {
    if (!rightFormatOutput.value)
      return ''
    const parsed = parseFormatToParams(rightFormatOutput.value)
    if (!parsed)
      return ''
    return buildPacketHex(parsed.commandId, parsed.params)
  })

  /**
   * 重置十六进制转格式输入
   */
  function handleHexToFormatReset() {
    hexToFormatInput.value = ''
    parsedParams.value = []
    selectedParams.value = []
  }

  /**
   * 重置格式转十六进制输入
   */
  function handleFormatToHexReset() {
    formatToHexInput.value = ''
    parsedCommandIdFromHex.value = ''
    parsedParamsFromHex.value = []
    selectedParamsFromInput.value = []
  }

  /**
   * 全选左侧参数
   */
  function selectAllLeftParams() {
    selectedParams.value.forEach(p => (p.selected = true))
    selectedParams.value = [...selectedParams.value]
  }

  /**
   * 取消全选左侧参数
   */
  function deselectAllLeftParams() {
    if (isSpecialCommand.value) {
      selectedParams.value.forEach((p) => {
        if (p.index === 1)
          p.selected = true
        else
          p.selected = false
      })
    }
    else {
      selectedParams.value.forEach(p => (p.selected = false))
    }
    selectedParams.value = [...selectedParams.value]
  }

  /**
   * 切换左侧参数选中状态
   * @param idx - 参数索引
   */
  function toggleLeftParam(idx: number) {
    const p = selectedParams.value.find(p => p.index === idx)
    if (!p)
      return

    const currentSelected = selectedParams.value.filter(p => p.selected)
    const isSpecial = isSpecialCommand.value

    if (isSpecial && idx === 1)
      return
    if (isSpecial && p.selected && currentSelected.length <= 1)
      return
    if (!isSpecial && (p.selected && currentSelected.length <= 1))
      return

    p.selected = !p.selected

    selectedParams.value = [...selectedParams.value]
  }

  /**
   * 全选右侧参数
   */
  function selectAllRightParams() {
    selectedParamsFromInput.value.forEach(p => (p.selected = true))
    selectedParamsFromInput.value = [...selectedParamsFromInput.value]
  }

  /**
   * 取消全选右侧参数
   */
  function deselectAllRightParams() {
    if (isSpecialCommandFromHex.value) {
      selectedParamsFromInput.value.forEach((p) => {
        if (p.index === 1)
          p.selected = true
        else
          p.selected = false
      })
    }
    else {
      selectedParamsFromInput.value.forEach(p => (p.selected = false))
    }
    selectedParamsFromInput.value = [...selectedParamsFromInput.value]
  }

  /**
   * 切换右侧参数选中状态
   * @param idx - 参数索引
   */
  function toggleRightParam(idx: number) {
    const p = selectedParamsFromInput.value.find(p => p.index === idx)
    if (!p)
      return

    const currentSelected = selectedParamsFromInput.value.filter(p => p.selected)
    const isSpecial = isSpecialCommandFromHex.value

    if (isSpecial && idx === 1)
      return
    if (isSpecial && p.selected && currentSelected.length <= 1)
      return
    if (!isSpecial && (p.selected && currentSelected.length <= 1))
      return

    p.selected = !p.selected

    selectedParamsFromInput.value = [...selectedParamsFromInput.value]
  }

  return {
    hexToFormatInput,
    selectedParams,
    filteredParams: leftFilteredParams,
    isSpecialCommand,
    hexToFormatOutput,
    hexToFormatError,
    hasPacketTextInput,
    leftRebuiltPacketText,
    handleHexToFormatReset,
    selectAllLeftParams,
    deselectAllLeftParams,
    toggleLeftParam,

    formatToHexInput,
    selectedParamsFromInput,
    isSpecialCommandFromHex,
    filteredParamsFromInput: rightFilteredParams,
    formatToHexError,
    hasFormatInput,
    rightFormatOutput,
    rightRebuiltPacketText,
    handleFormatToHexReset,
    selectAllRightParams,
    deselectAllRightParams,
    toggleRightParam,
  }
}
