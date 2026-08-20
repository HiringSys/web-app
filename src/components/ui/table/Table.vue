<script setup lang="ts">
import { computed } from 'vue'
import { CircleQuestionMark } from '@lucide/vue'
import Row from './Row.vue'
import { gridTemplate } from './grid'
import type { Candidate, TableColumn } from './types'

const props = defineProps<{
  columns: TableColumn[]
  items: Candidate[]
}>()

const headerStyle = computed(() => ({ gridTemplateColumns: gridTemplate(props.columns) }))
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="grid items-center gap-4 rounded-medium bg-white px-4 py-3 shadow-sm" :style="headerStyle">
      <span />
      <div
        v-for="column in columns"
        :key="column.key"
        class="flex items-center gap-1.5"
        :class="column.align === 'start' ? 'justify-start' : 'justify-center'"
      >
        <span class="text-sm font-medium text-gray-500">{{ column.label }}</span>
        <CircleQuestionMark :size="14" class="text-gray-300" />
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <Row v-for="candidate in items" :key="candidate.id" :candidate="candidate" :columns="columns" />
    </div>
  </div>
</template>
