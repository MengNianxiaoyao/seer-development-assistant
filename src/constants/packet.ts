export const HEADER_SPECS = [
  { name: '封包长度', length: 8 },
  { name: '版本号', length: 2 },
  { name: '命令号', length: 8 },
  { name: '米米号', length: 8 },
  { name: '序列号', length: 8 },
] as const

export const SPECIAL_COMMAND_ID = 42023

export const HEADER_LENGTH = 34

export const SEND_PACKET_LABEL = '发包'
