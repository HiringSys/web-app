<script setup lang="ts">
import { computed } from 'vue'
import { ThemeColor } from '../../lib/colors'

const props = withDefaults(
  defineProps<{
    text: string
    color?: ThemeColor
    disabled?: boolean
  }>(),
  {
    color: ThemeColor.Primary,
    disabled: false,
  },
)

const colorClasses: Record<ThemeColor, string> = {
  [ThemeColor.Primary]: 'bg-primary hover:bg-primary-hover text-primary-foreground focus-visible:outline-primary',
  [ThemeColor.Danger]: 'bg-danger hover:bg-danger-hover text-danger-foreground focus-visible:outline-danger',
}

const classes = computed(() => colorClasses[props.color])
</script>

<template>
  <button type="button"
    :disabled="disabled"
    :class="classes"
    class="inline-flex items-center justify-center rounded-medium px-4 py-2 text-sm font-medium"
  >
    {{ text }}
  </button>
</template>
