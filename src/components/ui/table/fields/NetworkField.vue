<script setup lang="ts">

import SocialIcon from "./SocialIcon.vue";
import type { SocialLink } from "../types";

withDefaults(
  defineProps<{
    networks?: SocialLink[];
  }>(),
  { networks: () => [] },
);

</script>

<template>
  <div class="flex items-center gap-2">
    <SocialIcon v-for="link in networks" :key="link.network" :network="link.network" :url="link.url" />
  </div>
</template>
