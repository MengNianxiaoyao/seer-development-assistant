<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import Button from '@/components/Button.vue'
import ParamSelector from '@/components/ParamSelector.vue'
import ConvertResult from '@/components/ConvertResult.vue'
import { useConverter } from '@/composables/useConverter'

const {
  hexInput,
  showResult,
  convertDirection,
  parsedParams,
  filteredParams,
  finalOutput,
  handleConvert,
  handleReset,
  selectAll,
  deselectAll
} = useConverter()

function toggleParam(index: number) {
  const param = parsedParams.value.find(p => p.index === index)
  if (param) {
    param.selected = !param.selected
  }
}

function setDirection(direction: 'hexToFormat' | 'formatToHex') {
  convertDirection.value = direction
  handleReset()
}

function handleKeydown(e: globalThis.KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault()
    handleConvert()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="panel h-full flex flex-col">
    <div class="section-title">
      <span class="label-with-icon">
        <svg class="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4 4"
          />
        </svg>
        发包文本与字节集参数转换
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
              @click="setDirection('hexToFormat')"
            >
              文本转参数
            </Button>
            <Button
              :type="convertDirection === 'formatToHex' ? 'primary' : 'default'"
              size="sm"
              @click="setDirection('formatToHex')"
            >
              参数转文本
            </Button>
          </div>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="flex flex-col gap-1.5">
        <label class="label-sm">
          <svg class="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          {{ convertDirection === 'hexToFormat' ? '输入发包文本' : '输入字节集参数' }}
        </label>
        <div class="relative">
          <textarea
            v-model="hexInput"
            class="w-full h-24 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-mono focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50/50 focus:outline-none shadow-sm transition-all"
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
          <span class="label-with-icon justify-center">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.582 0a8.002 8.002 0 011.582 7.935M4 4v5h.582m15.582 0a8.002 8.002 0 011.582 7.935M4 4h16a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z" />
            </svg>
            开始转换
          </span>
        </Button>
        <Button type="danger" @click="handleReset">
          <span class="label-with-icon justify-center">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.582 0a8.002 8.002 0 011.582 7.935M4 4v5h.582m15.582 0a8.002 8.002 0 011.582 7.935M4 4h16a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z" />
            </svg>
            重置
          </span>
        </Button>
      </div>

      <!-- 参数选择区域 -->
      <ParamSelector
        v-if="showResult && convertDirection === 'hexToFormat'"
        :params="parsedParams"
        :filtered-count="filteredParams.length"
        @select-all="selectAll"
        @deselect-all="deselectAll"
        @toggle="toggleParam"
      />

      <!-- 转换结果 -->
      <ConvertResult
        v-if="showResult"
        :output="finalOutput"
      />
    </div>
  </div>
</template>
