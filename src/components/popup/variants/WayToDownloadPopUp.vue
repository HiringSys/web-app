<script setup lang="ts">

import Popup from "@@/popup/Popup.vue";
import Button from "@@/ui/Button.vue";

defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
}>();

</script>

<template>
  <Popup
    :model-value="modelValue"
    title="Baixar dados"
    width="32rem"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="flex flex-col gap-3 pb-6">

      <Button
        text="Download TXT"
        icon="FileText"
        variant="neutral"
        class="w-full justify-start"
      />

      <Button
        text="Download CSV"
        icon="FileSpreadsheet"
        variant="neutral"
        class="w-full justify-start"
      />

      <Button
        text="Download XLSX"
        icon="Sheet"
        variant="neutral"
        class="w-full justify-start"
      />

    </div>
  </Popup>
</template>