<script setup lang="ts">

import { computed } from 'vue'

const props = defineProps<{
  amount: number
}>()

const formatted = computed(() =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(props.amount),
)

</script>

<template>
  <span class="text-body font-medium text-black">{{ formatted }}</span>
</template>
