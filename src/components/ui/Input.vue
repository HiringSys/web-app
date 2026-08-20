<script setup lang="ts">
import { computed } from 'vue'
import { ThemeColor } from '../../lib/colors'

const props = withDefaults(
  defineProps<{
    color?: ThemeColor
    placeholder?: string
    type?: string
    disabled?: boolean
  }>(),
  {
    color: ThemeColor.Primary,
    type: 'text',
    disabled: false,
  },
)

const model = defineModel<string>({ default: '' })

const colorClasses: Record<ThemeColor, string> = {
  [ThemeColor.Primary]: 'focus:border-primary focus:outline-primary',
  [ThemeColor.Danger]: 'focus:border-danger focus:outline-danger',
}

const classes = computed(() => colorClasses[props.color])
</script>

<template>
  <input
    v-model="model"
    :type="type"
    :placeholder="placeholder"
    :disabled="disabled"
    :class="classes"
    class="w-full rounded-medium border border-gray-300 px-3 py-2 text-sm outline-offset-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
  />
</template>
