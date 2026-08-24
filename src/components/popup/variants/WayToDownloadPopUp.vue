<script setup lang="ts">
import PopupIcon from "@@/popup/PopupIcon.vue";
import Button from "@@/ui/Button.vue";

defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  txt: [];
  csv: [];
  xlsx: [];
}>();

function close() {
  emit("update:modelValue", false);
}
</script>

<template>
  <PopupIcon
    :model-value="modelValue"
    width="26rem"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="flex items-start justify-center gap-3 py-2 sm:gap-8">
      <div class="flex flex-col items-center gap-2">
        <Button class="px-4" icon="ArrowLeft" variant="neutral" @click="close" />
      </div>

      <div class="flex flex-col items-center gap-2">
        <Button
          class="px-4"
          icon="FileText"
          color="blue"
          title="Baixar como TXT"
          @click="emit('txt')"
        />
      </div>

      <div class="flex flex-col items-center gap-2">
        <Button
          class="px-4"
          icon="FileSpreadsheet"
          color="purple"
          title="Baixar como CSV"
          @click="emit('csv')"
        />
      </div>

      <div class="flex flex-col items-center gap-2">
        <Button
          class="px-4"
          icon="Table2"
          color="green"
          title="Baixar como XLSX"
          @click="emit('xlsx')"
        />
      </div>
    </div>
  </PopupIcon>
</template>
