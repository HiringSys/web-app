<script setup lang="ts">

import { computed, ref } from 'vue'
import Popup   from './Popup.vue'
import Button  from '@/components/ui/Button.vue'

import { getAccountEmail } from '@/service/api'
import { handleRecoverPassword } from '@/service/Access'
import { notify } from '@/components/feedback/notify'

defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const email = computed(() => getAccountEmail())
const sending = ref(false)

async function recoverPassword() {
  const target = email.value
  if (!target || sending.value) return

  sending.value = true
  const success = await handleRecoverPassword(target)
  sending.value = false

  if (!success) {
    notify('Não foi possível enviar a nova senha. Tente novamente.', 'error')
    return
  }

  notify('Uma nova senha foi enviada para o seu e-mail.', 'success')
  emit('update:modelValue', false)
}

</script>

<template>
  <Popup :model-value="modelValue" title="Configurações da conta" width="24rem" @update:model-value="emit('update:modelValue', $event)">
    <div class="flex flex-col gap-6">
      <div class="flex flex-col gap-1.5">
        <span class="text-small font-semibold text-black/60">E-mail</span>
        <p class="font-medium text-black">{{ email ?? '—' }}</p>
      </div>

      <div class="flex flex-col gap-1.5">
        <span class="text-small font-semibold text-black/60">Senha</span>
        <p class="text-black/60">Vamos gerar uma nova senha e enviar para o seu e-mail cadastrado.</p>
        <Button class="mt-1 self-start" text="Alterar senha" variant="neutral" :disabled="sending" @click="recoverPassword" />
      </div>
    </div>
  </Popup>
</template>
