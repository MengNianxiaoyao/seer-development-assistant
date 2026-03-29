<script setup lang="ts">
import { ref } from "vue";
import Button from "@/components/Button.vue";
import ConvertPage from "@/components/ConvertPage.vue";
import AnalyzePage from "@/components/AnalyzePage.vue";

const activeTab = ref<"analyze" | "convert">("analyze");
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex flex-col">
    <header class="page-header">
      <h1 class="page-title">分析助手</h1>
      <div class="flex gap-1 md:gap-2">
        <Button
          :type="activeTab === 'analyze' ? 'primary' : 'default'"
          size="sm"
          @click="activeTab = 'analyze'"
        >
          <div class="label-with-icon">
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
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
            <span class="hidden md:inline">分析</span>
          </div>
        </Button>
        <Button
          :type="activeTab === 'convert' ? 'primary' : 'default'"
          size="sm"
          @click="activeTab = 'convert'"
        >
          <div class="label-with-icon">
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
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
            <span class="hidden md:inline">转换</span>
          </div>
        </Button>
      </div>
    </header>

    <KeepAlive>
      <component :is="activeTab === 'analyze' ? AnalyzePage : ConvertPage" />
    </KeepAlive>
  </div>
</template>
