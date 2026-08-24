<script setup lang="ts">

import { reactive, computed } from 'vue'
import VueDraggable               from 'vuedraggable'

import type { TableColumn, Candidate }   from './types'
import      { CandidateStatus }          from './types'
import      { gridTemplate, capColumns } from './style/grid'
import      { useDragGhostOpacityFix }   from '@/lib/dragGhostOpacity'
import      { useFontsReady }            from '@/lib/fontsReady'
import      { updateCandidateStatus }    from '@/service/Peneiras'
import      { notify }                   from '@/components/feedback/notify'

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
  }>(),
  { showManageActions: true, showDocument: true },
)

const emit = defineEmits<{
  'update:items': [items: Candidate[]]
  'view-resume':  [item: Candidate]
  'delete-item':  [item: Candidate]
  'edit-item':    [item: Candidate]
}>()

// Only Aprovado/Reprovado are real board sections — Contratado/EmAnalise live
// as the client-only `subStatus` toggle, and Suprimido as `blocked` (see types.ts).
type BoardStatus = typeof CandidateStatus.Aprovado | typeof CandidateStatus.Reprovado

// Coerce anything that isn't Aprovado into Reprovado — the board only recognizes
// these two sections, so a stray EmAnalise/Contratado (e.g. from the global
// Funcionario-status fallback in getCandidatesForProcess) would otherwise vanish.
props.items.forEach((item) => {
  if (item.status !== CandidateStatus.Aprovado) item.status = CandidateStatus.Reprovado
})

const groups = reactive<Record<BoardStatus, Candidate[]>>({
  [CandidateStatus.Aprovado]:  props.items.filter((item) => item.status === CandidateStatus.Aprovado),
  [CandidateStatus.Reprovado]: props.items.filter((item) => item.status === CandidateStatus.Reprovado),
})

const SECTIONS: { status: BoardStatus; label: string; tint: string }[] = [
  { status: CandidateStatus.Aprovado,  label: 'Aprovado',  tint: 'bg-blue/10' },
  { status: CandidateStatus.Reprovado, label: 'Reprovado', tint: 'bg-red/10'  },
]

/** Blocked candidates keep their section but stop counting towards that section's headcount/capacity. */
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

/** Toggles the Suprimido display/headcount override in place — never moves or persists, no backend field exists for it. */
function toggleBlock(candidate: Candidate) {
  candidate.blocked = !candidate.blocked
  emitAll()
}

/** Client-only cosmetic toggle (see Candidate.subStatus) — never persisted, no backend field exists for it. */
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

/** Persists whichever candidate now sits in `status`'s bucket but still carries a different status. Reverts the move if the API rejects the transition. */
async function handleChange(status: BoardStatus) {
  const list = groups[status]
  const moved = list.find((item) => item.status !== status)

  if (moved) {
    const previousStatus = moved.status as BoardStatus
    moved.status = status
    moved.subStatus = undefined
    try {
      await updateCandidateStatus(moved.id, status)
    } catch {
      moved.status = previousStatus
      const idx = list.indexOf(moved)
      if (idx !== -1) list.splice(idx, 1)
      groups[previousStatus].push(moved)
      notify('Não foi possível mover o candidato.', 'error')
    }
  }

  emitAll()
}

async function moveToStatus(candidate: Candidate, status: BoardStatus) {
  const previousStatus = candidate.status as BoardStatus
  if (previousStatus === status) return

  const sourceList = groups[previousStatus]
  const idx = sourceList.indexOf(candidate)
  if (idx !== -1) sourceList.splice(idx, 1)
  candidate.status = status
  candidate.subStatus = undefined
  groups[status].push(candidate)

  try {
    await updateCandidateStatus(candidate.id, status)
  } catch {
    const newIdx = groups[status].indexOf(candidate)
    if (newIdx !== -1) groups[status].splice(newIdx, 1)
    candidate.status = previousStatus
    groups[previousStatus].push(candidate)
    notify('Não foi possível mover o candidato.', 'error')
  }

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
  <div class="overflow-x-auto scrollbar-hide">
    <div class="flex min-w-fit flex-col gap-3">
      <div v-for="section in SECTIONS" :key="section.status" class="rounded-medium p-3" :class="section.tint">
        <h3 class="mb-2 px-1 text-black/50">
          {{ section.label }}
          <template v-if="section.status === CandidateStatus.Aprovado"> ({{ activeCount(section.status) }}/{{ approvalLimit }})</template>
          <template v-else> ({{ activeCount(section.status) }})</template>
        </h3>

        <VueDraggable class="flex min-h-16 flex-col gap-2"
          v-model="groups[section.status]"
          tag="div"
          item-key="id"
          handle=".drag-handle"
          :group="groupOf(section.status)"
          :animation="150"
          :force-fallback="true"
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
              @view-resume="emit('view-resume', $event)"
              @delete-item="emit('delete-item', $event)"
              @edit-item="emit('edit-item', $event)"
              @toggle-block="toggleBlock"
              @toggle-substatus="toggleSubStatus"
              @reject-item="moveToStatus($event, CandidateStatus.Reprovado)"
            />
          </template>
        </VueDraggable>
      </div>
    </div>
  </div>
</template>
