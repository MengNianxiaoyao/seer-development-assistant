import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { STORAGE_KEY, DEFAULT_COMMANDS } from '@/constants'

export const useSettingsStore = defineStore('settings', () => {
  const specialCommandIds = ref<number[]>(loadFromStorage())

  function loadFromStorage(): number[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.every(n => typeof n === 'number')) {
          return parsed
        }
      }
    }
    catch {
      // ignore
    }
    return [...DEFAULT_COMMANDS]
  }

  function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(specialCommandIds.value))
  }

  watch(specialCommandIds, saveToStorage, { deep: true })

  function addCommandId(id: number) {
    if (!Number.isInteger(id) || id <= 0)
      return false
    if (specialCommandIds.value.includes(id))
      return false
    specialCommandIds.value.push(id)
    return true
  }

  function removeCommandId(id: number) {
    const index = specialCommandIds.value.indexOf(id)
    if (index === -1)
      return false
    specialCommandIds.value.splice(index, 1)
    return true
  }

  function resetToDefault() {
    specialCommandIds.value = [...DEFAULT_COMMANDS]
  }

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
