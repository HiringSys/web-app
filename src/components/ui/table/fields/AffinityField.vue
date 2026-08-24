<script setup lang="ts">

import { computed } from 'vue'
import { Clock } from '@lucide/vue'

const props = defineProps<{
  affinity: number | null
}>()

const config = computed(() => {
  if (props.affinity === null) {
    return {
      bg: 'bg-white',
      text: 'text-black/55',
      shadowColor: 'var(--color-gray-co)',
      label: 'Em análise',
      pending: true,
    }
  }

  if (props.affinity >= 70) return { bg: 'bg-green',  text: 'text-white', shadowColor: 'var(--color-green-co)',  label: `${props.affinity}%`, pending: false }
  if (props.affinity >= 40) return { bg: 'bg-yellow', text: 'text-white', shadowColor: 'var(--color-yellow-co)', label: `${props.affinity}%`, pending: false }
  return                           { bg: 'bg-red',    text: 'text-white', shadowColor: 'var(--color-red-co)',    label: `${props.affinity}%`, pending: false }
})

</script>

<template>
  <span
    class="inline-flex w-fit items-center gap-1.5 rounded-low px-3 py-1 text-small font-semibold cursor-default select-none press-shadow"
    :class="[config.bg, config.text]"
    :style="{ '--press-shadow-color': config.shadowColor }"
    :aria-label="config.pending ? 'Score de proximidade em análise' : `Afinidade de ${affinity} por cento`"
    :title="config.pending ? 'O score de proximidade ainda não foi calculado' : undefined"
  >
    <Clock v-if="config.pending" :size="14" :stroke-width="2.4" />
    {{ config.label }}
  </span>
</template>
