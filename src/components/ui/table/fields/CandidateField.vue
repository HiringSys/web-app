<script setup lang="ts">

defineProps<{
  name:       string
  email:      string
  avatarUrl?: string
}>()

</script>

<template>
  <div class="flex items-center gap-2">
    <div class="h-10 w-10 aspect-square shrink-0 overflow-hidden rounded-full bg-gray-300">
      <img v-if="avatarUrl" :src="avatarUrl" :alt="name" class="h-full w-full object-cover" />
    </div>
    <div class="max-w-slot-lg">
      <p class="truncate leading-4 text-[1.05rem] font-semibold text-black">{{ name }}</p>
      <p class="truncate leading-4 text-small text-black/40">{{ email }}</p>
    </div>
  </div>
</template>
