import type {
  BodySegment,
  HeaderField,
  PacketType,
  ParamItem,
} from './common'

export interface PacketHeader {
  packetLength: HeaderField
  version: HeaderField
  commandId: HeaderField
  mimiId: HeaderField
  sequence: HeaderField
  paramCount: HeaderField
}

export interface ParsedPacket {
  id: number
  label: string
  type: PacketType
  raw: string
  header: PacketHeader
  params: ParamItem[]
  isGrouped: boolean
  groupSize: number
  bodySegments1?: BodySegment[]
  bodySegments2?: BodySegment[]
  bodySegments4?: BodySegment[]
}

export interface DiffResult extends ParamItem {
  index: number
}

export interface PacketDisplayItem {
  id: number
  label: string
  raw: string
  params: ParamItemWithFormat[]
  type: PacketType
}

export interface ParamItemWithFormat extends ParamItem {
  formatted: string
}
