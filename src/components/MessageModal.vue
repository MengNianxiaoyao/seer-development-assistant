<script setup lang="ts">
import type { ValidationError } from '@/types'
import BaseModal from '@/components/BaseModal.vue'
import Button from '@/components/Button.vue'

defineProps<{
  title?: string
  message?: string
  errors?: ValidationError[]
  type?: 'info' | 'warning' | 'error'
}>()

const emit = defineEmits<{
  close: []
}>()
</script>

<template>
  <BaseModal
    :title="title || '提示'"
    :icon="type === 'error' ? 'error' : type === 'warning' ? 'warning' : 'info'"
    @close="emit('close')"
  >
    <div class="px-5 py-5">
      <div
        v-if="message"
        class="text-sm text-gray-600 leading-relaxed text-center"
      >
        {{ message }}
      </div>
      <div v-if="errors && errors.length > 0" class="space-y-3">
        <div v-for="err in errors" :key="err.label" class="text-center">
          <div
            class="text-xs font-semibold text-gray-700 mb-1.5 inline-flex items-center gap-1.5"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-red-400" />
            {{ err.label }}
          </div>
          <div
            class="bg-red-50 border border-red-100 rounded-lg p-3 space-y-1 text-left"
          >
            <div
              v-for="(reason, idx) in err.reasons"
              :key="idx"
              class="text-xs text-red-500 flex items-start gap-1.5"
            >
              <span>{{ reason }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <template #footer>
      <Button type="primary" @click="emit('close')">
        确定
      </Button>
    </template>
  </BaseModal>
</template>
