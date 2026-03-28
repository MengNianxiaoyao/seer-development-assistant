import { ref } from 'vue'
import { useHexParser } from './useHexParser'
import { decimalToHex, makeHeaderField, findDifferences, downloadJson } from '@/utils/hex'
import type { InputEntry, DisplayFormat, ValidationError, ParsedPacket, AnalysisResult, ParamItem, ExportData } from '@/types'

const DEFAULT_INPUTS: InputEntry[] = [
  { id: 1, label: '收包1', value: '', enabled: true },
  { id: 2, label: '收包2', value: '', enabled: true },
  { id: 3, label: '收包3', value: '', enabled: true },
]

export function useAnalysis() {
  const { result, isAnalyzed, validate, analyze, reset: resetParser } = useHexParser()

  const inputs = ref<InputEntry[]>([...DEFAULT_INPUTS.map(i => ({ ...i }))])
  const sendPacket = ref('')
  const displayFormat = ref<DisplayFormat>('hex')
  const isLoading = ref(false)

  const validationErrors = ref<ValidationError[]>([])
  const showValidationModal = ref(false)
  const alertMessage = ref('')
  const showAlertModal = ref(false)

  function handleAnalyze() {
    const dataInputs = inputs.value.filter(i => i.value.trim())
    const hasSendPacket = sendPacket.value.trim().length > 0

    if (dataInputs.length === 0 && !hasSendPacket) return

    displayFormat.value = 'hex'
    isLoading.value = true

    const allInputs = [...dataInputs.map(i => ({ raw: i.value, enabled: i.enabled, label: i.label }))]

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
    inputs.value = DEFAULT_INPUTS.map(i => ({ ...i }))
    sendPacket.value = ''
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

    const exportData: ExportData = {
      exportTime: new Date().toISOString(),
      validPackets: result.value.validPackets,
      totalParams: result.value.totalParams,
      diffCount: result.value.diffCount,
      packets: result.value.packets.map(p => ({
        id: p.id,
        raw: p.raw,
        label: p.label,
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

    downloadJson(exportData, `seer-analysis-${Date.now()}.json`)
  }

  function parseJsonToPackets(data: any): ParsedPacket[] {
    return data.packets.map((p: any, idx: number) => ({
      id: idx + 1,
      label: p.label || `收包${idx + 1}`,
      raw: p.raw || '',
      header: {
        packetLength: makeHeaderField('封包长度', decimalToHex(p.header?.packetLength ?? 0, 8)),
        version: makeHeaderField('版本号', decimalToHex(p.header?.version ?? 0, 2)),
        commandId: makeHeaderField('命令号', decimalToHex(p.header?.commandId ?? 0, 8)),
        mimiId: makeHeaderField('米米号', decimalToHex(p.header?.mimiId ?? 0, 8)),
        sequence: makeHeaderField('序列号', decimalToHex(p.header?.sequence ?? 0, 8)),
        paramCount: makeHeaderField('参数数量', decimalToHex(p.header?.paramCount ?? 0, 8)),
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
  }

  function loadPacketsToState(packets: ParsedPacket[]) {
    // Separate send packet from receive packets
    const sendPacketData = packets.find(p => p.label === '发包')
    const receivePackets = packets.filter(p => p.label !== '发包')

    if (sendPacketData) {
      sendPacket.value = sendPacketData.raw
    }

    // Use receive packets for diff calculation (only if >= 2 packets)
    const diffs = receivePackets.length >= 2 ? findDifferences(receivePackets) : []
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

    // Set inputs from receive packets only
    if (receivePackets.length > 0) {
      inputs.value = receivePackets.map((p, idx) => ({
        id: idx + 1,
        label: p.label.startsWith('收包') ? p.label : `收包${idx + 1}`,
        value: p.raw,
        enabled: true,
      }))
    } else {
      // If no receive packets, use default inputs
      inputs.value = [...DEFAULT_INPUTS.map(i => ({ ...i }))]
    }
  }

  function handleImportFile(hexStringsOrJson: string[]) {
    if (hexStringsOrJson.length === 1) {
      try {
        const data = JSON.parse(hexStringsOrJson[0])
        if (data.packets && Array.isArray(data.packets)) {
          const packets = parseJsonToPackets(data)
          loadPacketsToState(packets)
          return
        }
      } catch {
        // Not a parsed result, continue as hex strings
      }
    }

    inputs.value = hexStringsOrJson.map((hex, idx) => ({
      id: idx + 1,
      label: `收包${idx + 1}`,
      value: hex,
      enabled: true,
    }))

    displayFormat.value = 'hex'
    handleAnalyze()
  }

  function handleImportError() {
    alertMessage.value = 'JSON 解析失败，请检查文件格式'
    showAlertModal.value = true
  }

  function closeValidationModal() {
    showValidationModal.value = false
    validationErrors.value = []
  }

  function closeAlertModal() {
    showAlertModal.value = false
    alertMessage.value = ''
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
    handleExport,
    handleImportFile,
    handleImportError,
    closeValidationModal,
    closeAlertModal,
  }
}
