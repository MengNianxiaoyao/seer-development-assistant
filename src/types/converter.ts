export interface ParsedParam {
  index: number
  value: string
  selected: boolean
}

export interface ConverterResult {
  output: string
  error?: string
}
