<script setup lang="ts">

import copyToClipboard from '@/utils/copyToClipboard'

withDefaults(
  defineProps<{
    value:      string | number
    copyable?:  boolean
  }>(),
  { copyable: false },
)

</script>

<template>
  <span v-if="copyable" class="cursor-pointer text-body text-black" @click="copyToClipboard(value)">{{ value }}</span>
  <span v-else class="text-body font-medium text-black">{{ value }}</span>
</template>
