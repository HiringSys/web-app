<script setup lang="ts" generic="T extends { id: string | number }">

import VueDraggable            from 'vuedraggable'
import { computed }            from 'vue'

import type { TableColumn }            from './types'
import      { gridTemplate, capColumns } from './style/grid'
import      { useDragGhostOpacityFix } from '@/lib/dragGhostOpacity'
import      { useFontsReady }          from '@/lib/fontsReady'

import TableHeader from './TableHeader.vue'
import Row          from './Row.vue'

useDragGhostOpacityFix()
const fontsReady = useFontsReady()

const props = withDefaults(
  defineProps<{
    columns:        TableColumn<T>[]
    items:          T[]
    draggable?:     boolean
    /** Per-row lock predicate — locked rows keep delete but disable edit. */
    disabledItems?: (item: T) => boolean
  }>(),
  { draggable: true, disabledItems: () => false },
)

const emit = defineEmits<{
  'update:items': [items: T[]]
  'delete-item':  [item: T]
  'edit-item':    [item: T]
}>()

const visibleColumns = computed(() => capColumns(props.columns))
const gridTemplateColumns = computed(() => {
  fontsReady.value
  return gridTemplate(visibleColumns.value, props.items, props.draggable)
})

const rows = computed({
  get: () => props.items,
  set: (value: T[]) => emit('update:items', value),
})

</script>

<template>
  <div class="overflow-x-auto scrollbar-hide">
    <div class="flex min-w-fit flex-col gap-3">
      <TableHeader :columns="visibleColumns" :grid-template-columns="gridTemplateColumns" :draggable="props.draggable" />

      <VueDraggable
        v-if="props.draggable"
        v-model="rows"
        tag="div"
        item-key="id"
        handle=".drag-handle"
        :animation="150"
        :force-fallback="true"
        class="flex flex-col gap-2"
      >
        <template #item="{ element }">
          <Row
            :item="element" :columns="visibleColumns" :grid-template-columns="gridTemplateColumns"
            :locked="disabledItems(element)"
            @delete-item="emit('delete-item', $event)"
            @edit-item="emit('edit-item', $event)"
          >
            <template v-if="$slots.actions" #actions="slotProps">
              <slot name="actions" v-bind="slotProps" />
            </template>
          </Row>
        </template>
      </VueDraggable>

      <div v-else class="flex flex-col gap-2">
        <Row
          v-for="item in items"
          :key="item.id"
          :item="item"
          :columns="visibleColumns"
          :grid-template-columns="gridTemplateColumns"
          :draggable="false"
          :locked="disabledItems(item)"
          @delete-item="emit('delete-item', $event)"
          @edit-item="emit('edit-item', $event)"
        >
          <template v-if="$slots.actions" #actions="slotProps">
            <slot name="actions" v-bind="slotProps" />
          </template>
        </Row>
      </div>
    </div>
  </div>
</template>
