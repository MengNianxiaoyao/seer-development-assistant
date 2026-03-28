<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import HexInput from '@/components/HexInput.vue'
import ActionPanel from '@/components/ActionPanel.vue'
import BinaryDisplay from '@/components/BinaryDisplay.vue'
import OutputArea from '@/components/OutputArea.vue'
import DiffArea from '@/components/DiffArea.vue'
import HeaderPanel from '@/components/HeaderPanel.vue'
import StatusBar from '@/components/StatusBar.vue'
import ValidationErrorModal from '@/components/ValidationErrorModal.vue'
import AlertModal from '@/components/AlertModal.vue'
import { useAnalysis } from '@/composables/useAnalysis'

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
  <div class="flex-1 flex flex-col">
    <!-- Main Content -->
    <div class="flex-1 flex flex-col gap-2 md:gap-3 p-2 md:p-3 min-h-0">
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

    <!-- Status Bar -->
    <StatusBar
      :valid-packets="result?.validPackets ?? 0"
      :param-count="result?.packets?.[0]?.header?.paramCount?.decimal ?? 0"
      :diff-count="result?.diffCount ?? 0"
      :analyzed="isAnalyzed"
      :loading="isLoading"
    />

    <!-- Validation Error Modal -->
    <ValidationErrorModal
      v-show="showValidationModal"
      :errors="validationErrors"
      @close="closeValidationModal"
    />

    <!-- Alert Modal -->
    <AlertModal
      v-show="showAlertModal"
      :message="alertMessage"
      @close="closeAlertModal"
    />
  </div>
</template>
