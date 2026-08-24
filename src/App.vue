<script setup lang="ts">
import { RouterView, useRoute } from "vue-router";
import Notification from "@@/feedback/Notification.vue";
import Navbar from "@@/layout/Navbar.vue";

const router = useRoute();
const sidebar = ["/peneiras"];
</script>

<template>
  <div class="flex h-screen flex-col">
    <div class="flex flex-1 overflow-hidden">
      <Navbar
        v-if="
          sidebar.some(
            (path) =>
              router.path === path || router.path.startsWith(path + '/'),
          )
        "
      />
      <RouterView :key="router.fullPath" class="flex-1 overflow-y-auto" />
    </div>

    <Notification />
  </div>
</template>
