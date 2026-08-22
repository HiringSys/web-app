<script setup lang="ts">

import Button from './Button.vue'

defineProps<{
  options: { key: string; label: string }[]
}>()

const active = defineModel<string[]>({ default: () => [] })

function toggle(key: string) {
  active.value = active.value.includes(key)
    ? active.value.filter((activeKey) => activeKey !== key)
    : [...active.value, key]
}

</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <button
      v-for="option in options"
      :key="option.key"
      type="button"
      class="rounded-full px-4 py-2 text-center font-semibold cursor-pointer transition-all duration-150"
      :class="active.includes(option.key)
        ? 'press-shadow bg-blue text-white'
        : 'bg-gray text-black/40 hover:text-black/60'"
      :style="active.includes(option.key) ? { '--press-shadow-color': 'var(--color-blue-co)' } : {}"
      @click="toggle(option.key)"
    >
      {{ option.label }}
    </button>

    <Button icon="Filter" variant="neutral" rounded />
  </div>
</template>
