import type { ParsedPacket } from '@/types'

/**
 * 将数据包数组分类为接收包和发送包
 * @param packets - 数据包数组
 * @returns 包含 receivePackets 和 sendPacket 的对象
 */
export function separatePackets(packets: ParsedPacket[]) {
  return {
    receivePackets: packets.filter(p => p.type === 'receive'),
    sendPacket: packets.find(p => p.type === 'send'),
  }
}

/**
 * 格式化参数量显示范围
 * @param packets - 数据包数组
 * @returns 参数量范围字符串（如 "8" 或 "6-10"）
 */
export function formatParamCount(packets: ParsedPacket[]): string {
  if (packets.length === 0)
    return '0'
  const counts = packets.map(p => p.params.length)
  const min = Math.min(...counts)
  const max = Math.max(...counts)
  return min === max ? String(min) : `${min}-${max}`
}
