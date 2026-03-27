<script setup lang="ts">
import FilePicker from "@/components/FilePicker.vue";
import Button from "@/components/Button.vue";

const emit = defineEmits<{
  import: [];
  export: [];
  analyze: [];
  convertDecimal: [];
  reset: [];
  importFile: [data: string[]];
}>();

function handleFileSelected(file: File) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const json = JSON.parse(reader.result as string);
      const hexStrings: string[] = [];

      if (json.packets && Array.isArray(json.packets)) {
        // Pass the entire JSON as a single string for App.vue to parse
        emit("importFile", [reader.result as string]);
        return;
      } else if (Array.isArray(json)) {
        for (const item of json) {
          if (typeof item === "string") {
            hexStrings.push(item);
          } else if (item.hex) {
            hexStrings.push(item.hex);
          } else if (item.data) {
            hexStrings.push(item.data);
          } else if (item.value) {
            hexStrings.push(item.value);
          } else if (item.raw) {
            hexStrings.push(item.raw);
          }
        }
      } else if (typeof json === "string") {
        hexStrings.push(json);
      }

      if (hexStrings.length > 0) {
        emit("importFile", hexStrings);
      }
    } catch {
      emit("import");
    }
  };
  reader.readAsText(file);
}
</script>

<template>
  <div class="panel h-full flex flex-col -mt-1">
    <div class="section-title mb-3">
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
            d="M4 6h16M4 12h16M4 18h7"
          />
        </svg>
        功能选择区
      </span>
    </div>

    <div class="space-y-1.5 -mt-1">
      <FilePicker @selected="handleFileSelected" />

      <Button type="warning" class="w-full" @click="emit('export')">
        <span class="flex items-center justify-center gap-1.5">
          <svg
            class="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
          导出数据
        </span>
      </Button>

      <Button type="primary" class="w-full" @click="emit('analyze')">
        <span class="flex items-center justify-center gap-1.5">
          <svg
            class="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          开始分析
        </span>
      </Button>

      <Button type="warning" class="w-full" @click="emit('convertDecimal')">
        <span class="flex items-center justify-center gap-1.5">
          <svg
            class="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          转为十进制
        </span>
      </Button>

      <Button type="danger" class="w-full" @click="emit('reset')">
        <span class="flex items-center justify-center gap-1.5">
          <svg
            class="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.582 0a8.002 8.002 0 011.582 7.935M4 4v5h.582m15.582 0a8.002 8.002 0 011.582 7.935M4 4h16a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z"
            />
          </svg>
          一键重置
        </span>
      </Button>
    </div>
  </div>
</template>
