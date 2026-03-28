import type { DisplayFormat, HeaderField, ParsedPacket, DiffResult } from "@/types"

export function hexToBinary(hex: string): string {
  return hex
    .split("")
    .map((c) => parseInt(c, 16).toString(2).padStart(4, "0"))
    .join("")
}

export function hexToDecimal(hex: string): number {
  return parseInt(hex, 16)
}

export function decimalToHex(num: number, length: number): string {
  return num.toString(16).toUpperCase().padStart(length, "0")
}

export function cleanHex(raw: string): string {
  return raw.replace(/[^0-9a-fA-F]/g, "").toUpperCase()
}

export function makeHeaderField(name: string, hex: string): HeaderField {
  return {
    name,
    hex,
    decimal: hexToDecimal(hex),
    binary: hexToBinary(hex),
  }
}

export function formatValue(hex: string, decimal: number, binary: string, fmt: DisplayFormat): string {
  switch (fmt) {
    case "decimal":
      return String(decimal)
    case "binary":
      return binary
    default:
      return hex
  }
}

export function getHighlightClass(packetIdx: number, paramIdx: number, diffIndexSet: Set<number>): string {
  if (!diffIndexSet.has(paramIdx)) return "bg-green-100 text-green-700"
  const colors = ["bg-red-100 text-red-600", "bg-blue-100 text-blue-600"]
  return colors[packetIdx % 2]
}

export function splitByGroupSize(
  hex: string,
  commandId: number = 0,
): { index: number; hex: string; binary: string }[] {
  const clean = cleanHex(hex)
  const groups: { index: number; hex: string; binary: string }[] = []
  
  // 42023 使用 2 位分组，其他使用 8 位分组
  const size = commandId === 42023 ? 2 : 8
  
  // 从位置42开始（跳过头部34字符 + 参数数量8字符），只显示参数
  let pos = 42
  let idx = 1

  while (pos + size <= clean.length) {
    const chunk = clean.substring(pos, pos + size).padEnd(size, "0")
    groups.push({
      index: idx,
      hex: chunk,
      binary: hexToBinary(chunk),
    })
    pos += size
    idx++
  }

  return groups
}

export function splitByGroupSizeFor45866(
  hex: string,
): { index: number; hex: string; binary: string }[] {
  const clean = cleanHex(hex)
  const groups: { index: number; hex: string; binary: string }[] = []
  
  // 45866命令从头部的34字符后开始就是参数
  let pos = 34
  let idx = 1

  while (pos + 8 <= clean.length) {
    const chunk = clean.substring(pos, pos + 8)
    groups.push({
      index: idx,
      hex: chunk,
      binary: hexToBinary(chunk),
    })
    pos += 8
    idx++
  }

  return groups
}

export function findDifferences(packets: ParsedPacket[]): DiffResult[] {
  if (packets.length < 2) return []

  const maxLen = Math.max(...packets.map((p) => p.params.length))
  const diffs: DiffResult[] = []

  for (let i = 0; i < maxLen; i++) {
    const values = packets.map((p) => p.params[i]?.hex ?? "")
    const first = values[0]
    if (values.some((v) => v !== first)) {
      const ref = packets[0].params[i]
      if (ref) {
        diffs.push({
          index: i + 1,
          hex: ref.hex,
          decimal: ref.decimal,
          binary: ref.binary,
        })
      }
    }
  }

  return diffs
}

export function copyToClipboard(text: string): Promise<boolean> {
  return navigator.clipboard.writeText(text).then(() => true).catch(() => false)
}

export function downloadJson(data: unknown, filename?: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename || `seer-analysis-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}
