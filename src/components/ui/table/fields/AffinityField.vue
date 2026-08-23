<script setup lang="ts">

import { computed } from 'vue'

const props = defineProps<{
  affinity: number
}>()

const config = computed(() => {
  if (props.affinity >= 70) return { bg: 'bg-green',  shadowColor: 'var(--color-green-co)'  }
  if (props.affinity >= 40) return { bg: 'bg-yellow', shadowColor: 'var(--color-yellow-co)' }
  return                           { bg: 'bg-red',    shadowColor: 'var(--color-red-co)'    }
})

</script>

<template>
  <span
    class="inline-flex w-fit items-center px-3 py-1 rounded-low text-small text-white font-semibold cursor-default select-none press-shadow"
    :class="config.bg"
    :style="{ '--press-shadow-color': config.shadowColor }"
  >
    {{ affinity }}%
  </span>
</template>
