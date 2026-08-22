<script setup lang="ts">

import { computed } from 'vue'
import { formatSalary } from '@/lib/format'

const props = defineProps<{
  amount: number
}>()

const formatted = computed(() => formatSalary(props.amount))

</script>

<template>
  <span class="text-body font-medium text-black">{{ formatted }}</span>
</template>
