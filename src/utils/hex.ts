import type {
  BodySegment,
  HeaderField,
  HexByteSize,
  ParamItem,
} from '@/types'
import { SPECIAL_COMMAND_ID } from '@/constants'

/**
 * 十六进制字符到二进制字符串的映射表
 * 用于将每个十六进制字符转换为4位二进制数
 */
const HEX_TO_BINARY_MAP: Record<string, string> = {
  0: '0000',
  1: '0001',
  2: '0010',
  3: '0011',
  4: '0100',
  5: '0101',
  6: '0110',
  7: '0111',
  8: '1000',
  9: '1001',
  A: '1010',
  B: '1011',
  C: '1100',
  D: '1101',
  E: '1110',
  F: '1111',
}

/**
 * 将十六进制字符串转换为二进制字符串
 * @param hex - 十六进制字符串（如 "FF"）
 * @returns 二进制字符串（如 "11111111"）
 */
export function hexToBinary(hex: string): string {
  let result = ''
  for (let i = 0; i < hex.length; i++) {
    result += HEX_TO_BINARY_MAP[hex[i]] || '0000'
  }
  return result
}

/**
 * 将十六进制字符串转换为十进制数字
 * @param hex - 十六进制字符串
 * @returns 十进制数字
 */
export function hexToDecimal(hex: string): number {
  return Number.parseInt(hex, 16)
}

/**
 * 将十进制数字转换为十六进制字符串，并补齐到指定长度
 * @param num - 十进制数字
 * @param length - 目标十六进制字符串长度
 * @returns 转换后的十六进制字符串（如 decimalToHex(255, 2) 返回 "FF"）
 */
export function decimalToHex(num: number, length: number): string {
  return num.toString(16).toUpperCase().padStart(length, '0')
}

/**
 * 清理输入的十六进制字符串，移除非十六进制字符并转换为大写
 * @param raw - 原始输入字符串
 * @returns 清理后的十六进制字符串
 */
export function cleanHex(raw: string): string {
  return raw.replace(/[^0-9a-f]/gi, '').toUpperCase()
}

/**
 * 解析特殊格式的输入
 * 支持格式如 "42023, 0x00000001" 或 "42023 0x00000001"
 * @param raw - 原始输入字符串
 * @returns 解析后的命令ID和参数字符串，或 null 如果格式不匹配
 */
export function parseSpecialFormat(raw: string): { commandId: string, params: string } | null {
  const match = raw.match(/^(\d+)[,\s]+0x([0-9a-fA-F]+)$/)
  if (match) {
    const commandId = Number.parseInt(match[1], 10)
    return {
      commandId: decimalToHex(commandId, 8),
      params: match[2].toUpperCase().padStart(8, '0'),
    }
  }
  return null
}

/**
 * 将输入转换为标准十六进制封包格式
 * 如果是特殊格式则构建完整封包，否则清理十六进制字符
 * @param raw - 原始输入字符串
 * @param headerLength - 封包头部长度
 * @returns 转换后的十六进制字符串
 */
export function parseRawToHex(raw: string, headerLength: number): string {
  const specialParsed = parseSpecialFormat(raw)
  if (specialParsed) {
    const paramsHex = specialParsed.params
    const packetLength = headerLength + paramsHex.length
    return `${decimalToHex(packetLength, 8)}00${specialParsed.commandId}0000000000000000${paramsHex}`
  }
  return cleanHex(raw)
}

/**
 * 创建十六进制值对象（包含十六进制、十进制、二进制表示）
 * @param hex - 十六进制字符串
 * @returns 包含 hex, decimal, binary 的对象
 */
export function createHexValue(hex: string): Omit<ParamItem, 'index'> {
  return {
    hex,
    decimal: hexToDecimal(hex),
    binary: hexToBinary(hex),
  }
}

/**
 * 创建头部字段对象
 * @param name - 字段名称
 * @param hex - 十六进制字符串
 * @returns HeaderField 对象
 */
export function createHeaderField(name: string, hex: string): HeaderField {
  return {
    name,
    ...createHexValue(hex),
  }
}

/**
 * 创建消息体片段对象
 * @param index - 片段索引
 * @param hex - 十六进制字符串
 * @returns BodySegment 对象
 */
export function createBodySegment(index: number, hex: string): BodySegment {
  return {
    index,
    ...createHexValue(hex),
  }
}

/**
 * 创建参数字缀象
 * @param index - 参数索引
 * @param hex - 十六进制字符串
 * @returns ParamItem 对象
 */
export function createParamItem(index: number, hex: string): ParamItem {
  return {
    index,
    ...createHexValue(hex),
  }
}

/**
 * 不同字节大小对应的最大十进制位数
 * 用于格式化显示时的对齐
 */
const MAX_DIGITS: Record<number, number> = { 1: 2, 2: 3, 4: 5 }

/**
 * 格式化十六进制值为十进制字符串
 * 根据字节大小将十六进制分段转换为十进制并对齐
 * @param hex - 十六进制字符串
 * @param hexByteSize - 字节大小（1/2/4/8）
 * @param commandId - 可选的命令ID，如果是特殊命令则直接返回原值
 * @returns 格式化后的十进制字符串
 */
export function formatValue(hex: string, hexByteSize: HexByteSize, commandId?: number): string {
  if (commandId === SPECIAL_COMMAND_ID)
    return hex

  const maxDigits = MAX_DIGITS[hexByteSize] ?? 0
  const parts: string[] = []
  for (let i = 0; i < hex.length; i += hexByteSize) {
    const num = Number.parseInt(hex.slice(i, i + hexByteSize), 16)
    parts.push(maxDigits ? num.toString().padEnd(maxDigits, '\u00A0') : String(num))
  }
  return parts.join('\u00A0')
}

/**
 * 获取差异高亮的CSS类名
 * @param packetIdx - 数据包索引（偶数/奇数决定颜色）
 * @param paramIdx - 参数索引
 * @param diffIndexSet - 差异索引集合
 * @returns Tailwind CSS 类名
 */
export function getHighlightClass(
  packetIdx: number,
  paramIdx: number,
  diffIndexSet: Set<number>,
): string {
  if (!diffIndexSet.has(paramIdx))
    return 'bg-green-100 text-green-700'
  return packetIdx % 2 === 0
    ? 'bg-red-100 text-red-600'
    : 'bg-blue-100 text-blue-600'
}

/**
 * 获取占位符字符串
 * 用于空值显示时的占位符
 * @param hexByteSize - 字节大小
 * @returns 多个连字符组成的占位符字符串
 */
export function getPlaceholder(hexByteSize: HexByteSize): string {
  const maxDigits = MAX_DIGITS[hexByteSize] ?? 0
  if (maxDigits === 0) {
    return '--'
  }
  const partCount = 8 / hexByteSize
  const placeholder = maxDigits > 0 ? '--'.padEnd(maxDigits, '\u00A0') : '--'
  return Array.from({ length: partCount }, () => placeholder).join('\u00A0')
}
