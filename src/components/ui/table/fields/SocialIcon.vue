<script setup lang="ts">
import { computed } from 'vue'
import { socialIconPaths, type SocialNetwork } from '../socials'

const props = withDefaults(
  defineProps<{
    network: SocialNetwork
    size?: number
  }>(),
  { size: 16 },
)

const path = computed(() => socialIconPaths[props.network])
</script>

<template>
  <svg :width="size" :height="size" viewBox="0 0 16 16" fill="currentColor" class="text-black">
    <path :d="path" />
  </svg>
</template>
