<script setup lang="ts">

import { ref, computed } from 'vue'

import Table       from '@/components/ui/table/Table.vue'
import Button      from '@/components/ui/Button.vue'
import FilterChips from '@/components/ui/FilterChips.vue'

import JobTitleField      from '@/components/ui/table/fields/JobTitleField.vue'
import ProcessStatusField from '@/components/ui/table/fields/ProcessStatusField.vue'
import CountField         from '@/components/ui/table/fields/CountField.vue'
import TextField          from '@/components/ui/table/fields/TextField.vue'

import type { TableColumn }      from '@/components/ui/table/types'
import { ProcessStatus, type SelectiveProcess } from '@/types/peneira'
import { listProcesses }         from '@/service/Peneiras'

const processes = listProcesses()

const columns: TableColumn<SelectiveProcess>[] = [
  {
    key: 'jobTitle',
    label: 'Finalidade da vaga',
    size: 'lg',
    align: 'start',
    component: JobTitleField,
    props: (item) => ({
      title: item.jobTitle,
      subtitle: item.department,
      to: { name: 'peneira-filtragem', params: { id: item.id } },
    }),
  },
  {
    key: 'status',
    label: 'Estado',
    size: 'sm',
    component: ProcessStatusField,
    props: (item) => ({ status: item.status }),
  },
  {
    key: 'availableSlots',
    label: 'Disponíveis',
    size: 'sm',
    component: CountField,
    props: (item) => ({ count: item.availableSlots }),
  },
  {
    key: 'participants',
    label: 'Participantes',
    size: 'sm',
    component: CountField,
    props: (item) => ({ count: item.participants }),
  },
  {
    key: 'role',
    label: 'Cargo',
    size: 'md',
    component: TextField,
    props: (item) => ({ value: item.role }),
  },
]

const STATUS_OPTIONS = [
  { key: ProcessStatus.Encerrado,  label: 'Encerrados' },
  { key: ProcessStatus.EmProcesso, label: 'Em processo' },
  { key: ProcessStatus.Pausado,    label: 'Pausados' },
  { key: ProcessStatus.EmColeta,   label: 'Em coleta' },
  { key: ProcessStatus.Rascunho,   label: 'Rascunhos' },
]

const activeStatuses = ref<string[]>(STATUS_OPTIONS.map((option) => option.key))

const filteredProcesses = computed(() =>
  processes.filter((process) => activeStatuses.value.includes(process.status)),
)

</script>

<template>
  <main class="flex flex-col gap-6 p-8">
    <div class="flex items-center gap-3">
      <h1>Processos seletivos</h1>
      <Button icon="LayoutGrid" variant="primary" />
    </div>

    <FilterChips :options="STATUS_OPTIONS" v-model="activeStatuses" />

    <Table :columns="columns" :items="filteredProcesses" :draggable="false">
      <template #actions>
        <div class="flex items-center gap-3 pl-2">
          <Button icon="Trash2" variant="neutral" />
          <Button icon="EllipsisVertical" variant="neutral" />
        </div>
      </template>
    </Table>
  </main>
</template>
