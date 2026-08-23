<script setup lang="ts">

import { computed } from 'vue'
import * as icons   from '@lucide/vue'

import type { IconName } from './Icon.vue'
import { Color, colorClasses } from './lib'

const props = withDefaults(
  defineProps<{
    text?:     string
    icon?:     IconName
    variant?:  'primary' | 'neutral'
    color?:    Color
    rounded?:  boolean
    disabled?: boolean
    small?:    boolean
  }>(),
  {
    variant:  'primary',
    color:    Color.Blue,
    disabled: false,
    rounded:  false,
    small:    false,
  },
)

const iconComponent = computed(() => (props.icon ? icons[props.icon] : null))

const pressShadowColor = computed(() =>
  props.variant === 'neutral' ? 'var(--color-gray-co)' : colorClasses[props.color].shadow,
)

</script>

<template>
  <button
    class="relative inline-flex press-shadow items-center justify-center text-center font-semibold cursor-pointer"
    :class="[
      rounded ? 'rounded-full' : 'rounded-medium',
      small ? 'gap-1 px-4 py-2 h-fit text-small' : 'gap-2',
      !small && (icon && !text ? 'py-2.75 px-5' : 'px-4 py-2'),
      variant === 'neutral' ? 'bg-white text-black/60' : [colorClasses[color].bg, 'text-white'],
    ]"
    :style="{ '--press-shadow-color': pressShadowColor }"
    type="button"
    :disabled="disabled"
  >
    <component :is="iconComponent" v-if="iconComponent" :size="small ? 16 : 18" />
    <span v-if="text">{{ text }}</span>
  </button>
</template>
