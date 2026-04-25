<script setup lang="ts">
defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  close: []
}>()
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        @click="emit('close')"
      >
        <div
          class="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 text-center"
          @click.stop
        >
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
            <svg
              class="w-8 h-8 text-amber-500"
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
          <h2 class="text-lg font-bold text-gray-800 mb-2">
            请使用PC端浏览器
          </h2>
          <p class="text-sm text-gray-500 mb-4">
            请在电脑上使用 Chrome、Edge 或 Firefox 等浏览器访问。
          </p>
          <button
            class="w-full py-2 px-4 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-lg font-medium hover:from-purple-500 hover:to-violet-500 transition-all"
            @click="emit('close')"
          >
            我知道了
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
