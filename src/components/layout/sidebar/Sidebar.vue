<script setup lang="ts">

import Button from '@/components/ui/Button.vue'

withDefaults(
  defineProps<{
    modelValue: boolean
    title?:     string
    width?:     string
  }>(),
  {
    width: '40%',
  },
)

defineEmits<{
  'update:modelValue': [value: boolean]
}>()

</script>

<template>
  <aside
    class="h-full shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out"
    :style="{ width: modelValue ? width : '0px' }"
  >
    <div class="flex h-full w-full flex-col">
      <div class="flex items-center justify-between p-4">
        <h3 v-if="title" class="leading-none">{{ title }}</h3>
        <Button icon="X" variant="neutral" small class="ml-auto" @click="$emit('update:modelValue', false)" />
      </div>

      <div class="flex-1 overflow-y-auto p-4">
        <slot />
      </div>
    </div>
  </aside>
</template>
