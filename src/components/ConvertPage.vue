<script setup lang="ts">
import Button from "@/components/Button.vue";
import ParamSelector from "@/components/ParamSelector.vue";
import ConvertResult from "@/components/ConvertResult.vue";
import { useConverter } from "@/composables/useConverter";

const {
  hexToFormatInput,
  parsedParams,
  filteredParams,
  hexToFormatOutput,
  hexToFormatError,
  hasHexToFormatResult,
  handleHexToFormatReset,
  selectAll,
  deselectAll,
  toggleParam,
  formatToHexInput,
  formatToHexOutput,
  formatToHexError,
  hasFormatToHexResult,
  handleFormatToHexReset,
} = useConverter();
</script>

<template>
  <div class="flex-1 flex p-3 gap-3 overflow-hidden">
    <!-- 文本转参数 -->
    <div class="panel flex-1 flex flex-col min-w-0">
      <div class="section-title">
        <span class="label-with-icon">
          <svg
            class="w-4 h-4 text-indigo-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
          发包文本 → 字节集参数
        </span>
      </div>

      <div class="flex-1 flex flex-col gap-2 overflow-auto">
        <div class="flex flex-col gap-1.5">
          <label class="label-sm">输入发包文本</label>
          <div class="relative">
            <textarea
              v-model="hexToFormatInput"
              class="w-full h-20 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-mono focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50/50 focus:outline-none shadow-sm transition-all"
              placeholder="请输入发包文本，如 110000680000..."
            />
            <span
              class="absolute bottom-2 right-2 px-1.5 py-0.5 bg-gray-100 rounded text-[10px] text-gray-400 font-mono"
              >{{ hexToFormatInput.length }} 字符</span
            >
          </div>
        </div>

        <div class="flex gap-2">
          <Button type="danger" class="flex-1" @click="handleHexToFormatReset"
            >重置</Button
          >
        </div>

        <div
          v-if="hexToFormatError"
          class="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-600"
        >
          <svg
            class="w-4 h-4 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span>{{ hexToFormatError }}</span>
        </div>

        <ParamSelector
          v-if="hasHexToFormatResult"
          :params="parsedParams"
          :filtered-count="filteredParams.length"
          @select-all="selectAll"
          @deselect-all="deselectAll"
          @toggle="toggleParam"
        />

        <ConvertResult
          v-if="hasHexToFormatResult"
          :output="hexToFormatOutput"
          label="字节集参数"
        />
      </div>
    </div>

    <!-- 参数转文本 -->
    <div class="panel flex-1 flex flex-col min-w-0">
      <div class="section-title">
        <span class="label-with-icon">
          <svg
            class="w-4 h-4 text-purple-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M11 17l-5-5m0 0l5-5m-5 5h12"
            />
          </svg>
          字节集参数 → 发包文本
        </span>
      </div>

      <div class="flex-1 flex flex-col gap-2 overflow-auto">
        <div class="flex flex-col gap-1.5">
          <label class="label-sm">输入字节集参数</label>
          <div class="relative">
            <textarea
              v-model="formatToHexInput"
              class="w-full h-20 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-mono focus:border-purple-400 focus:ring-4 focus:ring-purple-50/50 focus:outline-none shadow-sm transition-all"
              placeholder="如 {46046} 或 {46046,1,6008}"
            />
            <span
              class="absolute bottom-2 right-2 px-1.5 py-0.5 bg-gray-100 rounded text-[10px] text-gray-400 font-mono"
              >{{ formatToHexInput.length }} 字符</span
            >
          </div>
        </div>

        <div class="flex gap-2">
          <Button type="primary" class="flex-1" @click="handleFormatToHexReset"
            >重置</Button
          >
        </div>

        <div
          v-if="formatToHexError"
          class="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-600"
        >
          <svg
            class="w-4 h-4 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span>{{ formatToHexError }}</span>
        </div>

        <ConvertResult
          v-if="hasFormatToHexResult"
          :output="formatToHexOutput"
          label="发包文本"
        />
      </div>
    </div>
  </div>
</template>
