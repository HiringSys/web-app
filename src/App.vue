<script setup lang="ts">

import { RouterLink, RouterView, useRoute } from 'vue-router'
import Notification from '@/components/feedback/Notification.vue'
import Sidebar       from '@/components/ui/Sidebar.vue'

const router  = useRoute();
const login   = ["/login", "/recuperar-senha"];
const sidebar = ["/candidatos", "/peneiras"];

</script>

<template>
  <div class="flex h-screen flex-col">
    <!-- <nav v-if="!login.includes(router.path)" class="mx-auto flex max-w-md gap-4 border-b border-gray-200 p-4 text-sm font-medium">
      <RouterLink to="/" class="hover:text-primary" active-class="text-primary">Início</RouterLink>
    </nav> -->

    <div class="flex flex-1 overflow-hidden">
      <Sidebar v-if="sidebar.some((path) => router.path === path || router.path.startsWith(path + '/'))" />
      <RouterView :key="router.fullPath" class="flex-1 overflow-y-auto" />
    </div>

    <Notification />
  </div>
</template>
