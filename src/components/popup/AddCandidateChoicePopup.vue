<script setup lang="ts">

import Popup  from './Popup.vue'
import Button from '@/components/ui/Button.vue'
import { Color } from '@/components/ui/lib'

defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  manual: []
  excel:  []
}>()

function close() {
  emit('update:modelValue', false)
}

function pickManual() {
  emit('manual')
  close()
}

function pickExcel() {
  emit('excel')
  close()
}

</script>

<template>
  <Popup :model-value="modelValue" title="Adicionar candidato" width="26rem" @update:model-value="emit('update:modelValue', $event)">
    <div class="flex items-start justify-center gap-8 py-2">
      <div class="flex flex-col items-center gap-2">
        <Button icon="ArrowLeft" variant="neutral" rounded class="!p-4" @click="close" />
        <span class="text-small text-black/60">Voltar</span>
      </div>

      <div class="flex flex-col items-center gap-2">
        <Button icon="UserPlus" :color="Color.Blue" rounded class="!p-4" @click="pickManual" />
        <span class="text-small text-black/60">Inserção manual</span>
      </div>

      <div class="flex flex-col items-center gap-2">
        <Button icon="FileSpreadsheet" :color="Color.Green" rounded class="!p-4" @click="pickExcel" />
        <span class="text-small text-black/60">Via Excel</span>
      </div>
    </div>
  </Popup>
</template>
