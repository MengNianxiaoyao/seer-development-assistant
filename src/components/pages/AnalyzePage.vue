<script setup lang="ts">
import { computed, watch } from 'vue'
import ActionPanel from '@/components/ActionPanel.vue'
import AlertModal from '@/components/base/AlertModal.vue'
import BinaryDisplay from '@/components/BinaryDisplay.vue'
import DiffArea from '@/components/DiffArea.vue'
import HeaderPanel from '@/components/HeaderPanel.vue'
import HexInput from '@/components/HexInput.vue'
import OutputArea from '@/components/OutputArea.vue'
import PageLayout from '@/components/layout/PageLayout.vue'
import ValidationErrorModal from '@/components/base/ValidationErrorModal.vue'
import { useAnalysis } from '@/composables/useAnalysis'

import { formatParamCount, getReceivePackets } from '@/utils'

const emit = defineEmits<{
  statusChange: [
    status: {
      validPackets: number
      paramCount: string
      diffCount: number
      analyzed: boolean
      loading: boolean
    },
  ]
}>()

const {
  displayFormat,
  isLoading,
  result,
  isAnalyzed,
  validationErrors,
  showValidationModal,
  alertMessage,
  showAlertModal,
  handleReset,
  handleConvertDecimal,
  handleExport,
  handleImportFile,
  closeValidationModal,
  closeAlertModal,
} = useAnalysis()

const paramCountText = computed(() => {
  if (!result.value)
    return '0'
  const receivePackets = getReceivePackets(result.value.packets)
  return formatParamCount(receivePackets)
})

watch(
  [result, isAnalyzed, isLoading],
  () => {
    emit('statusChange', {
      validPackets: result.value?.validPackets ?? 0,
      paramCount: paramCountText.value,
      diffCount: result.value?.diffCount ?? 0,
      analyzed: isAnalyzed.value,
      loading: isLoading.value,
    })
  },
  { immediate: true },
)
</script>

<template>
  <PageLayout>
    <!-- Mobile Layout -->
    <div class="md:hidden flex flex-col gap-2 flex-1 min-h-0">
      <div class="flex-shrink-0" style="height: 200px">
        <HexInput />
      </div>
      <div class="flex-shrink-0">
        <ActionPanel
          @import-file="handleImportFile"
          @export="handleExport"
          @convert-decimal="handleConvertDecimal"
          @reset="handleReset"
        />
      </div>
      <div class="flex-shrink-0" style="height: 150px">
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
      <div class="flex gap-3 flex-shrink-0" style="height: 280px">
        <div class="w-[45%] min-w-0">
          <HexInput />
        </div>
        <div class="w-[10%] min-w-0">
          <ActionPanel
            @import-file="handleImportFile"
            @export="handleExport"
            @convert-decimal="handleConvertDecimal"
            @reset="handleReset"
          />
        </div>
        <div class="w-[45%] min-w-0">
          <BinaryDisplay :result="result" />
        </div>
      </div>

      <div
        class="flex gap-3 flex-shrink-0"
        style="
          height: calc(100vh - 340px);
          min-height: 300px;
          max-height: 560px;
        "
      >
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
  </PageLayout>

  <ValidationErrorModal
    v-if="showValidationModal"
    :errors="validationErrors"
    @close="closeValidationModal"
  />

  <AlertModal
    v-if="showAlertModal"
    :message="alertMessage"
    @close="closeAlertModal"
  />
</template>
