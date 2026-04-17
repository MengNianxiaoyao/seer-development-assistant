import type { HexByteSize } from './common'
import type { DiffResult, ParsedPacket } from './packet'

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
  order: number
}

export interface ValidationError {
  label: string
  reasons: string[]
}

export interface ExportData {
  exportTime: string
  validPackets: number
  totalParams: number
  diffCount: number
  hexByteSize: HexByteSize
  packets: ParsedPacket[]
  diffs: DiffResult[]
}

export interface StatusInfo {
  validPackets: number
  paramCount: string
  diffCount: number
  analyzed: boolean
  loading: boolean
}

export type ImportFormat = 'analysis' | 'hex' | 'unknown'

export interface ImportResult {
  format: ImportFormat
  data: unknown
}
