<script setup lang="ts">
import { computed, ref } from "vue";
import { RouterLink } from "vue-router";
import Input from "@/components/ui/Input.vue";
import Button from "@/components/ui/Button.vue";
import HintPopup from "@/components/ui/HintPopup.vue";

import { handleLogin } from "@/service/Access";

type Step = "email" | "password";

const step = ref<Step>("email");
const email = ref("");
const password = ref("");

const buttonText = computed(() =>
  step.value === "email" ? "Continuar" : "Entrar",
);

function submit() {
  if (step.value === "email") {
    if (!email.value) return;
    step.value = "password";
    return;
  }

  handleLogin(email.value, password.value);
}
</script>

<template>
  <div class="flex flex-col w-full gap-6">
    <div class="flex flex-col gap-2">
      <h2>Pronto para começar?</h2>
      <form
        class="w-full max-w-120 flex flex-col gap-4"
        @submit.prevent="submit"
      >
        <Transition name="field-swap" mode="out-in">
          <Input
            v-if="step === 'email'"
            key="email"
            v-model="email"
            type="email"
            placeholder="E-mail"
          />
          <Input
            v-else
            key="password"
            v-model="password"
            type="password"
            placeholder="Senha"
          />
        </Transition>
        <Button :text="buttonText" @click="submit" />
      </form>
    </div>

    <p v-if="step === 'email'" class="font-medium text-black/90">
      Não possui uma conta?
      <HintPopup
        message="Peça ao responsável de RH ou TI da sua empresa para provisionar o seu acesso."
        >Fale com sua empresa</HintPopup
      >
    </p>
    <p v-else class="font-medium text-black/90">
      Não lembra sua senha?
      <RouterLink
        :to="{ name: 'recuperar-senha' }"
        class="text-blue cursor-pointer"
        >Recuperar</RouterLink
      >
    </p>
  </div>
</template>

<style scoped>
.field-swap-enter-active,
.field-swap-leave-active {
  transition:
    opacity 180ms ease,
    transform 180ms ease;
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
