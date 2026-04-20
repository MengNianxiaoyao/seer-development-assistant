import { onMounted, onUnmounted } from 'vue'

/** 文件拖放监听器集合 */
const dropListeners = new Set<(file: File) => void>()
/** 是否已注册全局监听器 */
let isGlobalListenerRegistered = false

/**
 * 处理全局拖放事件
 * @param e - 拖放事件对象
 */
function handleGlobalDrop(e: DragEvent) {
  e.preventDefault()
  if (e.dataTransfer?.files.length) {
    dropListeners.forEach(listener => listener(e.dataTransfer!.files[0]))
  }
}

/**
 * 文件拖放 composable
 * 注册全局文件拖放监听
 * @param onFileDrop - 文件放下时的回调函数
 */
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
