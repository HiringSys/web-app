<script setup lang="ts">
import Button from "@@/ui/Button.vue";

defineProps<{
  options: {
    key: string;
    label: string;
    color?: { bg: string; text: string; shadow: string };
  }[];
}>();

const active = defineModel<string[]>({ default: () => [] });

defineEmits<{
  "open-filters": [];
}>();

function toggle(key: string) {
  if (active.value.includes(key)) {
    if (active.value.length === 1) return;
    active.value = active.value.filter((activeKey) => activeKey !== key);
  } else {
    active.value = [...active.value, key];
  }
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <button
      v-for="option in options"
      :key="option.key"
      type="button"
      class="rounded-full px-4 py-2 text-center font-semibold cursor-pointer transition-all duration-150 press-shadow shrink-0 whitespace-nowrap"
      :class="
        active.includes(option.key)
          ? [option.color?.bg ?? 'bg-blue', option.color?.text ?? 'text-white']
          : 'bg-white text-black/60'
      "
      :style="{
        '--press-shadow-color': active.includes(option.key)
          ? (option.color?.shadow ?? 'var(--color-blue-co)')
          : 'var(--color-gray-co)',
      }"
      @click="toggle(option.key)"
    >
      {{ option.label }}
    </button>

    <Button icon="Filter" variant="neutral" rounded @click="$emit('open-filters')" />
  </div>
</template>
