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
    <div class="flex flex-col gap-px max-w-slot-lg">
      <p class="truncate leading-none text-[1.05rem] font-semibold text-black pb-px">{{ name }}</p>
      <p class="truncate leading-none text-small text-black/40 pb-px">{{ email }}</p>
    </div>
  </div>
</template>
