<script setup lang="ts">
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

function getDiffParams(packets: AnalysisResult["packets"], diffIndex: number) {
  return packets.map((p, pIdx) => {
    const param = p.params.find((pr) => pr.index === diffIndex);
    return {
      id: p.id,
      label: p.label,
      value: param
        ? formatValue(param.hex, param.decimal, param.binary, props.format)
        : "-",
      color:
        pIdx % 2 === 0
          ? "bg-red-100 text-red-600"
          : "bg-blue-100 text-blue-600",
    };
  });
}
</script>

<template>
  <div class="panel h-full flex flex-col">
    <div class="section-title">
      <span class="flex items-center gap-2">
        <svg
          class="w-4 h-4 text-red-500"
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
        输出区 - 相异参数区
      </span>
    </div>

    <div
      v-if="!result || result.diffs.length === 0"
      class="text-gray-400 text-xs text-center py-4 flex-1"
    >
      暂无相异参数
    </div>

    <div v-else class="flex-1 overflow-x-auto overflow-y-auto">
      <div class="flex gap-2">
        <div
          v-for="diff in result.diffs"
          :key="diff.index"
          class="card border-l-4 border-l-red-400 inline-block flex-shrink-0"
        >
          <div class="text-red-600 font-bold mb-1">差异{{ diff.index }}</div>
          <div
            v-for="dp in getDiffParams(result.packets, diff.index)"
            :key="dp.id"
            class="flex gap-1 px-1 py-0.5 rounded mb-0.5"
            :class="dp.color"
          >
            <span class="opacity-60">{{ dp.label }}</span>
            <span class="w-8">[{{ diff.index }}]</span>
            <span>{{ dp.value }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
