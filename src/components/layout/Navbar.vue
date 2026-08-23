<script setup lang="ts">

import { ref }        from 'vue'
import { RouterLink } from 'vue-router'

import Button from '@@/ui/Button.vue';

const isOpen = ref(true)

</script>

<template>
  <aside v-if="isOpen" class="flex h-full py-8 w-16 pl-8 flex-col justify-between gap-6 items-center">
    <div class="flex flex-col gap-6">
      <!-- <img class="w-8" src="/logo.svg" alt="Logo"> -->
      
      <Button class="px-4" icon="PanelLeftClose" variant="primary" @click="isOpen = false" />
      
      <RouterLink to="/candidatos" class="text-black/40 hover:text-black/80 transition-colors duration-300" active-class="text-black">
        <Button class="px-4" icon="Home" variant="primary" />
      </RouterLink>
      
      <RouterLink to="/candidatos" class="text-black/40 hover:text-black/80 transition-colors duration-300" active-class="text-black">
        <Button class="px-4" icon="Settings" variant="primary" />
      </RouterLink>
    </div>

    <Button class="px-4" icon="LogOut" color="red" />
  </aside>

  <Button v-else class="px-4 fixed left-6 top-8 z-40 opacity-40 hover:opacity-100" icon="PanelLeftOpen" variant="neutral" @click="isOpen = true" />
</template>
