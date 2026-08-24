<script setup lang="ts">
import Popup from "./Popup.vue";
import Button from "@@/ui/Button.vue";
import { Color } from "@@/ui/lib";

withDefaults(
  defineProps<{
    modelValue: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    danger?: boolean;
  }>(),
  {
    confirmText: "Confirmar",
    cancelText: "Cancelar",
    danger: false,
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  confirm: [];
  cancel: [];
}>();

function confirm() {
  emit("confirm");
  emit("update:modelValue", false);
}

function cancel() {
  emit("cancel");
  emit("update:modelValue", false);
}
</script>

<template>
  <Popup
    :model-value="modelValue"
    :title="title"
    width="24rem"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <p class="text-black/70">{{ message }}</p>

    <template #actions>
      <Button :text="cancelText" variant="neutral" @click="cancel" />
      <Button
        :text="confirmText"
        :color="danger ? Color.Red : Color.Blue"
        @click="confirm"
      />
    </template>
  </Popup>
</template>
