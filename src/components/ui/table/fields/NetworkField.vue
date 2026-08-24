<script setup lang="ts">

import SocialIcon from "./SocialIcon.vue";
import { GlobeOff } from "@lucide/vue";
import type { SocialLink } from "../types";

const props = withDefaults(
  defineProps<{
    networks?: SocialLink[];
  }>(),
  { networks: () => [] },
);

</script>

<template>
  <div class="flex items-center gap-2">
    <GlobeOff v-if="!props.networks.length" :size="16" class="pointer-events-none opacity-40" />
    <SocialIcon v-for="link in networks" :key="link.network" :network="link.network" :url="link.url" />
  </div>
</template>
