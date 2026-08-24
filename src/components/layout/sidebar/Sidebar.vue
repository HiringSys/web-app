<script setup lang="ts">
import Button from "@@/ui/Button.vue";

withDefaults(
  defineProps<{
    modelValue: boolean;
    title?: string;
    width?: string;
  }>(),
  {
    width: "40%",
  },
);

defineEmits<{
  "update:modelValue": [value: boolean];
}>();
</script>

<template>
  <aside
    class="sidebar-shell fixed inset-y-0 right-0 z-30 h-full shrink-0 overflow-hidden bg-gray shadow-soft transition-[width] duration-300 ease-in-out md:relative md:bg-transparent md:shadow-none"
    :class="{ open: modelValue }"
    :style="{ '--sidebar-width': width }"
  >
    <div class="flex h-full w-full flex-col">
      <div class="flex items-center justify-between px-4 pt-8 pb-4">
        <Button
          icon="X"
          variant="neutral"
          class="ml-auto"
          @click="$emit('update:modelValue', false)"
        />
      </div>

      <div class="flex-1 overflow-y-auto px-4 pb-8">
        <slot />
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar-shell { width: 0; }
.sidebar-shell.open { width: 100%; }

@media (min-width: 768px) {
  .sidebar-shell.open { width: var(--sidebar-width); }
}
</style>
