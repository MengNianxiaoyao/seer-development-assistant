import type { ParsedPacket } from '@/types'

export function getReceivePackets(packets: ParsedPacket[]): ParsedPacket[] {
  const result: ParsedPacket[] = []
  for (let i = 0; i < packets.length; i++) {
    if (packets[i].type === 'receive') {
      result.push(packets[i])
    }
  }
  return result
}

export function getSendPacket(
  packets: ParsedPacket[],
): ParsedPacket | undefined {
  for (let i = 0; i < packets.length; i++) {
    if (packets[i].type === 'send') {
      return packets[i]
    }
  }
  return undefined
}

export function separatePackets(packets: ParsedPacket[]): {
  receivePackets: ParsedPacket[]
  sendPacket: ParsedPacket | undefined
} {
  const receivePackets: ParsedPacket[] = []
  let sendPacket: ParsedPacket | undefined

  for (let i = 0; i < packets.length; i++) {
    const packet = packets[i]
    if (packet.type === 'send') {
      sendPacket = packet
    }
    else {
      receivePackets.push(packet)
    }
  }

  return { receivePackets, sendPacket }
}

export function formatParamCount(packets: ParsedPacket[]): string {
  const len = packets.length
  if (len === 0)
    return '0'

  let min = packets[0].params.length
  let max = min

  for (let i = 1; i < len; i++) {
    const count = packets[i].params.length
    if (count < min)
      min = count
    else if (count > max)
      max = count
  }

  return min === max ? String(min) : `${min}-${max}`
}
