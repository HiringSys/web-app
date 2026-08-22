<script setup lang="ts">

import { computed } from 'vue'
import { ProcessStatus } from '@/types/peneira'

const props = defineProps<{
  status: ProcessStatus
}>()

const CONFIG: Record<ProcessStatus, { label: string; bg: string; text: string; shadowColor: string }> = {
  [ProcessStatus.Encerrado]:  { label: 'Encerrado',   bg: 'bg-red',    text: 'text-white',    shadowColor: 'var(--color-red-co)'    },
  [ProcessStatus.EmProcesso]: { label: 'Em processo', bg: 'bg-blue',   text: 'text-white',    shadowColor: 'var(--color-blue-co)'   },
  [ProcessStatus.Pausado]:    { label: 'Pausado',     bg: 'bg-yellow', text: 'text-white',    shadowColor: 'var(--color-yellow-co)' },
  [ProcessStatus.EmColeta]:   { label: 'Em coleta',   bg: 'bg-green',  text: 'text-white',    shadowColor: 'var(--color-green-co)'  },
  [ProcessStatus.Rascunho]:   { label: 'Rascunho',    bg: 'bg-gray',   text: 'text-black/60', shadowColor: 'var(--color-gray-co)'   },
}

const config = computed(() => CONFIG[props.status])

</script>

<template>
  <span
    class="inline-flex w-fit items-center px-3 py-1 rounded-low text-small font-semibold cursor-default select-none press-shadow"
    :class="[config.bg, config.text]"
    :style="{ '--press-shadow-color': config.shadowColor }"
  >
    {{ config.label }}
  </span>
</template>
