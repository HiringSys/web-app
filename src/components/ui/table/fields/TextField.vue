<script setup lang="ts">

defineProps<{
  value: string
}>()

</script>

<template>
  <span class="text-body font-medium text-black">{{ value }}</span>
</template>
