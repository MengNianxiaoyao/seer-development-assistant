export interface HexValue {
  hex: string;
  decimal: number;
  binary: string;
}

export interface HeaderField extends HexValue {
  name: string;
}

export interface PacketHeader {
  packetLength: HeaderField;
  version: HeaderField;
  commandId: HeaderField;
  mimiId: HeaderField;
  sequence: HeaderField;
  paramCount: HeaderField;
}

export interface ParamItem extends HexValue {
  index: number;
}

export interface BodySegment extends HexValue {
  index: number;
}

export interface ParsedPacket {
  id: number;
  label: string;
  raw: string;
  header: PacketHeader;
  params: ParamItem[];
  isGrouped: boolean;
  groupSize: number;
  bodySegments1?: BodySegment[];
  bodySegments2?: BodySegment[];
  bodySegments4?: BodySegment[];
}

export interface DiffResult extends HexValue {
  index: number;
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
  packets: ParsedPacket[];
  diffs: DiffResult[];
}

export type DisplayFormat = "hex" | "decimal" | "binary";
