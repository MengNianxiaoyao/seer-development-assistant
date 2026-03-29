<script setup lang="ts">
import BaseModal from "@/components/BaseModal.vue";
import Button from "@/components/Button.vue";

defineProps<{
  message: string;
}>();

const emit = defineEmits<{
  close: [];
}>();
</script>

<template>
  <BaseModal title="提示" @close="emit('close')">
    <div class="px-5 py-5">
      <p class="text-sm text-gray-600 leading-relaxed text-center">
        {{ message }}
      </p>
    </div>
    <template #footer>
      <Button type="primary" @click="emit('close')">确定</Button>
    </template>
  </BaseModal>
</template>
