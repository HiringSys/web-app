<script setup lang="ts">

import { ref, computed } from 'vue'
import VueDraggable       from 'vuedraggable'

import type { TableColumn, Candidate } from './types'
import      { gridTemplate, capColumns } from './style/grid'
import      { useDragGhostOpacityFix } from '@/lib/dragGhostOpacity'
import      { useFontsReady }          from '@/lib/fontsReady'

import TableHeader from './TableHeader.vue'
import Row          from './Row.vue'

useDragGhostOpacityFix()
const fontsReady = useFontsReady()

const props = defineProps<{
  columns:       TableColumn<Candidate>[]
  items:         Candidate[]
  approvalLimit: number
}>()

const emit = defineEmits<{
  'update:items': [items: Candidate[]]
}>()

const approved = ref<Candidate[]>(props.items.filter((item) => item.status === 'aprovado'))
const rejected = ref<Candidate[]>(props.items.filter((item) => item.status === 'reprovado'))

function syncStatuses() {
  approved.value.forEach((item) => { item.status = 'aprovado' })
  rejected.value.forEach((item) => { item.status = 'reprovado' })
  emit('update:items', [...approved.value, ...rejected.value])
}

const visibleColumns = computed(() => capColumns(props.columns))
const gridTemplateColumns = computed(() => {
  fontsReady.value
  return gridTemplate(visibleColumns.value, props.items)
})

const approvedGroup = { name: 'selection', put: () => approved.value.length < props.approvalLimit }
const rejectedGroup = { name: 'selection', put: true }

</script>

<template>
  <div class="overflow-x-auto scrollbar-hide">
    <div class="flex min-w-fit flex-col gap-3">
      <TableHeader :columns="visibleColumns" :grid-template-columns="gridTemplateColumns" />

      <div class="rounded-medium bg-blue/10 p-3">
        <VueDraggable
          v-model="approved"
          tag="div"
          item-key="id"
          handle=".drag-handle"
          :group="approvedGroup"
          :animation="150"
          :force-fallback="true"
          class="flex min-h-16 flex-col gap-2"
          @change="syncStatuses"
        >
          <template #item="{ element }">
            <Row :item="element" :columns="visibleColumns" :grid-template-columns="gridTemplateColumns" />
          </template>
        </VueDraggable>
      </div>

      <VueDraggable
        v-model="rejected"
        tag="div"
        item-key="id"
        handle=".drag-handle"
        :group="rejectedGroup"
        :animation="150"
        :force-fallback="true"
        class="flex min-h-16 flex-col gap-2"
        @change="syncStatuses"
      >
        <template #item="{ element }">
          <Row :item="element" :columns="visibleColumns" :grid-template-columns="gridTemplateColumns" />
        </template>
      </VueDraggable>
    </div>
  </div>
</template>
