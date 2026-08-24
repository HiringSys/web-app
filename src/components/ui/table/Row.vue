<script setup lang="ts" generic="T extends { id: string | number }">

import { Grip } from '@lucide/vue'
import Button   from '@/components/ui/Button.vue'

import type { TableColumn } from './types'
import { CandidateStatus }  from './types'

withDefaults(
  defineProps<{
    item:                 T
    columns:              TableColumn<T>[]
    gridTemplateColumns:  string
    draggable?:           boolean
    /** 'detail' (candidates inside a peneira) exposes block/document; 'list' never does. */
    variant?:             'list' | 'detail'
    /** Groups trash + edit + block. */
    showManageActions?:   boolean
    showDocument?:        boolean
    /** Invalidates this row's presence — mutes the row and switches the block button to its active state. */
    blocked?:             boolean
    /** Board section this row sits in ('detail' only) — picks which quick-action button to show. */
    boardStatus?:         typeof CandidateStatus.Aprovado | typeof CandidateStatus.Reprovado
  }>(),
  { draggable: true, variant: 'list', showManageActions: true, showDocument: true, blocked: false },
)

defineEmits<{
  'view-resume':      [item: T]
  'delete-item':      [item: T]
  'edit-item':        [item: T]
  'toggle-block':     [item: T]
  /** Fired by clicking the status badge, or the '?' quick-action button — toggles Contratado/EmAnalise. */
  'toggle-substatus': [item: T]
  /** Aprovado-section quick action — sends the candidate back to Reprovado. */
  'reject-item':      [item: T]
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
        :class="[
          column.fixed ? '' : 'overflow-x-auto scrollbar-hide whitespace-nowrap',
          variant === 'detail' && column.key === 'status' && !blocked ? 'cursor-pointer' : '',
        ]"
        @click="variant === 'detail' && column.key === 'status' && !blocked ? $emit('toggle-substatus', item) : undefined"
      >
        <component :is="column.component" v-bind="column.props(item)" />
      </div>

      <slot name="actions" :item="item" />
    </div>

    <div class="absolute px-4 h-full right-0 top-1/2 -translate-y-1/2 flex flex-row items-center-safe gap-2 bg-white">
      <div v-if="showManageActions" class="flex flex-row gap-2">
        <Button icon="Trash2" variant="primary" color="red" :small="true" @click="$emit('delete-item', item)" />
        <Button icon="Pencil" variant="primary"             :small="true" @click="$emit('edit-item', item)" />
        <Button
          v-if="variant === 'detail'"
          icon="CircleSlash" variant="primary"
          color="orange"
          :small="true"
          :toggled="blocked"
          @click="$emit('toggle-block', item)"
        />
        <Button
          v-if="variant === 'detail' && boardStatus === CandidateStatus.Aprovado"
          icon="X" variant="primary"
          color="red"
          :small="true"
          @click="$emit('reject-item', item)"
        />
        <Button
          v-if="variant === 'detail' && boardStatus === CandidateStatus.Reprovado"
          icon="CircleHelp" variant="primary"
          color="yellow"
          :small="true"
          @click="$emit('toggle-substatus', item)"
        />
      </div>

      <div class="flex flex-row gap-2">
        <Button v-if="variant === 'detail' && showDocument" icon="File" variant="primary" :small="true" @click="$emit('view-resume', item)" />
        <!-- "Mais informações" ainda não tem conteúdo definido; mantido comentado até decidirmos o que exibir aqui. -->
        <!-- <Button icon="EllipsisVertical" variant="primary" :small="true" /> -->
      </div>
    </div>
  </div>
</template>
