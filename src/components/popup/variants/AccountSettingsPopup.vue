<script setup lang="ts">
import { computed, ref } from "vue";

import Popup from "@@/popup/Popup.vue";
import Button from "@@/ui/Button.vue";

import { getAccountEmail } from "@/service/api";
import { handleRecoverPassword } from "@/service/Access";
import { notify } from "@@/feedback/notify";

defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
}>();

const email = computed(() => getAccountEmail());
const sending = ref(false);

async function recoverPassword() {
  const target = email.value;
  if (!target || sending.value) return;

  sending.value = true;
  const success = await handleRecoverPassword(target);
  sending.value = false;

  if (!success) {
    notify("Não foi possível enviar a nova senha. Tente novamente.", "error");
    return;
  }

  notify("Uma nova senha foi enviada para o seu e-mail.", "success");
  emit("update:modelValue", false);
}
</script>

<template>
  <Popup
    :model-value="modelValue"
    title="Configurações da conta"
    width="32rem"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="flex flex-col gap-6 pb-6">
      <div class="flex flex-col gap-1.5">
        <h4 class="font-semibold leading-none pb-px text-black/60">E-mail</h4>
        <div
          class="w-full truncate rounded-medium bg-white px-4 py-2.5 font-medium text-black!"
        >
          {{ email }}
        </div>
      </div>

      <div class="flex flex-col gap-1.5">
        <h4 class="font-semibold leading-none pb-px text-black/60">Senha</h4>
        <p class="text-black/60">
          Não é possível ver sua senha pois não sabemos se você é um hacker...
        </p>
        <Button
          class="mt-1 self-start"
          text="Alterar senha"
          variant="neutral"
          :disabled="sending"
          :class="sending ? 'opacity-40' : ''"
          @click="recoverPassword"
        />
      </div>
    </div>
  </Popup>
</template>
