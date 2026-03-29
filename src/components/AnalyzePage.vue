<script setup lang="ts">
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
import { useCtrlEnter } from '@/composables/useKeyboard'
import { formatParamCount } from '@/utils/hex'

import { computed } from 'vue'

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
  closeValidationModal,
  closeAlertModal,
} = useAnalysis()

useCtrlEnter(handleAnalyze)

const paramCountText = computed(() => {
  if (!result.value) return '0'
  return formatParamCount(result.value.packets)
})
</script>

<template>
  <div class="flex-1 flex flex-col">
    <div class="flex-1 flex flex-col gap-2 md:gap-3 p-2 md:p-3 min-h-0">
      <!-- Mobile Layout -->
      <div class="md:hidden flex flex-col gap-2 flex-1 min-h-0">
        <div class="flex-shrink-0" style="height: 200px;">
          <HexInput v-model:inputs="inputs" v-model:sendPacket="sendPacket" />
        </div>
        <div class="flex-shrink-0">
          <ActionPanel
            @import-file="handleImportFile"
            @export="handleExport"
            @analyze="handleAnalyze"
            @convert-decimal="handleConvertDecimal"
            @reset="handleReset"
          />
        </div>
        <div class="flex-shrink-0" style="height: 150px;">
          <BinaryDisplay :result="result" />
        </div>
        <div class="flex-shrink-0">
          <HeaderPanel :result="result" />
        </div>
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
        <div class="flex gap-3 flex-shrink-0" style="height: 280px;">
          <div class="w-[45%] min-w-0">
            <HexInput v-model:inputs="inputs" v-model:sendPacket="sendPacket" />
          </div>
          <div class="w-[10%] min-w-0">
            <ActionPanel
              @import-file="handleImportFile"
              @export="handleExport"
              @analyze="handleAnalyze"
              @convert-decimal="handleConvertDecimal"
              @reset="handleReset"
            />
          </div>
          <div class="w-[45%] min-w-0">
            <BinaryDisplay :result="result" />
          </div>
        </div>

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
      :valid-packets="result?.validPackets ?? 0"
      :param-count="paramCountText"
      :diff-count="result?.diffCount ?? 0"
      :analyzed="isAnalyzed"
      :loading="isLoading"
    />

    <ValidationErrorModal v-if="showValidationModal" :errors="validationErrors" @close="closeValidationModal" />

    <AlertModal v-if="showAlertModal" :message="alertMessage" @close="closeAlertModal" />
  </div>
</template>
