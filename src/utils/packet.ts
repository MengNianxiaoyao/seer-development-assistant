import type { ParsedPacket } from '@/types'

export function getReceivePackets(packets: ParsedPacket[]): ParsedPacket[] {
  return packets.filter(p => p.label !== '发包')
}

export function getSendPacket(
  packets: ParsedPacket[],
): ParsedPacket | undefined {
  return packets.find(p => p.label === '发包')
}

export function formatParamCount(packets: ParsedPacket[]): string {
  if (!packets.length)
    return '0'
  const counts = packets.map(p => p.params.length)
  const min = Math.min(...counts)
  const max = Math.max(...counts)
  if (min === max)
    return String(min)
  return `${min}-${max}`
}
