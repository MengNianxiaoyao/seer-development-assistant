<script setup lang="ts">
defineProps<{
  validPackets: number
  paramCount: number
  diffCount: number
  analyzed: boolean
}>()
</script>

<template>
  <div class="bg-gray-800 text-white px-4 py-1.5 text-xs flex items-center justify-between">
    <span v-if="analyzed" class="text-green-400">
      分析完成，有效包 {{ validPackets }} 个，参数数量 {{ paramCount }} 个，相异参数 {{ diffCount }} 个。
    </span>
    <span v-else class="text-gray-400">就绪</span>
    <span class="text-gray-500">v1.0.0</span>
  </div>
</template>
