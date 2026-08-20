<script setup lang="ts">
import { computed } from 'vue'
import * as icons from '@lucide/vue'
import { ThemeColor } from '../../lib/colors'

type IconName = Exclude<keyof typeof icons, 'icons' | 'Icon' | 'createLucideIcon' | 'LUCIDE_CONTEXT' | 'setLucideProps' | 'useLucideProps'>

const props = withDefaults(
  defineProps<{
    name: IconName
    color?: ThemeColor
    size?: number
  }>(),
  { color: ThemeColor.Primary, size: 20 }
)

const colorClasses: Record<ThemeColor, string> = {
  [ThemeColor.Primary]: 'text-primary',
  [ThemeColor.Danger]: 'text-danger',
}

const classes = computed(() => colorClasses[props.color])
const component = computed(() => icons[props.name])
</script>

<template>
  <component :is="component" :size="size" :class="classes" />
</template>
