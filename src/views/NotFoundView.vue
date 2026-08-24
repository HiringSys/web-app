<script setup lang="ts">

import { useRouter } from 'vue-router'
import Button from '@@/ui/Button.vue';

const router = useRouter();

function returnToHomePage() {
  router.push("/");
}

</script>

<template>
  <main class="mx-auto flex min-h-full w-full max-w-md flex-col items-center justify-center gap-6 p-4 text-center sm:p-8">
    <div class="flex flex-col gap-2">
      <h1 class="leading-none pb-px">Página não encontrada</h1>
      <h3 class="leading-none pb-px">Ops! O endereço informado não existe ou foi removido.</h3>
    </div>
    <Button text="Voltar ao início" icon="ArrowLeft" color="orange" small class="px-8" @click="returnToHomePage()" />
  </main>
</template>
