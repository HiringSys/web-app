<script setup lang="ts">

defineProps<{
  years: number
}>()

</script>

<template>
  <span class="text-body font-medium text-black">{{ years }} {{ years === 1 ? 'ano' : 'anos' }}</span>
</template>
