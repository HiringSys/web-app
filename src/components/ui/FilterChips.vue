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
      class="rounded-full px-4 py-2 text-center font-semibold cursor-pointer transition-all duration-150 press-shadow"
      :class="active.includes(option.key) ? 'bg-blue text-white' : 'bg-white text-black/60'"
      :style="{ '--press-shadow-color': active.includes(option.key) ? 'var(--color-blue-co)' : 'var(--color-gray-co)' }"
      @click="toggle(option.key)"
    >
      {{ option.label }}
    </button>

    <Button icon="Filter" variant="neutral" rounded />
  </div>
</template>
