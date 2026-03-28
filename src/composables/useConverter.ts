import { ref, computed } from 'vue'
import { hexToDecimal, decimalToHex, cleanHex } from '@/utils/hex'

export type ConvertDirection = 'hexToFormat' | 'formatToHex'

export interface ParsedParam {
  index: number
  value: string
  selected: boolean
}

export function useConverter() {
  const hexInput = ref('')
  const outputResult = ref('')
  const showResult = ref(false)
  const convertDirection = ref<ConvertDirection>('hexToFormat')

  const parsedParams = ref<ParsedParam[]>([])
  const commandId = ref('')
  const paramCount = ref(0)

  const filteredParams = computed(() => parsedParams.value.filter(p => p.selected))

  const finalOutput = computed(() => {
    if (convertDirection.value === 'hexToFormat') {
      const selectedParams = filteredParams.value
      if (selectedParams.length === 0) {
        return '请至少选择一个参数'
      }
      return `{${commandId.value},${selectedParams.length},${selectedParams.map(p => p.value).join(',')}}`
    }
    return outputResult.value
  })

  function parseHexToParams(hex: string): { commandId: string; params: ParsedParam[] } | null {
    const cleaned = cleanHex(hex)
    if (cleaned.length < 42) {
      return null
    }

    const cmdId = cleaned.substring(10, 18)
    const cmdIdDec = hexToDecimal(cmdId)

    const paramsHex = cleaned.substring(42)
    const params: ParsedParam[] = []
    for (let i = 0; i < paramsHex.length; i += 8) {
      const chunk = paramsHex.substring(i, i + 8)
      if (chunk.length === 8) {
        params.push({
          index: params.length + 1,
          value: String(hexToDecimal(chunk)),
          selected: true
        })
      }
    }

    return { commandId: String(cmdIdDec), params }
  }

  function convertHexToFormat(hex: string): string {
    const parsed = parseHexToParams(hex)
    if (!parsed) {
      return '发包文本长度不足'
    }

    if (parsed.params.length === 0) {
      return '无参数数据'
    }

    commandId.value = parsed.commandId
    parsedParams.value = parsed.params
    paramCount.value = parsed.params.length

    return `{${parsed.commandId},${parsed.params.length},${parsed.params.map(p => p.value).join(',')}}`
  }

  function convertFormatToHex(format: string): string {
    const match = format.match(/^\{(\d+),(\d+),(\d+(?:,\d+)*)\}$/)
    if (!match) {
      return '格式错误，请输入 {commandId,paramCount,param1,param2,...}'
    }

    const [, cmdId, paramCountStr, paramsStr] = match
    const params = paramsStr.split(',').map(p => parseInt(p, 10))

    if (params.length !== parseInt(paramCountStr, 10)) {
      return '参数数量不匹配'
    }

    const header = '00000035'
    const version = '31'
    const cmdIdHex = decimalToHex(parseInt(cmdId, 10), 8)
    const mimiId = '00000000'
    const sequence = '00000000'
    const paramCnt = decimalToHex(params.length, 8)

    let paramHex = ''
    params.forEach(p => {
      paramHex += decimalToHex(p, 8)
    })

    return header + version + cmdIdHex + mimiId + sequence + paramCnt + paramHex
  }

  function handleConvert() {
    if (!hexInput.value.trim()) return

    if (convertDirection.value === 'hexToFormat') {
      outputResult.value = convertHexToFormat(hexInput.value)
    } else {
      outputResult.value = convertFormatToHex(hexInput.value.trim())
    }
    showResult.value = true
  }

  function handleReset() {
    hexInput.value = ''
    outputResult.value = ''
    showResult.value = false
    parsedParams.value = []
    commandId.value = ''
    paramCount.value = 0
  }

  function selectAll() {
    parsedParams.value.forEach(p => p.selected = true)
  }

  function deselectAll() {
    parsedParams.value.forEach(p => p.selected = false)
  }

  return {
    hexInput,
    outputResult,
    showResult,
    convertDirection,
    parsedParams,
    commandId,
    paramCount,
    filteredParams,
    finalOutput,
    handleConvert,
    handleReset,
    selectAll,
    deselectAll
  }
}
