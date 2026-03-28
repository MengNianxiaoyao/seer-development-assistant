<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import HexInput from '@/components/HexInput.vue'
import ActionPanel from '@/components/ActionPanel.vue'
import BinaryDisplay from '@/components/BinaryDisplay.vue'
import OutputArea from '@/components/OutputArea.vue'
import DiffArea from '@/components/DiffArea.vue'
import HeaderPanel from '@/components/HeaderPanel.vue'
import StatusBar from '@/components/StatusBar.vue'
import AlertModal from '@/components/AlertModal.vue'
import ValidationErrorModal from '@/components/ValidationErrorModal.vue'
import Button from '@/components/Button.vue'
import ConvertPage from '@/components/ConvertPage.vue'
import { useAnalysis } from '@/composables/useAnalysis'

const activeTab = ref<'analyze' | 'convert'>('analyze')

const {
  inputs,
  sendPacket,
  displayFormat,
  isLoading,
  result,
  isAnalyzed,
  validationErrors,
  showValidationModal,
  alertMessage,
  showAlertModal,
  handleAnalyze,
  handleReset,
  handleConvertDecimal,
  handleExport,
  handleImportFile,
  handleImportError,
  closeValidationModal,
  closeAlertModal,
} = useAnalysis()

function handleKeydown(e: globalThis.KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault()
    handleAnalyze()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex flex-col">
    <header class="bg-white shadow-sm border-b border-gray-200 px-2 md:px-4 py-2 flex items-center justify-between">
      <h1 class="text-sm md:text-base font-bold text-gray-800">分析助手</h1>
      <div class="flex gap-1 md:gap-2">
        <Button
          :type="activeTab === 'analyze' ? 'primary' : 'default'"
          size="sm"
          @click="activeTab = 'analyze'"
        >
          <div class="flex items-center gap-1 md:gap-1.5">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <span class="hidden md:inline">分析</span>
          </div>
        </Button>
        <Button
          :type="activeTab === 'convert' ? 'primary' : 'default'"
          size="sm"
          @click="activeTab = 'convert'"
        >
          <div class="flex items-center gap-1 md:gap-1.5">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <span class="hidden md:inline">转换</span>
          </div>
        </Button>
      </div>
    </header>

    <!-- Convert Page -->
    <div v-if="activeTab === 'convert'" class="flex-1 p-2 md:p-3">
      <ConvertPage />
    </div>

    <!-- Analyze Page -->
    <div v-else class="flex-1 flex flex-col gap-2 md:gap-3 p-2 md:p-3 min-h-0">
      <!-- Mobile Layout -->
      <div class="md:hidden flex flex-col gap-2 flex-1 min-h-0">
        <!-- Input Section -->
        <div class="flex-shrink-0" style="height: 200px;">
          <HexInput v-model:inputs="inputs" v-model:sendPacket="sendPacket" />
        </div>
        
        <!-- Action Panel - Horizontal on mobile -->
        <div class="flex-shrink-0">
          <ActionPanel
            @import-file="handleImportFile"
            @import="handleImportError"
            @export="handleExport"
            @analyze="handleAnalyze"
            @convert-decimal="handleConvertDecimal"
            @reset="handleReset"
          />
        </div>
        
        <!-- Binary Display -->
        <div class="flex-shrink-0" style="height: 150px;">
          <BinaryDisplay :inputs="inputs" />
        </div>
        
        <!-- Header Panel -->
        <div class="flex-shrink-0">
          <HeaderPanel :result="result" />
        </div>
        
        <!-- Output Areas -->
        <div class="flex flex-col gap-2 flex-1 min-h-0">
          <div class="flex-1 min-h-[120px] overflow-hidden">
            <OutputArea :result="result" :format="displayFormat" />
          </div>
          <div class="flex-1 min-h-[120px] overflow-hidden">
            <DiffArea :result="result" :format="displayFormat" />
          </div>
        </div>
      </div>

      <!-- Desktop Layout -->
      <div class="hidden md:flex flex-col gap-3 flex-1 min-h-0">
        <!-- Top Row: Input + Actions + Binary Display -->
        <div class="flex gap-3 flex-shrink-0" style="height: 280px;">
          <div class="w-[45%] min-w-0">
            <HexInput v-model:inputs="inputs" v-model:sendPacket="sendPacket" />
          </div>
          <div class="w-[10%] min-w-0">
            <ActionPanel
              @import-file="handleImportFile"
              @import="handleImportError"
              @export="handleExport"
              @analyze="handleAnalyze"
              @convert-decimal="handleConvertDecimal"
              @reset="handleReset"
            />
          </div>
          <div class="w-[45%] min-w-0">
            <BinaryDisplay :inputs="inputs" />
          </div>
        </div>

        <!-- Bottom Row: Output Container + Header -->
        <div class="flex gap-3 flex-shrink-0" style="height: calc(100vh - 340px); min-height: 300px; max-height: 550px;">
          <div class="w-[80%] flex flex-col gap-3 min-w-0 h-full">
            <div class="h-[50%] overflow-hidden">
              <OutputArea :result="result" :format="displayFormat" />
            </div>
            <div class="h-[50%] overflow-hidden">
              <DiffArea :result="result" :format="displayFormat" />
            </div>
          </div>
          <div class="w-[20%] min-w-0 h-full">
            <HeaderPanel :result="result" />
          </div>
        </div>
      </div>
    </div>

    <StatusBar
      v-if="activeTab === 'analyze'"
      :valid-packets="result?.validPackets ?? 0"
      :param-count="result?.packets?.[0]?.header?.paramCount?.decimal ?? 0"
      :diff-count="result?.diffCount ?? 0"
      :analyzed="isAnalyzed"
      :loading="isLoading"
    />

    <!-- Validation Error Modal -->
    <ValidationErrorModal
      v-if="showValidationModal"
      :errors="validationErrors"
      @close="closeValidationModal"
    />

    <!-- Alert Modal -->
    <AlertModal
      v-if="showAlertModal"
      :message="alertMessage"
      @close="closeAlertModal"
    />
  </div>
</template>
