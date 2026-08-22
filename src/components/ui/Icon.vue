<script setup lang="ts">

import * as icons     from '@lucide/vue'
import { computed }   from 'vue'

export type IconName = Exclude<keyof typeof icons, 'icons' | 'Icon' | 'createLucideIcon' | 'LUCIDE_CONTEXT' | 'setLucideProps' | 'useLucideProps'>

const props = withDefaults(
  defineProps<{
    name:   IconName
    color?: string
    size?:  number
  }>(),
  { color: "black", size: 20 }
)

const component = computed(() => icons[props.name])

</script>

<template>
  <component :is="component" :size="size" :class="'text-' + color" />
</template>
