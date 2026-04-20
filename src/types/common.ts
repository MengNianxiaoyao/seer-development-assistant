/**
 * 十六进制值的基础接口
 * 包含同一值的不同进制表示形式
 */
export interface HexValue {
  hex: string // 十六进制表示（如 "FF"）
  decimal: number // 十进制表示（如 255）
  binary: string // 二进制表示（如 "11111111"）
}

/**
 * 头部字段接口
 * 继承 HexValue 并包含字段名称
 */
export interface HeaderField extends HexValue {
  name: string // 字段显示名称
}

/**
 * 参数字apun
 * 继承 HexValue 并包含参数索引
 */
export interface ParamItem extends HexValue {
  index: number // 参数位置索引（从1开始）
}

/**
 * 消息体片段接口
 * 继承 HexValue 并包含片段索引
 */
export interface BodySegment extends HexValue {
  index: number // 片段位置索引
}

/**
 * 十六进制字节大小类型
 * 表示每个参数占用的字节数
 */
export type HexByteSize = 1 | 2 | 4 | 8

/**
 * 数据包类型
 * receive: 接收的数据包（收包）
 * send: 发送的数据包（发包）
 */
export type PacketType = 'receive' | 'send'
