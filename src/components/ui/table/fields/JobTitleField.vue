<script setup lang="ts">

import { RouterLink } from 'vue-router'
import type { RouteLocationRaw } from 'vue-router'

defineProps<{
  title:    string
  subtitle: string
  to?:      RouteLocationRaw
}>()

</script>

<template>
  <div class="max-w-slot-lg">
    <RouterLink
      v-if="to"
      :to="to"
      class="block truncate leading-4 text-[1.05rem] font-semibold text-black hover:text-blue transition-colors duration-150"
    >
      {{ title }}
    </RouterLink>
    <p v-else class="truncate leading-4 text-[1.05rem] font-semibold text-black">{{ title }}</p>
    <p class="truncate leading-4 text-small text-black/40">{{ subtitle }}</p>
  </div>
</template>
