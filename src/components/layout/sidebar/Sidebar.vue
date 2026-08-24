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
    class="sidebar-shell fixed inset-y-0 right-0 z-50 h-full shrink-0 overflow-hidden bg-gray shadow-soft transition-[width] duration-300 ease-in-out xl:relative xl:bg-transparent xl:shadow-none"
    :class="{ open: modelValue }"
    :style="{ '--sidebar-width': width }"
  >
    <div class="flex h-full w-full flex-col">
      <div class="flex items-center justify-between px-4 pt-4 pb-4 sm:pt-8">
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

@media (min-width: 640px) and (max-width: 1279px) {
  .sidebar-shell.open { width: min(90vw, 36rem); }
}

@media (min-width: 1280px) {
  .sidebar-shell.open { width: var(--sidebar-width); }
}
</style>
