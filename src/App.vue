<script setup lang="ts">

import { RouterLink, RouterView } from 'vue-router'

</script>

<template>
  <nav class="mx-auto flex max-w-md gap-4 border-b border-gray-200 p-4 text-sm font-medium">
    <RouterLink to="/" class="hover:text-primary" active-class="text-primary">Início</RouterLink>
    
    <RouterLink to="/login" class="hover:text-primary" active-class="text-primary">Tela</RouterLink>
    <RouterLink to="/tests" class="hover:text-primary" active-class="text-primary">Testes</RouterLink>
  </nav>

  <RouterView />
</template>
