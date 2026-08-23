<script setup lang="ts">
import { ref }                   from "vue";
import { RouterLink, useRouter } from "vue-router";
import Input  from "@/components/ui/Input.vue";
import Button from "@/components/ui/Button.vue";

import { handleRecoverPassword } from "@/service/Access";
import { notify } from "@/components/feedback/notify";

const router = useRouter();

const email = ref("");
const loading = ref(false);

async function submit() {
  if (!email.value || loading.value) return;

  loading.value = true;
  const success = await handleRecoverPassword(email.value);
  loading.value = false;

  if (!success) {
    notify("Não foi possível enviar a nova senha. Verifique o e-mail informado.", "error");
    return;
  }

  notify("Uma nova senha foi enviada para o seu e-mail.", "success");
  router.push({ name: "login" });
}
</script>

<template>
  <div class="flex flex-col w-full gap-6">
    <div class="flex flex-col gap-2">
      <h2>Recuperar senha</h2>
      <p class="font-medium text-black/60">
        Informe o e-mail da sua conta. Enviaremos uma nova senha para ele.
      </p>
      <form
        class="w-full max-w-120 flex flex-col gap-4"
        @submit.prevent="submit"
      >
        <Input
          v-model="email"
          type="email"
          placeholder="E-mail"
        />
        <Button text="Enviar" :disabled="loading" @click="submit" />
      </form>
    </div>

    <p class="font-medium text-black/90">
      Lembrou sua senha?
      <RouterLink :to="{ name: 'login' }" class="text-blue cursor-pointer"
        >Fazer login</RouterLink
      >
    </p>
  </div>
</template>
