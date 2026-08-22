<script setup lang="ts">

import { ref }                        from 'vue'
import { RouterLink }                 from 'vue-router'
import { PanelLeftClose, PanelLeftOpen, Home, ListChecks } from '@lucide/vue'

const isOpen = ref(true)

</script>

<template>
  <aside v-if="isOpen" class="flex h-full w-16 flex-col items-center gap-6 bg-white py-6">
    <img class="w-8" src="/logo.svg" alt="Logo">

    <button type="button" class="cursor-pointer text-black/40 hover:text-black/80 transition-colors duration-300" @click="isOpen = false">
      <PanelLeftClose :size="20" />
    </button>

    <RouterLink to="/candidatos" class="text-black/40 hover:text-black/80 transition-colors duration-300" active-class="text-black">
      <Home :size="20" />
    </RouterLink>

    <RouterLink to="/peneiras" class="text-black/40 hover:text-black/80 transition-colors duration-300" active-class="text-black">
      <ListChecks :size="20" />
    </RouterLink>
  </aside>

  <button v-else type="button"
    class="fixed left-4 top-4 z-40 flex h-9 w-9 cursor-pointer items-center justify-center rounded-medium bg-white text-black/40 opacity-50 transition-opacity duration-300 hover:opacity-100"
    @click="isOpen = true"
  >
    <PanelLeftOpen :size="20" />
  </button>
</template>
