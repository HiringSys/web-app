<script setup lang="ts">

import { computed } from 'vue'
import * as icons   from '@lucide/vue'

import type { IconName } from './Icon.vue'

const props = withDefaults(
  defineProps<{
    text?:     string
    icon?:     IconName
    variant?:  'primary' | 'neutral'
    rounded?:  boolean
    disabled?: boolean
  }>(),
  {
    variant:  'primary',
    disabled: false,
    rounded:  false,
  },
)

const iconComponent = computed(() => (props.icon ? icons[props.icon] : null))

</script>

<template>
  <button
    class="relative inline-flex press-shadow items-center justify-center gap-2 text-center font-semibold cursor-pointer"
    :class="[rounded ? 'rounded-full' : 'rounded-medium', icon && !text ? 'py-2.75 px-5' : 'px-4 py-2', variant === 'neutral' ? 'bg-white text-black/60' : 'bg-blue text-white', ]"
    :style="{ '--press-shadow-color': variant === 'neutral' ? 'var(--color-gray-co)' : 'var(--color-blue-co)' }"
    type="button"
    :disabled="disabled"
  >
    <component :is="iconComponent" v-if="iconComponent" :size="18" />
    <span v-if="text">{{ text }}</span>
  </button>
</template>
