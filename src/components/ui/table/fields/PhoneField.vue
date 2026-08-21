<script setup lang="ts">
const props = defineProps<{
  phone: string
}>()

async function copyPhone() {
  await navigator.clipboard.writeText(props.phone)
}
</script>

<template>
  <span class="cursor-pointer text-body text-black" @click="copyPhone">{{ phone }}</span>
</template>
