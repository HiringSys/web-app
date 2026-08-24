<script setup lang="ts">

import Popup from './Popup.vue'

withDefaults(
  defineProps<{
    modelValue: boolean
    options:    { key: string; label: string }[]
    title?:     string
  }>(),
  {
    title: 'Filtros',
  },
)

const active = defineModel<string[]>('active', { default: () => [] })

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

function toggle(key: string) {
  if (active.value.includes(key)) {
    if (active.value.length === 1) return
    active.value = active.value.filter((activeKey) => activeKey !== key)
  } else {
    active.value = [...active.value, key]
  }
}

</script>

<template>
  <Popup :model-value="modelValue" :title="title" width="22rem" @update:model-value="emit('update:modelValue', $event)">
    <ul class="flex flex-col gap-1">
      <li v-for="option in options" :key="option.key">
        <label class="flex cursor-pointer items-center gap-3 rounded-medium px-2 py-2 hover:bg-gray/60">
          <input
            type="checkbox"
            class="h-4 w-4 accent-blue disabled:cursor-not-allowed disabled:opacity-50"
            :checked="active.includes(option.key)"
            :disabled="active.length === 1 && active.includes(option.key)"
            @change="toggle(option.key)"
          />
          <span class="font-medium text-black">{{ option.label }}</span>
        </label>
      </li>
    </ul>
  </Popup>
</template>
