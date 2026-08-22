<script setup lang="ts">
</script>

<template>
  <div class="flex w-full">
    <section class="flex flex-col w-[60%] px-20 items-baseline justify-center gap-6">
        <img class="w-40" src="/logotype.svg" alt="Logo">
        <RouterView />
    </section>
    <section class="w-full flex-1 bg-blue"></section>
  </div>
</template>