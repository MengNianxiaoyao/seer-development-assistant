<script setup lang="ts">
import type { ValidationError } from '@/types'
import BaseModal from '@/components/BaseModal.vue'
import Button from '@/components/Button.vue'

defineProps<{
  errors: ValidationError[]
}>()

const emit = defineEmits<{
  close: []
}>()
</script>

<template>
  <BaseModal
    title="校验不通过"
    icon="error"
    width="500px"
    @close="emit('close')"
  >
    <div class="p-5 space-y-3">
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
    <template #footer>
      <Button @click="emit('close')">
        关闭
      </Button>
    </template>
  </BaseModal>
</template>
