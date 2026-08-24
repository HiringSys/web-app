<script setup lang="ts">

import { ref }                   from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useNavbar }             from './useNavbar';

import Button               from '@@/ui/Button.vue';
import AccountSettingsPopup from '@@/popup/variants/AccountSettingsPopup.vue';
import { handleLogout }     from '@/service/Access'

const router = useRouter()
const { isNavOpen } = useNavbar();

const showAccountSettings = ref(false)

function logout() {
  handleLogout()
  router.push({ name: 'login' })
}

</script>

<template>
  <aside v-if="isNavOpen" class="fixed inset-x-0 bottom-0 z-40 flex h-20 w-full shrink-0 items-center justify-center bg-gray/95 px-3 py-3 shadow-[0_-6px_20px_rgb(25_25_25/0.08)] backdrop-blur sm:static sm:h-full sm:w-24 sm:flex-col sm:bg-transparent sm:px-6 sm:py-8 sm:shadow-none">
    <div class="flex h-auto w-full items-center justify-between gap-2 sm:h-full sm:w-auto sm:flex-col sm:gap-6">
      <div class="flex flex-row gap-2 sm:flex-col sm:gap-6">
        <Button class="px-3 sm:px-4" icon="PanelLeftClose" variant="primary" aria-label="Recolher navegação" @click="isNavOpen = false" />

        <RouterLink :to="{ name: 'peneiras' }" class="text-black/40 hover:text-black/80 transition-colors duration-300" active-class="text-black">
          <Button class="px-3 sm:px-4" icon="LayoutDashboard" variant="primary" aria-label="Processos seletivos" />
        </RouterLink>

        <RouterLink :to="{ name: 'funcionarios' }" class="text-black/40 hover:text-black/80 transition-colors duration-300" active-class="text-black">
          <Button class="px-3 sm:px-4" icon="Users" variant="primary" aria-label="Funcionários" />
        </RouterLink>

        <Button class="px-3 sm:px-4" icon="Settings" variant="primary" aria-label="Configurações da conta" @click="showAccountSettings = true" />
      </div>

      <Button class="px-3 sm:px-4" icon="LogOut" color="red" aria-label="Sair" @click="logout" />
    </div>
  </aside>

  <Button v-if="!isNavOpen" class="fixed bottom-4 left-4 z-40 px-3 opacity-80 hover:opacity-100 sm:bottom-auto sm:left-6 sm:top-8 sm:px-4" icon="PanelLeftOpen" variant="neutral" aria-label="Abrir navegação" @click="isNavOpen = true" />

  <AccountSettingsPopup v-model="showAccountSettings" />
</template>
