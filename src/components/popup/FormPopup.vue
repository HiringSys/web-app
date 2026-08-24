<script setup lang="ts">
import { reactive, ref, watch } from "vue";
import Popup from "./Popup.vue";
import Input from "@@/ui/Input.vue";
import Button from "@@/ui/Button.vue";

export interface FormField {
  key: string;
  label: string;
  type?: "text" | "number" | "email" | "tel" | "select";
  placeholder?: string;
  options?: { value: string; label: string }[];
  required?: boolean;
  min?: string | number;
  max?: string | number;
  step?: string | number;
}

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    title: string;
    fields: FormField[];
    initialValues: Record<string, string>;
    submitText?: string;
    closeOnSubmit?: boolean;
  }>(),
  {
    submitText: "Salvar",
    closeOnSubmit: true,
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  submit: [values: Record<string, string>];
}>();

const values = reactive<Record<string, string>>({});
const form = ref<HTMLFormElement>();

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return;
    Object.keys(values).forEach((key) => delete values[key]);
    Object.assign(values, props.initialValues);

    for (const field of props.fields) {
      const firstOption = field.options?.[0];
      if (
        field.type === "select" &&
        values[field.key] === undefined &&
        firstOption
      ) {
        values[field.key] = firstOption.value;
      }
    }
  },
  { immediate: true },
);

function submit() {
  if (!form.value?.reportValidity()) return;
  emit("submit", { ...values });
  if (props.closeOnSubmit) emit("update:modelValue", false);
}
</script>

<template>
  <Popup
    :model-value="modelValue"
    :title="title"
    width="28rem"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <form
      ref="form"
      class="flex flex-col gap-4 scrollbar-hide"
      @submit.prevent="submit"
    >
      <label
        v-for="field in fields"
        :key="field.key"
        class="flex flex-col gap-1.5"
      >
        <span class="text-small font-semibold text-black/60">{{
          field.label
        }}</span>

        <select
          v-if="field.type === 'select'"
          v-model="values[field.key]"
          :required="field.required"
          class="w-full rounded-medium bg-white px-4 py-2.5 font-medium text-black focus:outline-0 focus-visible:ring-2 focus-visible:ring-blue/70"
        >
          <option
            v-for="option in field.options"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>

        <Input
          v-else
          :type="field.type ?? 'text'"
          :placeholder="field.placeholder ?? field.label"
          :required="field.required"
          :min="field.min"
          :max="field.max"
          :step="field.step"
          v-model="values[field.key]"
        />
      </label>
      <button type="submit" class="hidden" aria-hidden="true" />
    </form>

    <template #actions>
      <Button
        text="Cancelar"
        variant="neutral"
        @click="emit('update:modelValue', false)"
      />
      <Button :text="submitText" variant="primary" @click="submit" />
    </template>
  </Popup>
</template>
