<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, watch } from 'vue'
import ActionPanel from '@/components/ActionPanel.vue'
import MessageModal from '@/components/base/MessageModal.vue'
import BinaryDisplay from '@/components/BinaryDisplay.vue'
import DiffArea from '@/components/DiffArea.vue'
import HeaderPanel from '@/components/HeaderPanel.vue'
import HexInput from '@/components/HexInput.vue'
import PageLayout from '@/components/layout/PageLayout.vue'
import OutputArea from '@/components/OutputArea.vue'
import { useAnalysisStore } from '@/stores/analysis'
import { formatParamCount, separatePackets } from '@/utils'

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

const store = useAnalysisStore()
const {
  hexByteSize,
  isLoading,
  result,
  isAnalyzed,
  validationErrors,
  showValidationModal,
  alertMessage,
  showAlertModal,
} = storeToRefs(store)

const paramCountText = computed(() => {
  if (!result.value)
    return '0'
  const { receivePackets } = separatePackets(result.value.packets)
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
    <div class="flex gap-3 flex-shrink-0" style="height: 280px">
      <div class="w-[45%] min-w-0">
        <HexInput />
      </div>
      <div class="w-[10%] min-w-0">
        <ActionPanel
          @import-file="store.handleImportFile"
          @export="store.handleExport"
          @reset="store.handleReset"
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
          <OutputArea :result="result" :hex-byte-size="hexByteSize" @update:hex-byte-size="store.handleHexByteSizeChange" />
        </div>
        <div class="h-[50%] overflow-hidden">
          <DiffArea :result="result" :hex-byte-size="hexByteSize" />
        </div>
      </div>
      <div class="w-[20%] min-w-0 h-full">
        <HeaderPanel :result="result" />
      </div>
    </div>
  </PageLayout>

  <MessageModal
    v-if="showValidationModal"
    title="校验不通过"
    :errors="validationErrors"
    type="error"
    @close="store.closeValidationModal"
  />

  <MessageModal
    v-if="showAlertModal"
    :message="alertMessage"
    @close="store.closeAlertModal"
  />
</template>
