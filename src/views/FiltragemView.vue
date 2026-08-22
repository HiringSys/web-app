<script setup lang="ts">

import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

import SelectionTable from '@/components/ui/table/SelectionTable.vue'
import FilterChips     from '@/components/ui/FilterChips.vue'
import Button          from '@/components/ui/Button.vue'

import { candidateColumns } from '@/components/ui/table/columns/candidateColumns'
import type { Candidate }   from '@/components/ui/table/types'
import { getProcess, getCandidatesForProcess } from '@/service/Peneiras'

const route = useRoute()
const processId = route.params.id as string

const process = getProcess(processId)
const candidates = ref<Candidate[]>(getCandidatesForProcess(processId))

const allColumns = candidateColumns()
const COLUMN_OPTIONS = allColumns.map((column) => ({ key: column.key, label: column.label }))

const activeColumnsRaw = ref<string[]>(['name', 'status', 'phone', 'network'])
const activeColumns = computed({
  get: () => activeColumnsRaw.value,
  set: (value: string[]) => {
    activeColumnsRaw.value = value.includes('name') ? value : ['name', ...value]
  },
})

const visibleColumns = computed(() =>
  allColumns.filter((column) => activeColumns.value.includes(column.key)),
)

</script>

<template>
  <main v-if="process" class="flex flex-col gap-6 p-8">
    <div class="flex items-center gap-3">
      <h1>{{ process.jobTitle }}</h1>
      <Button icon="EllipsisVertical" variant="neutral" />
      <div class="ml-auto flex items-center gap-3">
        <Button icon="UserPlus" variant="primary" />
        <Button icon="Download" variant="primary" />
        <Button icon="Share2"   variant="primary" />
      </div>
    </div>
    <h3>{{ process.department }}</h3>

    <FilterChips :options="COLUMN_OPTIONS" v-model="activeColumns" />

    <SelectionTable
      :columns="visibleColumns"
      :items="candidates"
      :approval-limit="process.approvalLimit"
      @update:items="candidates = $event"
    />
  </main>
</template>
