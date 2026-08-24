<script setup lang="ts" generic="T">

import { computed } from 'vue'

import type { TableColumn }            from './types'
import      { gridTemplate, capColumns } from './style/grid'
import Skeleton from '@/components/ui/Skeleton.vue'

const props = withDefaults(
  defineProps<{
    columns:    TableColumn<T>[]
    rows?:      number
    draggable?: boolean
  }>(),
  { rows: 5, draggable: true },
)

const visibleColumns = computed(() => capColumns(props.columns))
const gridTemplateColumns = computed(() => gridTemplate(visibleColumns.value, [], props.draggable))

</script>

<template>
  <div class="overflow-x-auto scrollbar-hide">
    <div class="flex min-w-fit flex-col gap-3">
      <div class="grid items-center gap-4 rounded-medium bg-white px-4 py-3" :style="{ gridTemplateColumns }">
        <span v-if="draggable" />
        <div v-for="column in visibleColumns" :key="column.key" class="flex min-w-0 items-center">
          <Skeleton width="50%" height="0.875rem" />
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <div v-for="n in rows" :key="n" class="flex items-center rounded-medium bg-white px-4 py-3">
          <div class="grid w-full items-center gap-4" :style="{ gridTemplateColumns }">
            <span v-if="draggable" />
            <div v-for="column in visibleColumns" :key="column.key" class="flex min-w-0 items-center">
              <Skeleton width="75%" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
