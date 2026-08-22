<script setup lang="ts" generic="T">

import { CircleQuestionMark } from '@lucide/vue'

import type { TableColumn } from './types'

withDefaults(
  defineProps<{
    columns:             TableColumn<T>[]
    gridTemplateColumns: string
    draggable?:          boolean
  }>(),
  { draggable: true },
)

</script>

<template>
  <div class="grid items-center gap-4 rounded-medium bg-white px-4 py-3" :style="{ gridTemplateColumns }">
    <span v-if="draggable" />
    <div class="flex items-center gap-1 opacity-40 cursor-default select-none"
      :class="column.align === 'start' ? 'justify-start' : 'justify-center'"
      :key="column.key"
      v-for="column in columns"
    >
      <span class="text-small font-semibold text-black">{{ column.label }}</span>
      <CircleQuestionMark :size="14" class="text-black" stroke-width="2.8" />
    </div>
  </div>
</template>
