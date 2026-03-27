<script setup lang="ts">
import { ref, computed } from 'vue'
import Button from '@/components/Button.vue'
import Checkbox from '@/components/Checkbox.vue'

const hexInput = ref('')
const outputResult = ref('')
const showResult = ref(false)
const convertDirection = ref<'hexToFormat' | 'formatToHex'>('hexToFormat')

const parsedParams = ref<{ index: number; value: string; selected: boolean }[]>([])
const commandId = ref('')
const paramCount = ref(0)

function hexToDecimal(hex: string): number {
  return parseInt(hex, 16)
}

function decimalToHex(dec: number, length: number): string {
  return dec.toString(16).toUpperCase().padStart(length, '0')
}

function parseHexToParams(hex: string): { commandId: string; params: { index: number; value: string; selected: boolean }[] } | null {
  const cleanHex = hex.replace(/[^0-9a-fA-F]/g, '').toUpperCase()
  if (cleanHex.length < 42) {
    return null
  }

  const cmdId = cleanHex.substring(10, 18)
  const cmdIdDec = hexToDecimal(cmdId)

  const paramsHex = cleanHex.substring(42)
  const params: { index: number; value: string; selected: boolean }[] = []
  for (let i = 0; i < paramsHex.length; i += 8) {
    const chunk = paramsHex.substring(i, i + 8)
    if (chunk.length === 8) {
      params.push({
        index: params.length + 1,
        value: String(hexToDecimal(chunk)),
        selected: true
      })
    }
  }

  return { commandId: String(cmdIdDec), params }
}

const filteredParams = computed(() => parsedParams.value.filter(p => p.selected))

const finalOutput = computed(() => {
  if (convertDirection.value === 'hexToFormat') {
    const selectedParams = filteredParams.value
    if (selectedParams.length === 0) {
      return '请至少选择一个参数'
    }
    return `{${commandId.value},${selectedParams.length},${selectedParams.map(p => p.value).join(',')}}`
  }
  return outputResult.value
})

function convertHexToFormat(hex: string): string {
  const parsed = parseHexToParams(hex)
  if (!parsed) {
    return '发包文本长度不足'
  }

  if (parsed.params.length === 0) {
    return '无参数数据'
  }

  commandId.value = parsed.commandId
  parsedParams.value = parsed.params
  paramCount.value = parsed.params.length

  return `{${parsed.commandId},${parsed.params.length},${parsed.params.map(p => p.value).join(',')}}`
}

function convertFormatToHex(format: string): string {
  const match = format.match(/^\{(\d+),(\d+),(\d+(?:,\d+)*)\}$/)
  if (!match) {
    return '格式错误，请输入 {commandId,paramCount,param1,param2,...}'
  }

  const [, cmdId, paramCountStr, paramsStr] = match
  const params = paramsStr.split(',').map(p => parseInt(p, 10))

  if (params.length !== parseInt(paramCountStr, 10)) {
    return '参数数量不匹配'
  }

  const header = '00000035'
  const version = '31'
  const cmdIdHex = decimalToHex(parseInt(cmdId, 10), 8)
  const mimiId = '00000000'
  const sequence = '00000000'
  const paramCnt = decimalToHex(params.length, 8)

  let paramHex = ''
  params.forEach(p => {
    paramHex += decimalToHex(p, 8)
  })

  return header + version + cmdIdHex + mimiId + sequence + paramCnt + paramHex
}

function handleConvert() {
  if (!hexInput.value.trim()) return

  if (convertDirection.value === 'hexToFormat') {
    outputResult.value = convertHexToFormat(hexInput.value)
  } else {
    outputResult.value = convertFormatToHex(hexInput.value.trim())
  }
  showResult.value = true
}

function handleReset() {
  hexInput.value = ''
  outputResult.value = ''
  showResult.value = false
  parsedParams.value = []
  commandId.value = ''
  paramCount.value = 0
}

function copyResult() {
  const textToCopy = convertDirection.value === 'hexToFormat' ? finalOutput.value : outputResult.value
  if (textToCopy) {
    navigator.clipboard.writeText(textToCopy)
  }
}

function selectAll() {
  parsedParams.value.forEach(p => p.selected = true)
}

function deselectAll() {
  parsedParams.value.forEach(p => p.selected = false)
}
</script>

