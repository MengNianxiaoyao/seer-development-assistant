import type { ParsedParam } from '@/types'
import { computed, ref, watch } from 'vue'
import { HEADER_LENGTH } from '@/constants'
import { useSettingsStore } from '@/stores/settings'
import { cleanHex, decimalToHex, hexToDecimal } from '@/utils'

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

  const filteredParams = computed(() => {
    if (isSpecialCommand.value) {
      return parsedParams.value.filter(p => p.selected && p.index > 1)
    }
    return parsedParams.value.filter(p => p.selected)
  })

  const hexToFormatOutput = computed(() => {
    if (!commandId.value)
      return ''
    const count = filteredParams.value.length
    const params = filteredParams.value.map(p => p.value).join(',')
    if (isSpecialCommand.value) {
      return `{${commandId.value},${count},${params}}`
    }
    return params ? `{${commandId.value},${params}}` : `{${commandId.value}}`
  })

  const formatToHexOutput = computed(() => {
    const parsed = parseFormatToParams(formatToHexInput.value)
    if (!parsed)
      return ''
    return buildPacketHex(parsed.commandId, parsed.params)
  })

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

  function handleHexToFormatReset() {
    hexToFormatInput.value = ''
    parsedParams.value = []
  }

  return {
    hexToFormatInput,
    parsedParams,
    commandId,
    filteredParams,
    isSpecialCommand,
    hexToFormatOutput,
    hexToFormatError,
    hasHexToFormatResult: computed(() => !!commandId.value),
    handleHexToFormatReset,
    selectAll: () => parsedParams.value.forEach(p => (p.selected = true)),
    deselectAll: () => {
      if (isSpecialCommand.value) {
        parsedParams.value.forEach((p) => {
          if (p.index === 1)
            p.selected = true
          else
            p.selected = false
        })
      }
      else {
        parsedParams.value.forEach(p => (p.selected = false))
      }
    },
    toggleParam: (idx: number) => {
      const p = parsedParams.value.find(p => p.index === idx)
      if (!p)
        return

      if (isSpecialCommand.value) {
        if (idx === 1 || (p.selected && filteredParams.value.length <= 1))
          return
      }
      else if (p.selected && filteredParams.value.length <= 1) {
        return
      }

      p.selected = !p.selected
    },
    formatToHexInput,
    formatToHexOutput,
    formatToHexError,
    hasFormatToHexResult: computed(
      () => formatToHexInput.value.trim().length > 0,
    ),
    handleFormatToHexReset: () => (formatToHexInput.value = ''),
  }
}
