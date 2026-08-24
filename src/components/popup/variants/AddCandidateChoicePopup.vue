<script setup lang="ts">
import PopupIcon from "@@/popup/PopupIcon.vue";
import Button from "@@/ui/Button.vue";
import { Color } from "@@/ui/lib";

defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  manual: [];
  excel: [];
}>();

function close() {
  emit("update:modelValue", false);
}

function pickManual() {
  emit("manual");
  close();
}

function pickExcel() {
  emit("excel");
  close();
}
</script>

<template>
  <PopupIcon
    :model-value="modelValue"
    width="20rem"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="flex items-start justify-center gap-8 py-2">
      <div class="flex flex-col items-center gap-2">
        <Button icon="ArrowLeft" variant="neutral" @click="close" />
      </div>

      <div class="flex flex-col items-center gap-2">
        <Button icon="UserPlus" :color="Color.Blue" @click="pickManual" />
      </div>

      <div class="flex flex-col items-center gap-2">
        <Button
          icon="FileSpreadsheet"
          :color="Color.Green"
          @click="pickExcel"
        />
      </div>
    </div>
  </PopupIcon>
</template>
