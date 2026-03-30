<script setup lang="ts">
import { ref } from 'vue'
import Button from '@/components/Button.vue'
import ConvertResult from '@/components/ConvertResult.vue'
import Input from '@/components/Input.vue'
import ParamSelector from '@/components/ParamSelector.vue'
import { useConverter } from '@/composables/useConverter'
import { useSettingsStore } from '@/stores/settings'

const settingsStore = useSettingsStore()

const {
  hexToFormatInput,
  parsedParams,
  filteredParams,
  isSpecialCommand,
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
} = useConverter()

const showSettings = ref(false)
const newCommandId = ref('')
const settingsError = ref('')

function openSettings() {
  newCommandId.value = ''
  settingsError.value = ''
  showSettings.value = true
}

function addCommand() {
  const id = Number(newCommandId.value)
  if (!id || id <= 0) {
    settingsError.value = '请输入有效的命令号'
    return
  }
  if (settingsStore.specialCommandIds.includes(id)) {
    settingsError.value = '命令号已存在'
    return
  }
  settingsStore.addCommandId(id)
  newCommandId.value = ''
  settingsError.value = ''
}

function removeCommand(id: number) {
  settingsStore.removeCommandId(id)
}

function resetCommands() {
  settingsStore.resetToDefault()
}

function handleAddKeyup(e: KeyboardEvent) {
  if (e.key === 'Enter')
    addCommand()
}
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
        <Button
          type="default"
          size="sm"
          class="ml-auto"
          title="设置特殊命令号"
          @click="openSettings"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </Button>
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
            >{{ hexToFormatInput.length }} 字符</span>
          </div>
        </div>

        <div class="flex gap-2">
          <Button type="danger" class="flex-1" @click="handleHexToFormatReset">
            重置
          </Button>
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
          :is-special-command="isSpecialCommand"
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
            >{{ formatToHexInput.length }} 字符</span>
          </div>
        </div>

        <div class="flex gap-2">
          <Button type="primary" class="flex-1" @click="handleFormatToHexReset">
            重置
          </Button>
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

  <!-- 设置弹窗 -->
  <Teleport to="body">
    <div
      v-if="showSettings"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop"
      @click.self="showSettings = false"
    >
      <div class="bg-white rounded-xl shadow-xl w-full max-w-sm modal-dialog">
        <div class="p-4 border-b border-gray-100">
          <h3 class="text-sm font-semibold text-gray-800">特殊命令号设置</h3>
        </div>
        <div class="p-4 space-y-4">
          <p class="text-xs text-gray-500">
            以下命令号的参数1将作为参数数量，可自动计算并隐藏选择
          </p>
          <div class="flex gap-2">
            <Input
              v-model="newCommandId"
              placeholder="输入命令号"
              @keyup="handleAddKeyup"
            />
            <Button type="primary" size="sm" @click="addCommand">
              添加
            </Button>
          </div>
          <div v-if="settingsError" class="text-xs text-red-500">
            {{ settingsError }}
          </div>
          <div class="flex flex-wrap gap-2">
            <div
              v-for="id in settingsStore.specialCommandIds"
              :key="id"
              class="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-600 rounded text-xs font-mono"
            >
              {{ id }}
              <Button
                type="default"
                size="xs"
                class="!p-0.5 !text-indigo-400 hover:!text-red-500"
                @click="removeCommand(id)"
              >
                <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
        <div class="flex justify-end gap-2 p-4 border-t border-gray-100">
          <Button type="default" size="sm" @click="resetCommands">
            恢复默认
          </Button>
          <Button type="primary" size="sm" @click="showSettings = false">
            关闭
          </Button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
