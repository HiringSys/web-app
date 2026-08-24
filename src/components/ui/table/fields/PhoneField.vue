<script setup lang="ts">

import { formatPhoneNumber } from '@/lib/format'
import copyToClipboard       from '@/utils/copyToClipboard'

const props = defineProps<{
  value: string
}>()

</script>

<template>
  <span
    class="cursor-pointer text-body font-semibold text-black/40 transition-colors duration-200 hover:text-black/80"
    @click="copyToClipboard(formatPhoneNumber(props.value))"
  >{{ formatPhoneNumber(props.value) }}</span>
</template>
