import type { HexByteSize } from './common'
import type { DiffResult, ParsedPacket } from './packet'

/**
 * 分析结果
 * 包含数据包分析后的完整数据
 */
export interface AnalysisResult {
  packets: ParsedPacket[] // 解析后的数据包列表
  diffs: DiffResult[] // 差异结果列表
  diffCount: number // 差异数量
  totalParams: number // 总参数量
  validPackets: number // 有效数据包数量
}

/**
 * 输入条目
 * 表示用户输入的十六进制数据
 */
export interface InputEntry {
  id: number // 唯一标识
  label: string // 显示标签
  value: string // 十六进制值
  enabled: boolean // 是否启用
  order: number // 排序顺序
}

/**
 * 验证错误
 * 输入验证失败时的错误信息
 */
export interface ValidationError {
  label: string // 出错的输入标签
  reasons: string[] // 错误原因列表
}

/**
 * 导出数据
 * 用于保存和导出的完整分析数据
 */
export interface ExportData {
  exportTime: string // 导出时间
  validPackets: number // 有效数据包数
  totalParams: number // 总参数量
  diffCount: number // 差异数量
  hexByteSize: HexByteSize // 十六进制字节大小
  packets: ParsedPacket[] // 数据包列表
  diffs: DiffResult[] // 差异列表
}

/**
 * 状态信息
 * 界面状态栏显示的状态数据
 */
export interface StatusInfo {
  validPackets: number // 有效数据包数
  paramCount: string // 参数字符串
  diffCount: number // 差异数量
  analyzed: boolean // 是否已分析
  loading: boolean // 是否正在加载
}

/**
 * 导入格式类型
 * analysis: 完整的分析数据格式（JSON）
 * hex: 纯十六进制格式
 * unknown: 未知格式
 */
export type ImportFormat = 'analysis' | 'hex' | 'unknown'

/**
 * 导入结果
 * 解析导入数据的结果
 */
export interface ImportResult {
  format: ImportFormat // 检测到的格式类型
  data: unknown // 解析后的数据
}
