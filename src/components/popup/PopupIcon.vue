<script setup lang="ts">

import { onBeforeUnmount, onMounted } from 'vue'

withDefaults(
  defineProps<{
    modelValue: boolean
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
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        v-if="modelValue"
        @mousedown.self="close"
      >
        <div class="popup-box flex w-full flex-col overflow-hidden rounded-medium bg-gray shadow-soft py-6" :style="{ maxWidth: width }">
          <div class="flex flex-col px-6 overflow-y-auto">
            <div class="flex-1 overflow-y-auto scrollbar-hide">
              <slot />
            </div>
  
            <div v-if="$slots.actions" class="flex items-center justify-end gap-3 pt-4 pb-8">
              <slot name="actions" />
            </div>
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
