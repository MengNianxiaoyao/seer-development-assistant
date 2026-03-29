import { ref, computed } from 'vue'
import { hexToDecimal, decimalToHex, cleanHex } from '@/utils/hex'
import type { ConvertDirection, ParsedParam } from '@/types'

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
        return commandId.value ? `{${commandId.value}}` : '请至少选择一个参数'
      }
      return `{${commandId.value},${selectedParams.map(p => p.value).join(',')}}`
    }
    return outputResult.value
  })

  function parseHexToParams(hex: string): { commandId: string; params: ParsedParam[] } | null {
    const cleaned = cleanHex(hex)
    // 封包头固定34位十六进制（17字节）
    if (cleaned.length < 34) {
      return null
    }

    // 命令号在第10-18位（封包长度8位 + 版本号2位 + 命令号8位）
    const cmdId = cleaned.substring(10, 18)
    const cmdIdDec = hexToDecimal(cmdId)

    // 封包体：从第34位开始
    const paramsHex = cleaned.substring(34)
    const params: ParsedParam[] = []
    // 通用转换：按4字节（8位十六进制）分段
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

    commandId.value = parsed.commandId
    parsedParams.value = parsed.params
    paramCount.value = parsed.params.length

    if (parsed.params.length === 0) {
      return `{${parsed.commandId}}`
    }

    return `{${parsed.commandId},${parsed.params.map(p => p.value).join(',')}}`
  }

  function convertFormatToHex(format: string): string {
    const match = format.match(/^\{(\d+),(\d+(?:,\d+)*)\}$/)
    if (!match) {
      return '格式错误，请输入 {commandId,param1,param2,...}'
    }

    const [, cmdId, paramsStr] = match
    const params = paramsStr.split(',').map(p => parseInt(p, 10))
    const paramHex = params.map(p => decimalToHex(p, 8)).join('')
    const packetLength = 17 + params.length * 4

    return decimalToHex(packetLength, 8) + '31' + decimalToHex(parseInt(cmdId, 10), 8) + '00000000' + '00000000' + paramHex
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
