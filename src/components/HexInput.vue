<script setup lang="ts">
import { storeToRefs } from 'pinia'
import Button from '@/components/Button.vue'
import Checkbox from '@/components/Checkbox.vue'
import Input from '@/components/Input.vue'
import { useAnalysisStore } from '@/stores/analysis'

const store = useAnalysisStore()
const { inputs, sendPacket } = storeToRefs(store)

function addInput() {
  store.addInput()
}

function removeInput(id: number) {
  store.removeInput(id)
}
</script>

<template>
  <div class="panel h-full flex flex-col">
    <div class="section-title flex items-center justify-between">
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
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
        输入区
      </span>
      <Button type="success" size="sm" @click="addInput">
        <span class="label-with-icon">
          <svg
            class="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 4v16m8-8H4"
            />
          </svg>
          新增
        </span>
      </Button>
    </div>
    <div
      class="flex-1 overflow-y-auto space-y-2 pr-1"
      style="max-height: 220px"
    >
      <!-- 发包输入 -->
      <div class="flex items-center gap-2">
        <span class="text-xs text-orange-500 w-14 flex-shrink-0 font-semibold">发包</span>
        <Input
          v-model="sendPacket"
          class="flex-1 min-w-0"
          placeholder="请输入发包"
        />
      </div>
      <!-- 分隔线 -->
      <div class="border-t border-gray-200 border-dashed my-1" />
      <!-- 收包输入 -->
      <div
        v-for="(entry, index) in inputs"
        :key="entry.id"
        class="flex items-center gap-2"
      >
        <Checkbox v-model="entry.enabled" />
        <span class="text-xs text-gray-500 w-14 flex-shrink-0 font-medium">{{
          entry.label
        }}</span>
        <Input
          v-model="entry.value"
          class="flex-1 min-w-0"
          placeholder="请输入收包"
        />
        <span v-if="index === 0" class="w-[40px] flex-shrink-0" />
        <Button v-else type="danger" size="sm" @click="removeInput(entry.id)">
          <span class="icon-btn">
            <svg
              class="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </span>
        </Button>
      </div>
    </div>
  </div>
</template>
