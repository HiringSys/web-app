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

const props = defineProps<{
  columns:       TableColumn<Candidate>[]
  items:         Candidate[]
  approvalLimit: number
}>()

const emit = defineEmits<{
  'update:items': [items: Candidate[]]
  'view-resume':  [item: Candidate]
  'delete-item':  [item: Candidate]
  'edit-item':    [item: Candidate]
}>()

const groups = reactive<Record<CandidateStatus, Candidate[]>>({
  [CandidateStatus.EmAnalise]:  props.items.filter((item) => item.status === CandidateStatus.EmAnalise),
  [CandidateStatus.Aprovado]:   props.items.filter((item) => item.status === CandidateStatus.Aprovado),
  [CandidateStatus.Reprovado]:  props.items.filter((item) => item.status === CandidateStatus.Reprovado),
  [CandidateStatus.Contratado]: props.items.filter((item) => item.status === CandidateStatus.Contratado),
})

const SECTIONS: { status: CandidateStatus; label: string; tint: string }[] = [
  { status: CandidateStatus.EmAnalise,  label: 'Em análise', tint: 'bg-yellow/10' },
  { status: CandidateStatus.Aprovado,   label: 'Aprovado',   tint: 'bg-blue/10'   },
  { status: CandidateStatus.Reprovado,  label: 'Reprovado',  tint: 'bg-red/10'    },
  { status: CandidateStatus.Contratado, label: 'Contratado', tint: 'bg-green/10'  },
]

function groupOf(status: CandidateStatus) {
  return {
    name: 'selection',
    put: status === CandidateStatus.Aprovado
      ? () => groups[CandidateStatus.Aprovado].length < props.approvalLimit
      : true,
  }
}

function emitAll() {
  emit('update:items', [
    ...groups[CandidateStatus.EmAnalise],
    ...groups[CandidateStatus.Aprovado],
    ...groups[CandidateStatus.Reprovado],
    ...groups[CandidateStatus.Contratado],
  ])
}

/** Persists whichever candidate now sits in `status`'s bucket but still carries a different status. Reverts the move if the API rejects the transition. */
async function handleChange(status: CandidateStatus) {
  const list = groups[status]
  const moved = list.find((item) => item.status !== status)

  if (moved) {
    const previousStatus = moved.status
    moved.status = status
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

async function moveToStatus(candidate: Candidate, status: CandidateStatus) {
  const previousStatus = candidate.status
  if (previousStatus === status) return

  const sourceList = groups[previousStatus]
  const idx = sourceList.indexOf(candidate)
  if (idx !== -1) sourceList.splice(idx, 1)
  candidate.status = status
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
          <template v-if="section.status === CandidateStatus.Aprovado"> ({{ groups[section.status].length }}/{{ approvalLimit }})</template>
          <template v-else> ({{ groups[section.status].length }})</template>
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
              @view-resume="emit('view-resume', $event)"
              @delete-item="emit('delete-item', $event)"
              @edit-item="emit('edit-item', $event)"
            />
          </template>
        </VueDraggable>
      </div>
    </div>
  </div>
</template>
