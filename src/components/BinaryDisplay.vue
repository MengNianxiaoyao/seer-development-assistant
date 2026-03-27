<script setup lang="ts">
import { ref, computed } from "vue";
import RadioGroup from "@/components/RadioGroup.vue";
import type { BinaryGroupSize, InputEntry } from "@/types";

const props = defineProps<{
  inputs: InputEntry[];
}>();

const groupSize = ref<BinaryGroupSize>(8);

const radioOptions = [
  { value: 1, label: "0" },
  { value: 2, label: "00" },
  { value: 4, label: "0000" },
  { value: 8, label: "00000000" },
];

function hexToBinary(hex: string): string {
  return hex
    .split("")
    .map((c) => parseInt(c, 16).toString(2).padStart(4, "0"))
    .join("");
}

function splitByGroupSize(
  hex: string,
  size: number,
): { index: number; hex: string; binary: string }[] {
  const clean = hex.replace(/[^0-9a-fA-F]/g, "").toUpperCase();
  const groups: { index: number; hex: string; binary: string }[] = [];
  let pos = 0;
  let idx = 1;

  while (pos < clean.length) {
    const chunk = substringWithPad(clean, pos, size);
    groups.push({
      index: idx,
      hex: chunk,
      binary: hexToBinary(chunk),
    });
    pos += size;
    idx++;
  }

  return groups;
}

function substringWithPad(str: string, start: number, len: number): string {
  const chunk = str.substring(start, start + len);
  return chunk.length < len ? chunk.padEnd(len, "0") : chunk;
}

function getEnabledInputs() {
  return props.inputs.filter((i) => i.enabled && i.value.trim());
}

const parsedData = computed(() => {
  return getEnabledInputs().map((entry) => ({
    id: entry.id,
    label: entry.label,
    groups: splitByGroupSize(entry.value, groupSize.value),
  }));
});

const diffIndexSet = computed(() => {
  if (parsedData.value.length < 2) return new Set<number>();
  const maxLen = Math.max(...parsedData.value.map((d) => d.groups.length));
  const diffs = new Set<number>();

  for (let i = 0; i < maxLen; i++) {
    const values = parsedData.value.map((d) => d.groups[i]?.hex ?? "");
    const first = values[0];
    if (values.some((v) => v !== first)) {
      diffs.add(i + 1);
    }
  }

  return diffs;
});

function getHighlightClass(packetIdx: number, paramIdx: number): string {
  if (!diffIndexSet.value.has(paramIdx)) return "bg-green-100 text-green-700";

  const colors = ["bg-red-100 text-red-600", "bg-blue-100 text-blue-600"];
  return colors[packetIdx % 2];
}
</script>

<template>
  <div class="panel h-full flex flex-col">
    <div class="section-title flex items-center gap-3">
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
            d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
          />
        </svg>
        二进制显示区
      </span>
      <span class="text-xs text-gray-500">格式:</span>
      <RadioGroup v-model="groupSize" :options="radioOptions" />
    </div>

    <div class="flex-1 overflow-x-auto overflow-y-auto">
      <div
        v-if="parsedData.length === 0"
        class="text-gray-400 text-xs text-center py-4"
      >
        暂无输入数据
      </div>
      <div v-else class="flex gap-2">
        <div
          v-for="(data, pIdx) in parsedData"
          :key="data.id"
          class="card inline-block flex-shrink-0"
        >
          <div class="text-purple-600 font-bold mb-1">{{ data.label }}</div>
          <div v-if="data.groups.length === 0" class="text-gray-400">
            无数据
          </div>
          <div v-else class="space-y-0.5">
            <div
              v-for="group in data.groups"
              :key="group.index"
              class="flex gap-1 px-1 py-0.5 rounded"
              :class="getHighlightClass(pIdx, group.index)"
            >
              <span class="opacity-60">[{{ group.index }}]</span>
              <span>{{ group.binary }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
