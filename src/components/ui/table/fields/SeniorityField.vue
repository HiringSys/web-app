<script setup lang="ts">
defineProps<{
  seniority: string
}>()
</script>

<template>
  <span class="text-sm font-medium text-black">{{ seniority }}</span>
</template>
