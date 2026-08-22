<script setup lang="ts">

defineProps<{
  count: number
}>()

</script>

<template>
  <span class="text-body font-medium text-black">{{ count }}</span>
</template>
