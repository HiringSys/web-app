<script setup lang="ts">
import SocialIcon from "./SocialIcon.vue";
import type { SocialNetwork } from "../types";

withDefaults(
  defineProps<{
    networks?: SocialNetwork[];
  }>(),
  { networks: () => [] },
);
</script>

<template>
  <div class="flex items-center gap-2">
    <SocialIcon v-for="network in networks" :key="network" :network="network" />
  </div>
</template>
