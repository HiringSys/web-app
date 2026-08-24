<script setup lang="ts">

import { ref }                   from 'vue'
import { RouterLink, useRouter } from 'vue-router'

import Button               from '@@/ui/Button.vue';
import AccountSettingsPopup from '@@/popup/variants/AccountSettingsPopup.vue';

import { handleLogout } from '@/service/Access'

const router = useRouter()

const isOpen = ref(true)
const showAccountSettings = ref(false)

function logout() {
  handleLogout()
  router.push({ name: 'login' })
}

</script>

<template>
  <aside v-if="isOpen" class="flex h-full py-8 w-16 pl-8 flex-col justify-between gap-6 items-center">
    <div class="flex flex-col gap-6 justify-between h-full">
      <div class="flex flex-col gap-6">
        <Button class="px-4" icon="PanelLeftClose" variant="primary" @click="isOpen = false" />

        <RouterLink :to="{ name: 'peneiras' }" class="text-black/40 hover:text-black/80 transition-colors duration-300" active-class="text-black">
          <Button class="px-4" icon="Home" variant="primary" />
        </RouterLink>

        <Button class="px-4" icon="Settings" variant="primary" @click="showAccountSettings = true" />
      </div>

      <Button class="px-4" icon="LogOut" color="red" @click="logout" />
    </div>
  </aside>

  <Button v-if="!isOpen" class="px-4 fixed left-6 top-8 z-40 opacity-40 hover:opacity-100" icon="PanelLeftOpen" variant="neutral" @click="isOpen = true" />

  <AccountSettingsPopup v-model="showAccountSettings" />
</template>
