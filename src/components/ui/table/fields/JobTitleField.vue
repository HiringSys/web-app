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
      class="block truncate leading-none text-[1.05rem] font-semibold text-black hover:text-blue transition-colors duration-150 pb-px"
    >
      {{ title }}
    </RouterLink>
    <p v-else class="truncate leading-none text-[1.05rem] font-semibold text-black pb-px">{{ title }}</p>
    <p class="truncate leading-none text-small text-black/40 pb-px">{{ subtitle }}</p>
  </div>
</template>
