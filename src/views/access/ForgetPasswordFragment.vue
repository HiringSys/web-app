<script setup lang="ts">

import { computed, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import Input  from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'

import { handleChangePassword } from '@/service/Access'
import { notify }               from '@/components/feedback/notify'

type Step = 'email' | 'password'

const router = useRouter()

const step            = ref<Step>('email')
const email            = ref('')
const newPassword     = ref('')
const confirmPassword = ref('')

const buttonText = computed(() => step.value === 'email' ? 'Continuar' : 'Salvar')

function submit() {
  if (step.value === 'email') {
    if (!email.value) return
    step.value = 'password'
    return
  }

  if (!newPassword.value || newPassword.value !== confirmPassword.value) {
    notify('As senhas não coincidem.', 'error')
    return
  }

  handleChangePassword(email.value, newPassword.value)
  notify('Senha alterada com sucesso.', 'success')
  router.push({ name: 'login' })
}

</script>

<template>
  <div class="flex flex-col w-full gap-6">
    <div class="flex flex-col gap-2">
      <h2>Recuperar senha</h2>
      <form class="w-full max-w-120 flex flex-col gap-4" @submit.prevent="submit">
        <Transition name="field-swap" mode="out-in">
          <Input v-if="step === 'email'" key="email" v-model="email" type="email" placeholder="E-mail" />
          <div v-else key="password" class="flex flex-col gap-4">
            <Input v-model="newPassword" type="password" placeholder="Nova senha" />
            <Input v-model="confirmPassword" type="password" placeholder="Confirmar senha" />
          </div>
        </Transition>
        <Button :text="buttonText" @click="submit" />
      </form>
    </div>

    <p class="font-medium text-black/90">
      Lembrou sua senha? <RouterLink :to="{ name: 'login' }" class="text-blue cursor-pointer">Fazer login</RouterLink>
    </p>
  </div>
</template>

<style scoped>
.field-swap-enter-active,
.field-swap-leave-active {
  transition: opacity 180ms ease, transform 180ms ease;
}

.field-swap-enter-from {
  opacity: 0;
  transform: translateY(0.5rem);
}

.field-swap-leave-to {
  opacity: 0;
  transform: translateY(-0.5rem);
}
</style>
