<script setup lang="ts" generic="T extends { id: string | number }">

import { Grip } from '@lucide/vue'
import Button   from '@/components/ui/Button.vue'

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

defineEmits<{
  'view-resume': [item: T]
  'delete-item': [item: T]
  'edit-item':   [item: T]
}>()

</script>

<template>
  <div class="relative flex flex-row justify-between rounded-medium bg-white px-4 py-3 select-none overflow-hidden">
    <div class="grid max-h-18 items-center gap-4" :style="{ gridTemplateColumns }" draggable="false">
      <span v-if="draggable" class="drag-handle inline-flex cursor-grab items-center justify-center p-1 [-webkit-user-drag:none]" draggable="false">
        <Grip :size="16" class="pointer-events-none text-black/30" draggable="false" />
      </span>

      <div
        v-for="column in columns"
        :key="column.key"
        class="flex self-center-safe min-w-0 items-center justify-start"
        :class="column.fixed ? '' : 'overflow-x-auto scrollbar-hide whitespace-nowrap'"
      >
        <component :is="column.component" v-bind="column.props(item)" />
      </div>

      <slot name="actions" :item="item" />
    </div>

    <div class="absolute px-4 h-full right-0 top-1/2 -translate-y-1/2 flex flex-row items-center-safe gap-2 bg-white">
      <div class="flex flex-row gap-2">
        <Button icon="Trash2"      variant="primary" color="red"    :small="true" @click="$emit('delete-item', item)" />
        <Button icon="Pencil"      variant="primary"                :small="true" @click="$emit('edit-item', item)" />
      </div>

      <div class="flex flex-row gap-2">
        <Button icon="CircleSlash"      variant="primary" color="orange" :small="true" />
        <Button icon="File"             variant="primary"                :small="true" @click="$emit('view-resume', item)" />
        <Button icon="EllipsisVertical" variant="primary"                :small="true" />
      </div>
    </div>
  </div>
</template>
