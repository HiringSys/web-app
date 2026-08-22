<script setup lang="ts" generic="T extends { id: string | number }">

import { Grip } from '@lucide/vue'

import type { TableColumn } from './types'

withDefaults(
  defineProps<{
    item:                 T
    columns:              TableColumn<T>[]
    gridTemplateColumns:  string
    draggable?:           boolean
  }>(),
  { draggable: true },
)

</script>

<template>
  <div class="grid max-h-[4.5rem] items-center gap-4 overflow-hidden rounded-medium bg-white px-4 py-3 select-none" :style="{ gridTemplateColumns }" draggable="false">
    <span v-if="draggable" class="drag-handle inline-flex cursor-grab items-center justify-center p-1 [-webkit-user-drag:none]" draggable="false">
      <Grip :size="16" class="pointer-events-none text-black/30" draggable="false" />
    </span>

    <div
      v-for="column in columns"
      :key="column.key"
      class="flex min-w-0 items-center justify-start"
      :class="column.fixed ? '' : 'overflow-x-auto scrollbar-hide whitespace-nowrap'"
    >
      <component :is="column.component" v-bind="column.props(item)" />
    </div>

    <slot name="actions" :item="item" />
  </div>
</template>
