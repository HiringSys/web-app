<script setup lang="ts">
import { computed } from 'vue'
import { Check, X } from '@lucide/vue'
import type { CandidateStatus } from '../types'

const props = defineProps<{
  status: CandidateStatus
}>()

const config = computed(() =>
  props.status === 'aprovado'
    ? { label: 'Aprovado', icon: Check, classes: 'bg-primary text-primary-foreground' }
    : { label: 'Reprovado', icon: X, classes: 'bg-danger text-danger-foreground' },
)
</script>

<template>
  <span
    class="inline-flex w-fit items-center gap-1 rounded-medium px-3 py-1 text-xs font-semibold"
    :class="config.classes"
  >
    {{ config.label }}
    <component :is="config.icon" :size="14" />
  </span>
</template>
