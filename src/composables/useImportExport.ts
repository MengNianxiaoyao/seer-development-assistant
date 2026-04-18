import type { AnalysisResult, ExportData, HexByteSize, InputEntry } from '@/types'
import type { ImportFormat } from '@/types/analysis'
import { ref } from 'vue'
import {
  cleanHex,
  downloadJson,
  separatePackets,
} from '@/utils'

function parseHexStrings(hexStrings: string[]): InputEntry[] {
  return hexStrings
    .map(hex => cleanHex(hex))
    .filter(hex => hex.length > 0)
    .map((hex, idx) => ({
      id: idx + 1,
      label: `收包${idx + 1}`,
      value: hex,
      enabled: true,
      order: idx + 1,
    }))
}

function restoreFromExportData(data: ExportData): {
  inputs: InputEntry[]
  sendPacket: string
  result: AnalysisResult
  hexByteSize: HexByteSize
} {
  const { receivePackets, sendPacket: sendPacketData } = separatePackets(data.packets)

  const inputs: InputEntry[]
    = receivePackets.length > 0
      ? receivePackets.map((p, idx) => ({
          id: idx + 1,
          label: p.label.startsWith('收包') ? p.label : `收包${idx + 1}`,
          value: p.raw,
          enabled: true,
          order: idx + 1,
        }))
      : [
          { id: 1, label: '收包1', value: '', enabled: true, order: 1 },
          { id: 2, label: '收包2', value: '', enabled: true, order: 2 },
          { id: 3, label: '收包3', value: '', enabled: true, order: 3 },
        ]

  return {
    inputs,
    sendPacket: sendPacketData?.raw ?? '',
    result: {
      packets: data.packets,
      diffs: data.diffs,
      diffCount: data.diffCount,
      totalParams: data.totalParams,
      validPackets: data.validPackets,
    },
    hexByteSize: data.hexByteSize ?? 8,
  }
}

interface ImportedData {
  packets?: Array<{ raw?: string, label?: string }>
  diffs?: Array<unknown>
}

function parseJsonAnalysis(json: Record<string, unknown>): ImportedData | null {
  if (json.packets && Array.isArray(json.packets))
    return json as ImportedData
  return null
}

function parseJsonHexArray(json: unknown[]): string[] | null {
  const hexStrings: string[] = []
  for (const item of json) {
    if (typeof item === 'string') {
      hexStrings.push(item)
    }
    else if (typeof item === 'object' && item !== null) {
      const obj = item as Record<string, unknown>
      if (obj.hex)
        hexStrings.push(String(obj.hex))
      else if (obj.data)
        hexStrings.push(String(obj.data))
      else if (obj.value)
        hexStrings.push(String(obj.value))
      else if (obj.raw)
        hexStrings.push(String(obj.raw))
      else return null
    }
    else {
      return null
    }
  }
  return hexStrings.length > 0 ? hexStrings : null
}

function parsePlainTextHex(content: string): string[] | null {
  const lines = content.split(/[\r\n]+/).map(l => l.trim()).filter(l => l.length > 0)
  if (lines.length > 0 && lines.every(l => /^[0-9a-f\s]+$/i.test(l)))
    return lines.map(l => l.replace(/\s/g, ''))
  return null
}

export function useImportExport() {
  const alertMessage = ref('')
  const showAlertModal = ref(false)

  function parseImportedFile(content: string): { format: ImportFormat, data: ImportedData | string[] } {
    try {
      const json = JSON.parse(content)
      const analysisResult = parseJsonAnalysis(json)
      if (analysisResult)
        return { format: 'analysis', data: analysisResult }

      if (Array.isArray(json)) {
        const hexResult = parseJsonHexArray(json)
        if (hexResult)
          return { format: 'hex', data: hexResult }
      }

      if (typeof json === 'string')
        return { format: 'hex', data: [json] }

      return { format: 'unknown', data: [] }
    }
    catch {
      const hexResult = parsePlainTextHex(content)
      if (hexResult)
        return { format: 'hex', data: hexResult }
      return { format: 'unknown', data: [] }
    }
  }

  function handleImport(
    content: string,
    onAnalysisLoad: (state: {
      inputs: InputEntry[]
      sendPacket: string
      result: AnalysisResult
      hexByteSize: HexByteSize
    }) => void,
    onHexInputs: (inputs: InputEntry[]) => void,
  ) {
    const { format, data } = parseImportedFile(content)

    if (format === 'analysis' && !Array.isArray(data)) {
      const state = restoreFromExportData(data as unknown as ExportData)
      onAnalysisLoad(state)
    }
    else if (format === 'hex' && Array.isArray(data)) {
      onHexInputs(parseHexStrings(data as string[]))
    }
    else {
      alertMessage.value = '无法识别的文件格式'
      showAlertModal.value = true
    }
  }

  function handleExport(result: AnalysisResult | null, hexByteSize: HexByteSize): boolean {
    if (!result) {
      alertMessage.value = '请先进行分析'
      showAlertModal.value = true
      return false
    }

    const exportData: ExportData = {
      exportTime: new Date().toISOString(),
      validPackets: result.validPackets,
      totalParams: result.totalParams,
      diffCount: result.diffCount,
      hexByteSize,
      packets: result.packets,
      diffs: result.diffs,
    }
    downloadJson(exportData, `seer-analysis-${Date.now()}.json`)
    return true
  }

  function closeAlertModal() {
    showAlertModal.value = false
    alertMessage.value = ''
  }

  return {
    alertMessage,
    showAlertModal,
    handleImport,
    handleExport,
    closeAlertModal,
    parseImportedFile,
  }
}
