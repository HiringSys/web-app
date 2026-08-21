<script setup lang="ts">
defineProps<{
  seniority: string
}>()
</script>

<template>
  <span class="text-body font-medium text-black">{{ seniority }}</span>
</template>
