<script setup lang="ts">

import { onBeforeUnmount, onMounted, ref } from 'vue'

defineProps<{
  message: string
}>()

const visible = ref(false)
const root    = ref<HTMLElement | null>(null)

function toggle() {
  visible.value = !visible.value
}

function handleClickOutside(event: MouseEvent) {
  if (root.value && !root.value.contains(event.target as Node)) visible.value = false
}

onMounted(() => document.addEventListener('mousedown', handleClickOutside))
onBeforeUnmount(() => document.removeEventListener('mousedown', handleClickOutside))

</script>

<template>
  <span ref="root" class="relative inline-block">
    <span class="cursor-pointer text-blue" @click="toggle">
      <slot />
    </span>

    <Transition name="hint-pop">
      <div v-if="visible"
        class="absolute left-0 top-full z-20 mt-2 w-64 rounded-medium bg-white p-3 text-small font-medium text-black shadow-flat"
      >
        {{ message }}
      </div>
    </Transition>
  </span>
</template>

<style scoped>
.hint-pop-enter-active,
.hint-pop-leave-active {
  transition: opacity 150ms ease, transform 150ms ease;
}

.hint-pop-enter-from,
.hint-pop-leave-to {
  opacity: 0;
  transform: translateY(-0.25rem);
}
</style>
