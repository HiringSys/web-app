<script setup lang="ts">
import { computed } from 'vue'
import { Check, X } from '@lucide/vue'
import type { CandidateStatus } from '../types'

const props = defineProps<{
  status: CandidateStatus
}>()

const config = computed(() =>
  props.status === 'aprovado'
    ? { label: 'Aprovado',  icon: Check, classes: 'bg-blue' }
    : { label: 'Reprovado', icon: X,     classes: 'bg-red'  },
)
</script>

<template>
  <span
    class="inline-flex w-fit items-center gap-1 px-3 py-1 rounded-low text-small text-white font-semibold"
    :class="config.classes"
  >
    {{ config.label }}
    <component :is="config.icon" :size="16" :stroke-width="2.2" />
  </span>
</template>
