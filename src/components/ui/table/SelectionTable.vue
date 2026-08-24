<script setup lang="ts">

import { reactive, computed } from 'vue'
import VueDraggable               from 'vuedraggable'

import type { TableColumn, Candidate }   from './types'
import      { CandidateStatus }          from './types'
import      { gridTemplate, capColumns } from './style/grid'
import      { useDragGhostOpacityFix }   from '@/lib/dragGhostOpacity'
import      { useFontsReady }            from '@/lib/fontsReady'

import Row from './Row.vue'

useDragGhostOpacityFix()
const fontsReady = useFontsReady()

const props = withDefaults(
  defineProps<{
    columns:            TableColumn<Candidate>[]
    items:              Candidate[]
    approvalLimit:      number
    showManageActions?: boolean
    showDocument?:      boolean
    locked?:            boolean
  }>(),
  { showManageActions: true, showDocument: true, locked: false },
)

const emit = defineEmits<{
  'update:items': [items: Candidate[]]
  'view-resume':  [item: Candidate]
  'delete-item':  [item: Candidate]
  'edit-item':    [item: Candidate]
  'edit-department': [item: Candidate]
}>()

type BoardStatus = typeof CandidateStatus.Aprovado | typeof CandidateStatus.Reprovado

props.items.forEach((item) => {
  if (item.status === CandidateStatus.Contratado) {
    item.status = CandidateStatus.Aprovado
    item.subStatus = CandidateStatus.Contratado
  } else if (item.status === CandidateStatus.EmAnalise) {
    item.status = CandidateStatus.Reprovado
    item.subStatus = CandidateStatus.EmAnalise
  } else if (item.status !== CandidateStatus.Aprovado) {
    item.status = CandidateStatus.Reprovado
  }
})

const groups = reactive<Record<BoardStatus, Candidate[]>>({
  [CandidateStatus.Aprovado]:  props.items.filter((item) => item.status === CandidateStatus.Aprovado),
  [CandidateStatus.Reprovado]: props.items.filter((item) => item.status === CandidateStatus.Reprovado),
})

const SECTIONS: { status: BoardStatus; label: string; tint: string; emptyLabel: string }[] = [
  {
    status: CandidateStatus.Aprovado,
    label: 'Aprovados',
    tint: 'border-blue/20 bg-blue/[0.08]',
    emptyLabel: 'Nenhum candidato aprovado',
  },
  {
    status: CandidateStatus.Reprovado,
    label: 'Reprovados',
    tint: 'border-red/20 bg-red/[0.08]',
    emptyLabel: 'Nenhum candidato reprovado',
  },
]

function activeCount(status: BoardStatus) {
  return groups[status].filter((candidate) => !candidate.blocked).length
}

function groupOf(status: BoardStatus) {
  return {
    name: 'selection',
    put: status === CandidateStatus.Aprovado
      ? () => activeCount(CandidateStatus.Aprovado) < props.approvalLimit
      : true,
  }
}

function toggleBlock(candidate: Candidate) {
  candidate.blocked = !candidate.blocked
  emitAll()
}

function toggleSubStatus(candidate: Candidate) {
  const onValue = candidate.status === CandidateStatus.Aprovado ? CandidateStatus.Contratado : CandidateStatus.EmAnalise
  candidate.subStatus = candidate.subStatus === onValue ? undefined : onValue
  emitAll()
}

function emitAll() {
  emit('update:items', [
    ...groups[CandidateStatus.Aprovado],
    ...groups[CandidateStatus.Reprovado],
  ])
}

function handleChange(status: BoardStatus) {
  const list = groups[status]
  const moved = list.find((item) => item.status !== status)

  if (moved) {
    moved.status = status
    moved.subStatus = undefined
  }

  emitAll()
}

function moveToStatus(candidate: Candidate, status: BoardStatus) {
  const previousStatus = candidate.status as BoardStatus
  if (previousStatus === status) return

  const sourceList = groups[previousStatus]
  const idx = sourceList.indexOf(candidate)
  if (idx !== -1) sourceList.splice(idx, 1)
  candidate.status = status
  candidate.subStatus = undefined
  groups[status].push(candidate)

  emitAll()
}

const visibleColumns = computed(() => capColumns(props.columns))
const gridTemplateColumns = computed(() => {
  fontsReady.value
  return gridTemplate(visibleColumns.value, props.items)
})

defineExpose({ groups, moveToStatus })

</script>

<template>
  <div class="flex min-w-0 flex-col gap-4">
      <section v-for="section in SECTIONS" :key="section.status" class="min-w-0 rounded-medium border p-3 sm:p-4" :class="section.tint">
        <h2 class="mb-3 px-1 text-body font-semibold text-black/70">
          {{ section.label }}
          <template v-if="section.status === CandidateStatus.Aprovado"> ({{ activeCount(section.status) }}/{{ approvalLimit }})</template>
          <template v-else> ({{ activeCount(section.status) }})</template>
        </h2>

        <VueDraggable class="flex min-h-16 min-w-0 flex-col gap-2"
          v-model="groups[section.status]"
          tag="div"
          item-key="id"
          handle=".drag-handle"
          :group="groupOf(section.status)"
          :animation="150"
          :force-fallback="true"
          :disabled="locked"
          @change="handleChange(section.status)"
        >
          <template #item="{ element }">
            <Row
              :item="element" :columns="visibleColumns" :grid-template-columns="gridTemplateColumns"
              variant="detail"
              :show-manage-actions="showManageActions"
              :show-document="showDocument"
              :blocked="element.blocked"
              :board-status="section.status"
              :locked="locked"
              @view-resume="emit('view-resume', $event)"
              @delete-item="emit('delete-item', $event)"
              @edit-item="emit('edit-item', $event)"
              @edit-department="emit('edit-department', $event)"
              @toggle-block="toggleBlock"
              @toggle-substatus="toggleSubStatus"
              @reject-item="moveToStatus($event, CandidateStatus.Reprovado)"
            />
          </template>
        </VueDraggable>
        <p
          v-if="groups[section.status].length === 0"
          class="pointer-events-none -mt-16 flex min-h-16 items-center justify-center px-4 text-center text-small font-medium text-black/45"
        >
          {{ section.emptyLabel }}
        </p>
      </section>
  </div>
</template>
