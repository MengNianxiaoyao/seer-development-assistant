export interface HexValue {
  hex: string
  decimal: number
  binary: string
}

export interface HeaderField extends HexValue {
  name: string
}

export interface ParamItem extends HexValue {
  index: number
}

export interface BodySegment extends HexValue {
  index: number
}

export type DisplayFormat = 'hex' | 'decimal' | 'binary'

export type PacketType = 'receive' | 'send'
