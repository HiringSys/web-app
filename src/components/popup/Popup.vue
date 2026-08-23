<script setup lang="ts">

import { onBeforeUnmount, onMounted } from 'vue'
import Button                         from '@/components/ui/Button.vue'

withDefaults(
  defineProps<{
    modelValue: boolean
    title?:     string
    width?:     string
  }>(),
  {
    width: '28rem',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

function close() {
  emit('update:modelValue', false)
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') close()
}

onMounted(() => document.addEventListener('keydown', handleKeydown))
onBeforeUnmount(() => document.removeEventListener('keydown', handleKeydown))

</script>

<template>
  <Teleport to="body">
    <Transition name="popup">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        @mousedown.self="close"
      >
        <div class="popup-box flex max-h-[90vh] w-full flex-col overflow-hidden rounded-medium bg-white shadow-lg" :style="{ maxWidth: width }">
          <div class="flex items-center justify-between gap-4 border-b border-black/10 p-4">
            <h3 v-if="title" class="leading-none">{{ title }}</h3>
            <Button icon="X" variant="neutral" small class="ml-auto" @click="close" />
          </div>

          <div class="flex-1 overflow-y-auto p-4">
            <slot />
          </div>

          <div v-if="$slots.actions" class="flex items-center justify-end gap-3 border-t border-black/10 p-4">
            <slot name="actions" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.popup-enter-active,
.popup-leave-active {
  transition: opacity 150ms ease;
}

.popup-enter-active .popup-box,
.popup-leave-active .popup-box {
  transition: opacity 150ms ease, transform 150ms ease;
}

.popup-enter-from,
.popup-leave-to {
  opacity: 0;
}

.popup-enter-from .popup-box,
.popup-leave-to .popup-box {
  opacity: 0;
  transform: scale(0.96) translateY(0.5rem);
}
</style>
