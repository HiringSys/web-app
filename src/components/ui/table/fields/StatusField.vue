<script setup lang="ts">
import { computed } from 'vue'
import { Clock, Check, X, Award, Ban } from '@lucide/vue'
import { CandidateStatus } from '../types'
import { Color, colorClasses } from '../../lib'

const props = defineProps<{
  status: CandidateStatus
}>()

const CONFIG: Record<CandidateStatus, { label: string; icon: typeof Check; color: Color }> = {
  [CandidateStatus.EmAnalise]:  { label: 'Em análise', icon: Clock, color: Color.Yellow },
  [CandidateStatus.Aprovado]:   { label: 'Aprovado',   icon: Check, color: Color.Blue   },
  [CandidateStatus.Reprovado]:  { label: 'Reprovado',  icon: X,     color: Color.Red    },
  [CandidateStatus.Contratado]: { label: 'Contratado', icon: Award, color: Color.Green  },
  [CandidateStatus.Suprimido]:  { label: 'Suprimido',  icon: Ban,   color: Color.Purple },
}

const config = computed(() => CONFIG[props.status])
</script>

<template>
  <span class="inline-flex w-fit items-center gap-1 px-3 py-2 rounded-low text-small leading-none whitespace-nowrap text-white font-semibold cursor-default select-none press-shadow"
    :class="colorClasses[config.color].bg"
    :style="{ '--press-shadow-color': colorClasses[config.color].shadow }"
  >
    {{ config.label }}
    <component :is="config.icon" :size="16" :stroke-width="2.2" />
  </span>
</template>
