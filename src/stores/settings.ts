import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { DEFAULT_COMMANDS, STORAGE_KEY } from '@/constants'

/**
 * 设置 Store
 * 管理应用程序的设置选项，特别是特殊命令ID的管理
 */
export const useSettingsStore = defineStore('settings', () => {
  /** 特殊命令ID列表 */
  const specialCommandIds = ref<number[]>(loadFromStorage())

  /**
   * 从本地存储加载特殊命令ID列表
   * @returns 命令ID数组
   */
  function loadFromStorage(): number[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.every(item => typeof item === 'number')) {
          return parsed
        }
      }
    }
    catch {
      // ignore
    }
    return [...DEFAULT_COMMANDS]
  }

  /**
   * 保存到本地存储
   */
  function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(specialCommandIds.value))
  }

  watch(specialCommandIds, saveToStorage, { deep: true })

  /**
   * 添加特殊命令ID
   * @param id - 命令ID
   * @returns 是否添加成功
   */
  function addCommandId(id: number) {
    if (!Number.isInteger(id) || id <= 0)
      return false
    if (specialCommandIds.value.includes(id))
      return false
    specialCommandIds.value.push(id)
    return true
  }

  /**
   * 移除特殊命令ID
   * @param id - 命令ID
   * @returns 是否移除成功
   */
  function removeCommandId(id: number) {
    const index = specialCommandIds.value.indexOf(id)
    if (index === -1)
      return false
    specialCommandIds.value.splice(index, 1)
    return true
  }

  /**
   * 重置为默认命令ID
   */
  function resetToDefault() {
    specialCommandIds.value = [...DEFAULT_COMMANDS]
  }

  /**
   * 检查是否为特殊命令
   * @param id - 命令ID
   * @returns 是否为特殊命令
   */
  function isSpecialCommand(id: number): boolean {
    return specialCommandIds.value.includes(id)
  }

  return {
    specialCommandIds,
    addCommandId,
    removeCommandId,
    resetToDefault,
    isSpecialCommand,
  }
})
