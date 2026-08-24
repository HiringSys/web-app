<script setup lang="ts">
import { RouterView, useRoute } from "vue-router";
import GlobalLoading from "@@/feedback/GlobalLoading.vue";
import Notification from "@@/feedback/Notification.vue";
import Navbar from "@@/layout/navbar/Navbar.vue";

const router = useRoute();
const sidebar = ["/peneiras", "/funcionarios"];
</script>

<template>
  <div class="flex h-dvh min-h-0 min-w-0 flex-col">
    <div class="flex min-h-0 min-w-0 flex-1 overflow-hidden">
      <Navbar
        v-if="
          sidebar.some(
            (path) =>
              router.path === path || router.path.startsWith(path + '/'),
          )
        "
      />
      <RouterView :key="router.fullPath" class="min-w-0 flex-1 overflow-y-auto" />
    </div>

    <Notification />
    <GlobalLoading />
  </div>
</template>
