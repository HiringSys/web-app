<script setup lang="ts">
import { computed } from 'vue'
import { Check, X } from '@lucide/vue'
import type { CandidateStatus } from '../types'
import { Color, colorClasses } from '../../lib'

const props = defineProps<{
  status: CandidateStatus
}>()

const config = computed(() =>
  props.status === 'aprovado'
    ? { label: 'Aprovado',  icon: Check, color: Color.Blue }
    : { label: 'Reprovado', icon: X,     color: Color.Red  },
)
</script>

<template>
  <span class="inline-flex w-fit items-center gap-1 px-3 py-2 rounded-low text-small leading-none text-white font-semibold cursor-default select-none press-shadow"
    :class="colorClasses[config.color].bg"
    :style="{ '--press-shadow-color': colorClasses[config.color].shadow }"
  >
    {{ config.label }}
    <component :is="config.icon" :size="16" :stroke-width="2.2" />
  </span>
</template>