<template>
  <div class="panel h-full flex flex-col">
    <div class="section-title">
      <span class="flex items-center gap-2">
        <svg class="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4 4"
          />
        </svg>
        发包文本转字节集参数
      </span>
    </div>

    <div class="flex-1 flex flex-col gap-3 overflow-hidden">
      <!-- 转换方向选择器 -->
      <div class="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-3 border border-indigo-100">
        <div class="flex items-center gap-3">
          <span class="text-xs font-medium text-indigo-600">转换方向</span>
          <div class="flex items-center gap-1 bg-white/80 p-0.5 rounded-lg shadow-sm">
            <Button
              :type="convertDirection === 'hexToFormat' ? 'primary' : 'default'"
              size="sm"
              @click="convertDirection = 'hexToFormat'; handleReset()"
            >
              文本转参数
            </Button>
            <Button
              :type="convertDirection === 'formatToHex' ? 'primary' : 'default'"
              size="sm"
              @click="convertDirection = 'formatToHex'; handleReset()"
            >
              参数转文本
            </Button>
          </div>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-medium text-gray-600 flex items-center gap-1">
          <svg class="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          {{ convertDirection === 'hexToFormat' ? '输入发包文本' : '输入字节集参数' }}
        </label>
        <div class="relative">
          <textarea
            v-model="hexInput"
            class="w-full h-24 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-mono resize-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50/50 focus:outline-none shadow-sm transition-all"
            :placeholder="convertDirection === 'hexToFormat' ? '请输入发包文本' : '请输入字节集参数，如 {46046,1,6008}'"
          />
          <div class="absolute bottom-2 right-2 flex gap-1">
            <span class="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] text-gray-400 font-mono">{{ hexInput.length }} 字符</span>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="flex gap-2">
        <Button type="primary" class="flex-1" @click="handleConvert">
          <span class="flex items-center justify-center gap-2">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.582 0a8.002 8.002 0 011.582 7.935M4 4v5h.582m15.582 0a8.002 8.002 0 011.582 7.935M4 4h16a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z" />
            </svg>
            开始转换
          </span>
        </Button>
        <Button type="danger" @click="handleReset">
          <span class="flex items-center justify-center gap-2">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.582 0a8.002 8.002 0 011.582 7.935M4 4v5h.582m15.582 0a8.002 8.002 0 011.582 7.935M4 4h16a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z" />
            </svg>
            重置
          </span>
        </Button>
      </div>

      <!-- 参数选择区域 -->
      <div v-if="showResult && convertDirection === 'hexToFormat'" class="flex flex-col gap-2 flex-1 overflow-hidden">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span class="text-xs font-medium text-gray-600">选择参数</span>
            <span class="px-1.5 py-0.5 bg-indigo-100 text-indigo-600 rounded text-[10px] font-medium">
              {{ filteredParams.length }} / {{ parsedParams.length }}
            </span>
          </div>
          <div class="flex gap-2">
            <Button type="primary" size="sm" @click="selectAll">全选</Button>
            <Button type="primary" size="sm" @click="deselectAll">取消</Button>
          </div>
        </div>
        <div class="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-indigo-50/30 rounded-xl border border-gray-200 p-3">
          <div class="flex flex-wrap gap-2">
            <div
              v-for="param in parsedParams"
              :key="param.index"
              :class="[
                'flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer select-none transition-all duration-200',
                param.selected 
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/25 scale-[1.02]' 
                  : 'bg-white border border-gray-200 hover:border-indigo-300 hover:shadow-sm'
              ]"
              @click="param.selected = !param.selected"
            >
              <Checkbox v-model="param.selected" />
              <span class="text-xs font-mono font-medium" :class="param.selected ? 'text-white' : 'text-gray-600'">
                参数{{ param.index }}
              </span>
              <span class="text-xs font-mono" :class="param.selected ? 'text-indigo-100' : 'text-gray-400'">:</span>
              <span class="text-xs font-mono font-semibold" :class="param.selected ? 'text-white' : 'text-gray-800'">
                {{ param.value }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 转换结果 -->
      <div v-if="showResult" class="flex flex-col gap-1.5 flex-1 overflow-hidden">
        <div class="flex items-center justify-between">
          <label class="text-xs font-medium text-gray-600 flex items-center gap-1">
            <svg class="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            转换结果
          </label>
          <Button type="primary" size="sm" @click="copyResult">
            <span class="flex items-center gap-1">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              复制
            </span>
          </Button>
        </div>
        <div class="relative flex-1">
          <textarea
            :value="finalOutput"
            readonly
            class="w-full h-full min-h-[80px] px-4 py-3 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl text-xs font-mono resize-none shadow-inner"
          />
          <div class="absolute top-2 right-2">
            <span class="px-2 py-1 bg-green-500 text-white text-[10px] font-medium rounded-full shadow-sm">
              {{ finalOutput.length }} 字符
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
