<script setup lang="ts">

import { ref, computed, watch } from 'vue'
import { Grip }                 from '@lucide/vue'
import VueDraggable              from 'vuedraggable'

import Button                     from './Button.vue'
import { useDragGhostOpacityFix } from '@/lib/dragGhostOpacity'

const props = withDefaults(
  defineProps<{
    options:    { key: string; label: string }[]
    /** Enables select-to-front ordering + drag reordering of selected chips. */
    orderable?: boolean
    /** Keys that are always active, always shown first, and can't be toggled or dragged. Only used when `orderable`. */
    pinned?:    string[]
    /** Maximum number of active chips. Only enforced when `orderable`. */
    max?:       number
  }>(),
  {
    orderable: false,
    pinned:    () => [],
  },
)

const active = defineModel<string[]>({ default: () => [] })

defineEmits<{
  'open-filters': []
}>()

useDragGhostOpacityFix()

const selectionOrder = ref<string[]>(active.value.filter((key) => !props.pinned.includes(key)))

watch(selectionOrder, () => {
  if (!props.orderable) return
  active.value = [...props.pinned, ...selectionOrder.value]
}, { deep: true })

const labelOf = computed(() => new Map(props.options.map((option) => [option.key, option.label])))

const unselectedOptions = computed(() => {
  const selected = new Set(active.value)
  return props.options.filter((option) => !selected.has(option.key))
})

function toggle(key: string) {
  if (!props.orderable) {
    active.value = active.value.includes(key)
      ? active.value.filter((activeKey) => activeKey !== key)
      : [...active.value, key]
    return
  }

  if (props.pinned.includes(key)) return

  if (selectionOrder.value.includes(key)) {
    selectionOrder.value = selectionOrder.value.filter((activeKey) => activeKey !== key)
    return
  }

  if (props.max !== undefined && props.pinned.length + selectionOrder.value.length >= props.max) return
  selectionOrder.value = [...selectionOrder.value, key]
}

function keyOf(key: string) {
  return key
}

</script>

<template>
  <VueDraggable
    v-if="orderable"
    v-model="selectionOrder"
    tag="div"
    class="flex flex-nowrap h-max shrink-0 overflow-x-auto overflow-y-visible items-center gap-3 scrollbar-hide"
    :item-key="keyOf"
    handle=".drag-handle"
    direction="horizontal"
    :animation="150"
    :force-fallback="true"
  >
    <template #header>
      <button
        v-for="key in pinned"
        :key="key"
        type="button"
        class="cursor-default select-none rounded-full bg-blue px-4 py-2 text-center font-semibold text-white shrink-0 whitespace-nowrap"
      >
        {{ labelOf.get(key) }}
      </button>
    </template>

    <template #item="{ element: key }">
      <button
        type="button"
        class="inline-flex select-none items-center gap-2 rounded-full bg-blue px-4 py-2 text-center font-semibold text-white cursor-pointer transition-all duration-150 press-shadow shrink-0 whitespace-nowrap"
        style="--press-shadow-color: var(--color-blue-co)"
        @click="toggle(key)"
      >
        <span
          class="drag-handle inline-flex cursor-grab items-center justify-center [-webkit-user-drag:none]"
          draggable="false"
          @click.stop
        >
          <Grip :size="14" class="pointer-events-none text-white/70" />
        </span>
        {{ labelOf.get(key) }}
      </button>
    </template>

    <template #footer>
      <button
        v-for="option in unselectedOptions"
        :key="option.key"
        type="button"
        class="rounded-full bg-white px-4 py-2 text-center font-semibold text-black/60 cursor-pointer transition-all duration-150 press-shadow shrink-0 whitespace-nowrap"
        style="--press-shadow-color: var(--color-gray-co)"
        @click="toggle(option.key)"
      >
        {{ option.label }}
      </button>

      <Button icon="Filter" variant="neutral" rounded @click="$emit('open-filters')" />
    </template>
  </VueDraggable>

  <div v-else class="flex flex-wrap items-center gap-3">
    <button
      v-for="option in options"
      :key="option.key"
      type="button"
      class="rounded-full px-4 py-2 text-center font-semibold cursor-pointer transition-all duration-150 press-shadow shrink-0 whitespace-nowrap"
      :class="active.includes(option.key) ? 'bg-blue text-white' : 'bg-white text-black/60'"
      :style="{ '--press-shadow-color': active.includes(option.key) ? 'var(--color-blue-co)' : 'var(--color-gray-co)' }"
      @click="toggle(option.key)"
    >
      {{ option.label }}
    </button>

    <Button icon="Filter" variant="neutral" rounded />
  </div>
</template>
