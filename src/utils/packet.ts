import type { ParsedPacket } from '@/types'

export function separatePackets(packets: ParsedPacket[]) {
  return {
    receivePackets: packets.filter(p => p.type === 'receive'),
    sendPacket: packets.find(p => p.type === 'send'),
  }
}

export function formatParamCount(packets: ParsedPacket[]): string {
  if (packets.length === 0)
    return '0'
  const counts = packets.map(p => p.params.length)
  const min = Math.min(...counts)
  const max = Math.max(...counts)
  return min === max ? String(min) : `${min}-${max}`
}
