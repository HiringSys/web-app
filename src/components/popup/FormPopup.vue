<script setup lang="ts">

import { reactive, watch } from 'vue'
import Popup                from './Popup.vue'
import Input                 from '@/components/ui/Input.vue'
import Button                from '@/components/ui/Button.vue'

export interface FormField {
  key:          string
  label:        string
  type?:        'text' | 'number' | 'email' | 'tel' | 'select'
  placeholder?: string
  /** Required when type is 'select'. */
  options?:     { value: string; label: string }[]
}

const props = withDefaults(
  defineProps<{
    modelValue:    boolean
    title:         string
    fields:        FormField[]
    initialValues: Record<string, string>
    submitText?:   string
  }>(),
  {
    submitText: 'Salvar',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [values: Record<string, string>]
}>()

const values = reactive<Record<string, string>>({})

watch(() => props.modelValue, (open) => {
  if (!open) return
  Object.keys(values).forEach((key) => delete values[key])
  Object.assign(values, props.initialValues)
}, { immediate: true })

function submit() {
  emit('submit', { ...values })
  emit('update:modelValue', false)
}

</script>

<template>
  <Popup :model-value="modelValue" :title="title" width="28rem" @update:model-value="emit('update:modelValue', $event)">
    <div class="flex flex-col gap-4" @keydown.enter.prevent="submit">
      <label v-for="field in fields" :key="field.key" class="flex flex-col gap-1.5">
        <span class="text-small font-semibold text-black/60">{{ field.label }}</span>

        <select
          v-if="field.type === 'select'"
          v-model="values[field.key]"
          class="w-full rounded-medium bg-white px-4 py-2.5 font-medium text-black focus:outline-0"
        >
          <option v-for="option in field.options" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>

        <Input v-else :type="field.type ?? 'text'" :placeholder="field.placeholder ?? field.label" v-model="values[field.key]" />
      </label>
    </div>

    <template #actions>
      <Button text="Cancelar" variant="neutral" @click="emit('update:modelValue', false)" />
      <Button :text="submitText" variant="primary" @click="submit" />
    </template>
  </Popup>
</template>
