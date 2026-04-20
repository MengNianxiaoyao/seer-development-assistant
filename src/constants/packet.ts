/**
 * 数据包头部规格定义
 * 定义每个头部字段的名称和十六进制字符长度
 */
export const HEADER_SPECS = [
  { name: '封包长度', length: 8 }, // 封包总长度（8个十六进制字符 = 4字节）
  { name: '版本号', length: 2 }, // 协议版本号（2个十六进制字符 = 1字节）
  { name: '命令号', length: 8 }, // 命令ID（8个十六进制字符 = 4字节）
  { name: '米米号', length: 8 }, // 米米号/用户ID（8个十六进制字符 = 4字节）
  { name: '序列号', length: 8 }, // 序列号（8个十六进制字符 = 4字节）
] as const

/** 特殊命令ID，用于标识特定格式的数据包 */
export const SPECIAL_COMMAND_ID = 42023

/** 头部总长度（以十六进制字符计，不含参数计数字段） */
export const HEADER_LENGTH = 34

/** 发送数据包的默认标签 */
export const SEND_PACKET_LABEL = '发包'
