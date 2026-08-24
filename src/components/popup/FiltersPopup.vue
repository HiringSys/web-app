<script setup lang="ts">

import Popup  from './Popup.vue'
import Button from '@@/ui/Button.vue'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    options:    { key: string; label: string }[]
    pinned?:    string[]
    title?:     string
  }>(),
  {
    title:  'Filtros',
    pinned: () => [],
  },
)

const active = defineModel<string[]>('active', { default: () => [] })

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

function isPinned(key: string) {
  return props.pinned.includes(key)
}

function toggle(key: string) {
  if (isPinned(key)) return

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
    <div class="flex w-full items-center justify-center">
      <ul class="flex w-full flex-col gap-3 sm:w-[95%] sm:gap-4">
        <li v-for="option in options" :key="option.key">
          <Button
            :text="option.label"
            :icon="isPinned(option.key) ? 'Lock' : undefined"
            :color="isPinned(option.key) ? 'purple' : 'blue'"
            :variant="isPinned(option.key) || active.includes(option.key) ? 'primary' : 'neutral'"
            :toggled="isPinned(option.key) || active.includes(option.key)"
            :disabled="!isPinned(option.key) && active.length === 1 && active.includes(option.key)"
            :class="isPinned(option.key) ? 'w-full justify-start cursor-default select-none' : 'w-full justify-start'"
            @click="toggle(option.key)"
          />
        </li>
      </ul>
    </div>
  </Popup>
</template>
