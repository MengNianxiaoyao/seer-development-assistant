import type { ParsedPacket } from '@/types'

export function getReceivePackets(packets: ParsedPacket[]): ParsedPacket[] {
  return packets.filter(packet => packet.label !== '发包')
}

export function getSendPacket(
  packets: ParsedPacket[],
): ParsedPacket | undefined {
  return packets.find(packet => packet.label === '发包')
}

export function formatParamCount(packets: ParsedPacket[]): string {
  if (!packets.length)
    return '0'
  const counts = packets.map(packet => packet.params.length)
  const min = Math.min(...counts)
  const max = Math.max(...counts)
  if (min === max)
    return String(min)
  return `${min}-${max}`
}
