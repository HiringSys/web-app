<script setup lang="ts">

import { computed } from 'vue'
import { Seniority } from '../types'

const props = defineProps<{
  seniority: Seniority
}>()

const CONFIG: Record<Seniority, { label: string; bg: string; shadowColor: string }> = {
  [Seniority.SemExperiencia]: { label: 'Sem experiência', bg: 'bg-pink',   shadowColor: 'var(--color-pink-co)'   },
  [Seniority.Estagiario]:     { label: 'Estagiário',      bg: 'bg-purple', shadowColor: 'var(--color-purple-co)' },
  [Seniority.Junior]:         { label: 'Junior',          bg: 'bg-green',  shadowColor: 'var(--color-green-co)'  },
  [Seniority.Pleno]:          { label: 'Pleno',           bg: 'bg-blue',   shadowColor: 'var(--color-blue-co)'   },
  [Seniority.Senior]:         { label: 'Senior',          bg: 'bg-yellow', shadowColor: 'var(--color-yellow-co)' },
}

const config = computed(() => CONFIG[props.seniority])

</script>

<template>
  <span
    class="inline-flex w-fit items-center px-3 py-1 rounded-low text-small text-white font-semibold cursor-default select-none press-shadow"
    :class="config.bg"
    :style="{ '--press-shadow-color': config.shadowColor }"
  >
    {{ config.label }}
  </span>
</template>
