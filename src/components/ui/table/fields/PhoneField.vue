<script setup lang="ts">
defineProps<{
  phone: string
}>()
</script>

<template>
  <span class="text-sm text-black">{{ phone }}</span>
</template>
