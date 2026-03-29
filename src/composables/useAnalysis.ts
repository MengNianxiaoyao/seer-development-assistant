import { storeToRefs } from 'pinia'
import { useAnalysisStore } from '@/stores/analysis'

export function useAnalysis() {
  const store = useAnalysisStore()

  return {
    ...storeToRefs(store),
    doAnalyze: store.doAnalyze,
    handleReset: store.handleReset,
    handleConvertDecimal: store.handleConvertDecimal,
    handleExport: store.handleExport,
    handleImportFile: store.handleImportFile,
    closeValidationModal: store.closeValidationModal,
    closeAlertModal: store.closeAlertModal,
  }
}
