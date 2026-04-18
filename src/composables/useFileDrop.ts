import { onMounted, onUnmounted } from 'vue'

const dropListeners = new Set<(file: File) => void>()
let isGlobalListenerRegistered = false

function handleGlobalDrop(e: DragEvent) {
  e.preventDefault()
  if (e.dataTransfer?.files.length) {
    dropListeners.forEach(listener => listener(e.dataTransfer!.files[0]))
  }
}

export function useFileDrop(onFileDrop: (file: File) => void) {
  onMounted(() => {
    dropListeners.add(onFileDrop)
    if (!isGlobalListenerRegistered) {
      window.addEventListener('drop', handleGlobalDrop)
      isGlobalListenerRegistered = true
    }
  })

  onUnmounted(() => {
    dropListeners.delete(onFileDrop)
    if (dropListeners.size === 0 && isGlobalListenerRegistered) {
      window.removeEventListener('drop', handleGlobalDrop)
      isGlobalListenerRegistered = false
    }
  })
}
