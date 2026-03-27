<script setup lang="ts">
import { computed } from "vue";
import type { AnalysisResult, DisplayFormat } from "@/types";

const props = defineProps<{
  result: AnalysisResult | null;
  format: DisplayFormat;
}>();

function formatValue(
  hex: string,
  decimal: number,
  binary: string,
  fmt: DisplayFormat,
): string {
  switch (fmt) {
    case "decimal":
      return String(decimal);
    case "binary":
      return binary;
    default:
      return hex;
  }
}

const diffIndexSet = computed(() => {
  if (!props.result?.diffs.length) return new Set<number>();
  return new Set(props.result.diffs.map((d) => d.index));
});

function getHighlightClass(packetIdx: number, paramIdx: number): string {
  if (!diffIndexSet.value.has(paramIdx)) return "bg-green-100 text-green-700";

  const colors = ["bg-red-100 text-red-600", "bg-blue-100 text-blue-600"];
  return colors[packetIdx % 2];
}
</script>

<template>
  <div class="panel h-full flex flex-col">
    <div class="section-title">
      <span class="flex items-center gap-2">
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
            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        输出区 - 所有参数区
      </span>
    </div>

    <div
      v-if="!result || result.packets.length === 0"
      class="text-gray-400 text-xs text-center py-4 flex-1"
    >
      点击"开始分析"查看结果
    </div>

    <div v-else class="flex-1 overflow-x-auto overflow-y-auto">
      <div class="flex gap-2">
        <div
          v-for="(packet, pIdx) in result.packets"
          :key="packet.id"
          class="card inline-block flex-shrink-0"
        >
          <div class="text-purple-600 font-bold mb-1">{{ packet.label }}</div>
          <div v-if="packet.params.length === 0" class="text-gray-400">
            无参数
          </div>
          <div v-else class="space-y-0.5">
            <div
              v-for="param in packet.params"
              :key="param.index"
              class="flex gap-1 px-1 py-0.5 rounded"
              :class="getHighlightClass(pIdx, param.index)"
            >
              <span class="opacity-60">[{{ param.index }}]</span>
              <span>{{
                formatValue(param.hex, param.decimal, param.binary, format)
              }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
