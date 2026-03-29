<script setup lang="ts">
import { useEscapeKey } from '@/composables/useKeyboard'

defineProps<{
  title?: string
  icon?: 'info' | 'warning' | 'error'
  width?: string
}>()

const emit = defineEmits<{
  close: []
}>()

useEscapeKey(() => emit('close'))
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-show="true"
        class="fixed inset-0 z-50 flex items-center justify-center"
        @click.self="emit('close')"
      >
        <div class="modal-backdrop absolute inset-0" @click="emit('close')" />
        <div class="modal-dialog relative" :style="{ width: width || '400px' }">
          <div class="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh]">
            <div
              v-if="title"
              class="px-5 py-4 border-b border-gray-100 flex items-center justify-center flex-shrink-0"
              :class="{
                'bg-gradient-to-r from-gray-50 to-white': !icon || icon === 'info',
                'bg-gradient-to-r from-red-50 to-white': icon === 'error',
                'bg-gradient-to-r from-yellow-50 to-white': icon === 'warning',
              }"
            >
              <div class="flex items-center gap-2">
                <slot name="icon">
                  <div
                    class="w-8 h-8 rounded-full flex items-center justify-center"
                    :class="{
                      'bg-purple-100': !icon || icon === 'info',
                      'bg-red-100': icon === 'error',
                      'bg-yellow-100': icon === 'warning',
                    }"
                  >
                    <svg
                      v-if="!icon || icon === 'info'"
                      class="w-4 h-4 text-purple-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <svg
                      v-else-if="icon === 'error'"
                      class="w-4 h-4 text-red-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    <svg
                      v-else-if="icon === 'warning'"
                      class="w-4 h-4 text-yellow-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                </slot>
                <h2
                  class="text-sm font-semibold"
                  :class="{
                    'text-gray-800': !icon || icon === 'info',
                    'text-red-600': icon === 'error',
                    'text-yellow-600': icon === 'warning',
                  }"
                >
                  {{ title }}
                </h2>
              </div>
            </div>
            <div class="flex-1 overflow-y-auto">
              <slot />
            </div>
            <div class="px-5 py-4 border-t border-gray-100 flex justify-center bg-gray-50/50 flex-shrink-0">
              <slot name="footer" />
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
