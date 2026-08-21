<script setup lang="ts">

const props = withDefaults(
  defineProps<{
    text:      string
    rounded?:  boolean
    disabled?: boolean
  }>(),
  {
    disabled: false,
    rounded:  false,
  },
)

</script>

<template>
  <button class="relative inline-flex transition-all font-medium text-white px-4 py-2 bg-blue cursor-pointer shadow-[0_5.5px_0_0_var(--color-blue-co)] hover:shadow-[0_4px_0_0_var(--color-blue-co)] active:shadow-[0_0px_0_0_var(--color-blue-co)] hover:translate-y-1 active:translate-y-2"
  :class="rounded ? 'rounded-full' : 'rounded-medium'"
  type="button"
  :disabled="disabled">
    {{ text }}
  </button>
</template>
