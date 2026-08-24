<script setup lang="ts">

withDefaults(
  defineProps<{
    width?:   string
    height?:  string
    rounded?: string
  }>(),
  { width: '100%', height: '1rem', rounded: 'rounded-low' },
)

</script>

<template>
  <div class="animate-pulse bg-gray-co" :class="rounded" :style="{ width, height }" />
</template>
