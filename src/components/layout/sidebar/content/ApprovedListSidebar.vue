<script setup lang="ts">

import VueDraggable from 'vuedraggable'
import { Grip }     from '@lucide/vue'

import Button from '@/components/ui/Button.vue'
import type { Candidate } from '@/components/ui/table/types'

const props = defineProps<{
  items:         Candidate[]
  approvalLimit: number
}>()

const emit = defineEmits<{
  reorder: [items: Candidate[]]
  remove:  [item: Candidate]
}>()

</script>

<template>
  <div class="flex flex-col gap-4">
    <div>
      <h1 class="leading-none">Aprovados</h1>
      <h3 class="text-black/40">{{ props.items.length }}/{{ props.approvalLimit }} aprovados para a Vaga</h3>
    </div>

    <VueDraggable
      class="flex flex-col gap-2"
      :model-value="props.items"
      tag="div"
      item-key="id"
      handle=".drag-handle"
      :animation="150"
      :force-fallback="true"
      @update:model-value="emit('reorder', $event)"
    >
      <template #item="{ element }">
        <div class="flex items-center gap-2 rounded-medium bg-white p-2 pr-3">
          <span class="drag-handle inline-flex cursor-grab items-center justify-center p-1 [-webkit-user-drag:none]" draggable="false">
            <Grip :size="16" class="pointer-events-none text-black/30" draggable="false" />
          </span>

          <div class="h-9 w-9 aspect-square shrink-0 overflow-hidden rounded-full bg-gray-300">
            <img v-if="element.avatarUrl" :src="element.avatarUrl" :alt="element.name" class="h-full w-full object-cover" />
          </div>

          <div class="flex min-w-0 flex-1 flex-col gap-px">
            <p class="truncate leading-none text-small font-semibold text-black">{{ element.name }}</p>
            <p class="truncate leading-none text-small text-black/40">{{ element.email }}</p>
          </div>

          <Button icon="X" variant="neutral" small @click="emit('remove', element)" />
        </div>
      </template>
    </VueDraggable>
  </div>
</template>
