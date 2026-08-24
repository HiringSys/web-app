<script setup lang="ts">

import { computed } from 'vue'
import { ProcessStatus, PROCESS_STATUS_OPTIONS, PROCESS_STATUS_COLORS } from '@/types/peneira'

const props = defineProps<{
  status: ProcessStatus
}>()

const config = computed(() => {
  const color = PROCESS_STATUS_COLORS[props.status]
  const label = PROCESS_STATUS_OPTIONS.find((option) => option.value === props.status)?.label ?? props.status
  return { label, bg: color.bg, text: color.text, shadowColor: color.shadow }
})

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
