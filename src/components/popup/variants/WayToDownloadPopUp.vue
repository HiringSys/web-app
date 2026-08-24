<script setup lang="ts">
import PopupIcon from "@@/popup/PopupIcon.vue";
import Button from "@@/ui/Button.vue";

defineProps<{
  modelValue: boolean;
}>();

function close() {
  emit("update:modelValue", false);
}

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
}>();
</script>

<template>
  <PopupIcon
    :model-value="modelValue"
    width="26rem"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="flex items-start justify-center gap-8 py-2">
      <div class="flex flex-col items-center gap-2">
        <Button icon="ArrowLeft" variant="neutral" @click="close" />
      </div>

      <div class="flex flex-col items-center gap-2">
        <Button icon="FileText" color="blue" />
      </div>

      <div class="flex flex-col items-center gap-2">
        <Button icon="FileSpreadsheet" color="purple" />
      </div>

      <div class="flex flex-col items-center gap-2">
        <Button icon="Table2" color="green" />
      </div>
    </div>
  </PopupIcon>
</template>
