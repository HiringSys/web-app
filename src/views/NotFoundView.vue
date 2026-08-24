<script setup lang="ts">

import { useRouter } from 'vue-router'
import Button from '@@/ui/Button.vue';

const router = useRouter();

function returnToHomePage() {
  router.push("/");
}

</script>

<template>
  <main class="w-full h-full items-center-safe justify-center mx-auto flex max-w-md flex-col gap-6 text-center">
    <div class="flex flex-col gap-2">
      <h1 class="leading-none pb-px">Página não encontrada</h1>
      <h3 class="leading-none pb-px">Oppss.... Algo de errado não está certo...</h3>
    </div>
    <Button icon="TrafficCone" color="orange" small class="px-24" @click="returnToHomePage()" />
  </main>
</template>
