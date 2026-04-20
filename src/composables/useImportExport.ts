import type { AnalysisResult, ExportData, HexByteSize, InputEntry } from '@/types'
import type { ImportFormat } from '@/types/analysis'
import { ref } from 'vue'
import {
  cleanHex,
  downloadJson,
  separatePackets,
} from '@/utils'

/**
 * 将十六进制字符串数组转换为输入条目
 * @param hexStrings - 十六进制字符串数组
 * @returns 输入条目数组
 */
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

/**
 * 从导出数据恢复分析状态
 * @param data - 导出的数据对象
 * @returns 恢复后的状态对象
 */
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

/**
 * 导入的数据结构接口
 */
interface ImportedData {
  packets?: Array<{ raw?: string, label?: string }>
  diffs?: Array<unknown>
}

/**
 * 解析JSON格式的分析数据
 * @param json - JSON对象
 * @returns 导入数据或null
 */
function parseJsonAnalysis(json: Record<string, unknown>): ImportedData | null {
  if (json.packets && Array.isArray(json.packets))
    return json as ImportedData
  return null
}

/**
 * 解析JSON格式的十六进制数组
 * @param json - JSON数组
 * @returns 十六进制字符串数组或null
 */
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

/**
 * 解析纯文本格式的十六进制
 * @param content - 文本内容
 * @returns 十六进制字符串数组或null
 */
function parsePlainTextHex(content: string): string[] | null {
  const lines = content.split(/[\r\n]+/).map(l => l.trim()).filter(l => l.length > 0)
  if (lines.length > 0 && lines.every(l => /^[0-9a-f\s]+$/i.test(l)))
    return lines.map(l => l.replace(/\s/g, ''))
  return null
}

/**
 * 导入导出 composable
 * 处理文件的导入和导出功能
 * @returns 导入导出相关的状态和方法
 */
export function useImportExport() {
  /** 警告消息 */
  const alertMessage = ref('')
  /** 是否显示警告弹窗 */
  const showAlertModal = ref(false)

  /**
   * 解析导入的文件内容
   * 自动检测文件格式（analysis/hex/unknown）
   * @param content - 文件内容字符串
   * @returns 格式和数据对象
   */
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

  /**
   * 处理导入操作
   * @param content - 文件内容
   * @param onAnalysisLoad - 分析数据加载回调
   * @param onHexInputs - 十六进制输入加载回调
   */
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

  /**
   * 处理导出操作
   * @param result - 分析结果
   * @param hexByteSize - 十六进制字节大小
   * @returns 是否导出成功
   */
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

  /**
   * 关闭警告弹窗
   */
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
