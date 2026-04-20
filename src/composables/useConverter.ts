import { computed, ref, watch } from 'vue'
import { HEADER_LENGTH } from '@/constants'
import { useSettingsStore } from '@/stores/settings'
import { cleanHex, decimalToHex, hexToDecimal } from '@/utils'

interface ParsedParam {
  index: number
  value: string
  selected: boolean
}

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

function buildPacketHex(commandId: number, params: number[]) {
  const packetLength = (HEADER_LENGTH / 2) + (params.length * 4)
  return (
    `${decimalToHex(packetLength, 8)}00${decimalToHex(commandId, 8)}00000000`
    + `00000000${params.map(p => decimalToHex(p, 8)).join('')}`
  )
}

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

export function useConverter() {
  const settingsStore = useSettingsStore()
  const hexToFormatInput = ref('')
  const formatToHexInput = ref('')
  const parsedParams = ref<ParsedParam[]>([])
  const parsedParamsFromHex = ref<ParsedParam[]>([])
  const parsedCommandIdFromHex = ref<string>('')

  const selectedParamsFromInput = ref<ParsedParam[]>([])

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

  const isSpecialCommandFromHex = computed(() => {
    if (parsedParamsFromHex.value.length <= 1)
      return false
    const id = Number(parsedCommandIdFromHex.value)
    return settingsStore.isSpecialCommand(id)
  })

  const hexResult = computed(() =>
    hexToFormatInput.value.trim()
      ? parseHexToParams(hexToFormatInput.value.trim())
      : null,
  )

  const commandId = computed(() => hexResult.value?.commandId ?? '')
  const hexToFormatError = computed(() => hexResult.value?.error ?? '')

  const isSpecialCommand = computed(() => {
    if (parsedParams.value.length <= 1)
      return false
    const id = Number(commandId.value)
    return settingsStore.isSpecialCommand(id)
  })

  watch(
    hexToFormatInput,
    (val: string) => {
      parsedParams.value = val.trim()
        ? parseHexToParams(val.trim()).params
        : []
    },
    { immediate: true },
  )

  const selectedParams = ref<ParsedParam[]>([])

  const leftFilteredParams = computed(() => {
    if (isSpecialCommand.value) {
      return selectedParams.value.filter(p => p.selected && p.index > 1)
    }
    return selectedParams.value.filter(p => p.selected)
  })

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

  const hasPacketTextInput = computed(() => !!commandId.value)
  const hasFormatInput = computed(() => formatToHexInput.value.trim().length > 0)

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

  const leftRebuiltPacketText = computed(() => {
    if (!hexToFormatOutput.value)
      return ''
    const parsed = parseFormatToParams(hexToFormatOutput.value)
    if (!parsed)
      return ''
    return buildPacketHex(parsed.commandId, parsed.params)
  })

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

  const rightFilteredParams = computed(() => {
    if (isSpecialCommandFromHex.value) {
      return selectedParamsFromInput.value.filter(p => p.selected && p.index > 1)
    }
    return selectedParamsFromInput.value.filter(p => p.selected)
  })

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

  const rightRebuiltPacketText = computed(() => {
    if (!rightFormatOutput.value)
      return ''
    const parsed = parseFormatToParams(rightFormatOutput.value)
    if (!parsed)
      return ''
    return buildPacketHex(parsed.commandId, parsed.params)
  })

  function handleHexToFormatReset() {
    hexToFormatInput.value = ''
    parsedParams.value = []
    selectedParams.value = []
  }

  function handleFormatToHexReset() {
    formatToHexInput.value = ''
    parsedCommandIdFromHex.value = ''
    parsedParamsFromHex.value = []
    selectedParamsFromInput.value = []
  }

  function selectAllLeftParams() {
    selectedParams.value.forEach(p => (p.selected = true))
    selectedParams.value = [...selectedParams.value]
  }

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

  function selectAllRightParams() {
    selectedParamsFromInput.value.forEach(p => (p.selected = true))
    selectedParamsFromInput.value = [...selectedParamsFromInput.value]
  }

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
