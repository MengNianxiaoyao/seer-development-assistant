import type {
  BodySegment,
  HeaderField,
  PacketType,
  ParamItem,
} from './common'

/**
 * 数据包头部信息
 * 包含封包的元数据字段
 */
export interface PacketHeader {
  packetLength: HeaderField // 封包长度
  version: HeaderField // 版本号
  commandId: HeaderField // 命令号
  mimiId: HeaderField // 米米号（用户ID）
  sequence: HeaderField // 序列号
  paramCount: HeaderField // 参数数量
}

/**
 * 解析后的数据包
 * 包含完整的封包数据和分析结果
 */
export interface ParsedPacket {
  id: number // 数据包唯一标识
  label: string // 显示标签（如 "收包1"、"发包"）
  type: PacketType // 数据包类型
  raw: string // 原始十六进制字符串
  header: PacketHeader // 解析后的头部信息
  params: ParamItem[] // 参数列表
  isGrouped: boolean // 是否为分组数据
  groupSize: number // 分组大小
  bodySegments1?: BodySegment[] // 1字节分组的片段
  bodySegments2?: BodySegment[] // 2字节分组的片段
  bodySegments4?: BodySegment[] // 4字节分组的片段
}

/**
 * 差异结果
 * 表示某个参数位置在多个数据包之间的差异
 */
export interface DiffResult extends ParamItem {
  index: number // 差异位置的参数索引
}

/**
 * 数据包显示项
 * 用于界面展示的数据包数据结构
 */
export interface PacketDisplayItem {
  id: number
  label: string
  raw: string
  params: ParamItemWithFormat[]
  type: PacketType
}

/**
 * 带格式化值的参数项
 * 包含原始参数和格式化后的显示值
 */
export interface ParamItemWithFormat extends ParamItem {
  formatted: string // 格式化后的十进制字符串
}
