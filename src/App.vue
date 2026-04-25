<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import MobileWarning from '@/components/MobileWarning.vue'
import StatusBar from '@/components/StatusBar.vue'
import { useAnalysisStore } from '@/stores/analysis'
import { formatParamCount, separatePackets } from '@/utils'

const route = useRoute()
const store = useAnalysisStore()
const showMobileWarning = ref(false)

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

function checkMobile() {
  const ua = navigator.userAgent.toLowerCase()
  const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua)
  const isSmallScreen = window.innerWidth < 768
  showMobileWarning.value = isMobileDevice || isSmallScreen
}

const statusInfo = computed(() => {
  const { result, isAnalyzed, isLoading } = store
  if (!result) {
    return {
      validPackets: 0,
      paramCount: '0',
      diffCount: 0,
      analyzed: false,
      loading: false,
    }
  }
  const { receivePackets } = separatePackets(result.packets)
  return {
    validPackets: result.validPackets,
    paramCount: formatParamCount(receivePackets),
    diffCount: result.diffCount,
    analyzed: isAnalyzed,
    loading: isLoading,
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex flex-col">
    <header class="page-header">
      <h1 class="page-title">
        分析助手
      </h1>
      <nav class="flex gap-2">
        <router-link
          to="/analyze"
          class="no-underline btn-base btn-sm"
          :class="route.path === '/analyze' ? 'btn-primary' : 'btn-default'"
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
            <span>分析</span>
          </div>
        </router-link>
        <router-link
          to="/convert"
          class="no-underline btn-base btn-sm"
          :class="route.path === '/convert' ? 'btn-primary' : 'btn-default'"
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
            <span>转换</span>
          </div>
        </router-link>
      </nav>
    </header>

    <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </router-view>

    <StatusBar
      :valid-packets="statusInfo.validPackets"
      :param-count="statusInfo.paramCount"
      :diff-count="statusInfo.diffCount"
      :analyzed="statusInfo.analyzed"
      :loading="statusInfo.loading"
      :show-info="route.path === '/analyze'"
    />

    <MobileWarning :show="showMobileWarning" @close="showMobileWarning = false" />
  </div>
</template>
