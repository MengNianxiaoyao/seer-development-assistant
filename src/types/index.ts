export interface HeaderField {
  name: string;
  hex: string;
  decimal: number;
  binary: string;
}

export interface PacketHeader {
  packetLength: HeaderField;
  version: HeaderField;
  commandId: HeaderField;
  mimiId: HeaderField;
  sequence: HeaderField;
  paramCount: HeaderField;
}

export interface ParamItem {
  index: number;
  hex: string;
  decimal: number;
  binary: string;
}

export interface ParsedPacket {
  id: number;
  label: string;
  raw: string;
  header: PacketHeader;
  params: ParamItem[];
  isGrouped: boolean;
  groupSize: number;
  // Optional: body segment views split from the packet body (after header)
  bodySegments1?: { index: number; hex: string; decimal: number; binary: string }[]
  bodySegments2?: { index: number; hex: string; decimal: number; binary: string }[]
  bodySegments4?: { index: number; hex: string; decimal: number; binary: string }[]
}

export interface DiffResult {
  index: number;
  hex: string;
  decimal: number;
  binary: string;
}

export interface AnalysisResult {
  packets: ParsedPacket[];
  diffs: DiffResult[];
  diffCount: number;
  totalParams: number;
  validPackets: number;
}

export interface InputEntry {
  id: number;
  label: string;
  value: string;
  enabled: boolean;
}

export interface ValidationError {
  label: string;
  reasons: string[];
}

export interface ParsedParam {
  index: number;
  value: string;
  selected: boolean;
}

export interface ExportData {
  exportTime: string;
  validPackets: number;
  totalParams: number;
  diffCount: number;
  packets: Array<{
    id: number;
    raw: string;
    label: string;
    header: {
      packetLength: number;
      version: number;
      commandId: number;
      mimiId: number;
      sequence: number;
      paramCount: number;
    };
    params: Array<{
      index: number;
      hex: string;
      decimal: number;
      binary: string;
    }>;
  }>;
  diffs: Array<{
    index: number;
    hex: string;
    decimal: number;
    binary: string;
  }>;
}

export type DisplayFormat = "hex" | "decimal" | "binary";
export type BinaryGroupSize = 1 | 2 | 4 | 8;
export type ConvertDirection = 'hexToFormat' | 'formatToHex';
