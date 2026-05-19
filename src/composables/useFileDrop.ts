import { onMounted, onUnmounted } from 'vue'

/** 文件拖放监听器集合 */
const dropListeners = new Set<(file: File) => void>()
/** 是否已注册全局监听器 */
let isGlobalListenerRegistered = false

/**
 * 检查拖放事件是否包含外部文件
 * @param e - 拖放事件对象
 * @returns 是否包含文件
 */
function hasFiles(e: DragEvent): boolean {
  if (!e.dataTransfer)
    return false
  return e.dataTransfer.types.includes('Files') && e.dataTransfer.files.length > 0
}

/**
 * 处理全局 dragover 事件，允许 drop
 * @param e - 拖放事件对象
 */
function handleGlobalDragOver(e: DragEvent) {
  if (hasFiles(e)) {
    e.preventDefault()
  }
}

/**
 * 处理全局拖放事件
 * @param e - 拖放事件对象
 */
function handleGlobalDrop(e: DragEvent) {
  if (!hasFiles(e))
    return
  e.preventDefault()
  const file = e.dataTransfer!.files[0]
  dropListeners.forEach(listener => listener(file))
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
      window.addEventListener('dragover', handleGlobalDragOver)
      window.addEventListener('drop', handleGlobalDrop)
      isGlobalListenerRegistered = true
    }
  })

  onUnmounted(() => {
    dropListeners.delete(onFileDrop)
    if (dropListeners.size === 0 && isGlobalListenerRegistered) {
      window.removeEventListener('dragover', handleGlobalDragOver)
      window.removeEventListener('drop', handleGlobalDrop)
      isGlobalListenerRegistered = false
    }
  })
}
