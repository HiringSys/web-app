<script setup lang="ts">
defineProps<{
  name: string
  email: string
  avatarUrl?: string
}>()
</script>

<template>
  <div class="flex min-w-0 items-center gap-3">
    <div class="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-gray-300">
      <img v-if="avatarUrl" :src="avatarUrl" :alt="name" class="h-full w-full object-cover" />
    </div>
    <div class="min-w-0 gap-[-2rem]">
      <p class="truncate text-sm font-semibold text-black">{{ name }}</p>
      <p class="truncate text-xs text-gray-500">{{ email }}</p>
    </div>
  </div>
</template>
