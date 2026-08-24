<script setup lang="ts">

import { computed } from 'vue'
import * as icons   from '@lucide/vue'
import { twMerge }  from 'tailwind-merge'

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
    class?:    string
    toggled?:  boolean
    type?:     'button' | 'submit'
    ariaLabel?: string
  }>(),
  {
    variant:  'primary',
    color:    Color.Blue,
    disabled: false,
    rounded:  false,
    small:    false,
    toggled:  false,
    type:     'button',
  },
)

const iconComponent = computed(() => (props.icon ? icons[props.icon] : null))

const pressShadowColor = computed(() => {
  if (props.disabled) return 'var(--color-gray-co)'
  return props.variant === 'neutral' ? 'var(--color-gray-co)' : colorClasses[props.color].shadow
})

const buttonClasses = computed(() => twMerge(
  'relative inline-flex press-shadow items-center justify-center text-center [&>span]:font-semibold! cursor-pointer',
  props.rounded ? 'rounded-full' : 'rounded-medium',
  props.small   ? 'gap-1 px-4 py-2 h-fit text-small' : 'gap-2',
  !props.small  && (props.icon && !props.text ? 'py-2.75 px-5' : 'px-4 py-2'),
  props.variant === 'neutral' ? 'bg-white text-black/60' : [colorClasses[props.color].bg, 'text-white'],
  props.disabled ? 'cursor-not-allowed pointer-events-none bg-white text-black/45 opacity-80 grayscale-[20%]' : '',
  props.class,
))

const buttonStyle = computed(() => ({
  '--press-shadow-color': pressShadowColor.value,
  ...(props.disabled
    ? { boxShadow: '0 3px 0 0 var(--press-shadow-color)', transform: 'none' }
    : props.toggled
    ? { boxShadow: '0 4px 0 0 var(--press-shadow-color)', transform: 'translateY(0.25rem)' }
    : {}),
}))

</script>

<template>
  <button
    :class="buttonClasses"
    :style="buttonStyle"
    :disabled="disabled"
    :type="type"
    :aria-label="ariaLabel ?? text"
  >
    <component :is="iconComponent" v-if="iconComponent" :size="small ? 16 : 18" />
    <span v-if="text">{{ text }}</span>
  </button>
</template>
