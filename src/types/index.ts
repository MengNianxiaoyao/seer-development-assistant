export interface HeaderField {
  name: string
  hex: string
  decimal: number
  binary: string
}

export interface PacketHeader {
  packetLength: HeaderField
  version: HeaderField
  commandId: HeaderField
  mimiId: HeaderField
  sequence: HeaderField
  paramCount: HeaderField
}

export interface ParamItem {
  index: number
  hex: string
  decimal: number
  binary: string
}

export interface ParsedPacket {
  id: number
  label: string
  raw: string
  header: PacketHeader
  params: ParamItem[]
  isGrouped: boolean
  groupSize: number
}

export interface DiffResult {
  index: number
  hex: string
  decimal: number
  binary: string
}

export interface AnalysisResult {
  packets: ParsedPacket[]
  diffs: DiffResult[]
  diffCount: number
  totalParams: number
  validPackets: number
}

export interface InputEntry {
  id: number
  label: string
  value: string
  enabled: boolean
}

export interface ValidationError {
  label: string
  reasons: string[]
}

export type DisplayFormat = 'hex' | 'decimal' | 'binary'
export type BinaryGroupSize = 1 | 2 | 4 | 8
