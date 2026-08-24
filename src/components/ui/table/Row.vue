<script setup lang="ts" generic="T extends { id: string | number }">
import { computed } from "vue";
import { Grip } from "@lucide/vue";
import Button from "@@/ui/Button.vue";
import type { IconName } from "@@/ui/Icon.vue";
import type { Color } from "@@/ui/lib";

import type { TableColumn } from "./types";
import { CandidateStatus } from "./types";

const props = withDefaults(
  defineProps<{
    item: T;
    columns: TableColumn<T>[];
    gridTemplateColumns: string;
    draggable?: boolean;
    variant?: "list" | "detail";
    showManageActions?: boolean;
    showDocument?: boolean;
    blocked?: boolean;
    boardStatus?:
      | typeof CandidateStatus.Aprovado
      | typeof CandidateStatus.Reprovado;
    locked?: boolean;
  }>(),
  {
    draggable: true,
    variant: "list",
    showManageActions: true,
    showDocument: true,
    blocked: false,
    locked: false,
  },
);

const emit = defineEmits<{
  "view-resume": [item: T];
  "delete-item": [item: T];
  "edit-item": [item: T];
  "toggle-block": [item: T];
  "toggle-substatus": [item: T];
  "reject-item": [item: T];
}>();

type ActionButton = {
  key: string;
  icon: IconName;
  color?: Color;
  toggled?: boolean;
  disabled?: boolean;
  onClick: () => void;
};

const actions = computed<ActionButton[]>(() => {
  const list: ActionButton[] = [];

  if (props.showManageActions) {
    list.push({
      key: "delete",
      icon: "Trash2",
      color: "red",
      disabled: props.variant === "detail" && props.locked,
      onClick: () => emit("delete-item", props.item),
    });
    list.push({
      key: "edit",
      icon: "Pencil",
      disabled: props.locked,
      onClick: () => emit("edit-item", props.item),
    });

    if (props.variant === "detail") {
      list.push({
        key: "block",
        icon: "CircleSlash",
        color: "orange",
        toggled: props.blocked,
        disabled: props.locked,
        onClick: () => emit("toggle-block", props.item),
      });

      if (props.boardStatus === CandidateStatus.Aprovado) {
        list.push({
          key: "reject",
          icon: "X",
          color: "red",
          disabled: props.locked,
          onClick: () => emit("reject-item", props.item),
        });
      }
      if (props.boardStatus === CandidateStatus.Reprovado) {
        list.push({
          key: "toggle-substatus",
          icon: "CircleHelp",
          color: "yellow",
          disabled: props.locked,
          onClick: () => emit("toggle-substatus", props.item),
        });
      }
    }
  }

  if (props.variant === "detail" && props.showDocument) {
    list.push({
      key: "document",
      icon: "File",
      disabled: props.locked,
      onClick: () => emit("view-resume", props.item),
    });
  }

  return list;
});
</script>

<template>
  <div
    class="relative flex flex-row justify-between rounded-medium bg-white px-4 py-3 min-h-16 select-none overflow-hidden"
  >
    <div
      class="grid max-h-18 w-full min-w-0 items-center gap-4 overflow-x-auto scrollbar-hide py-1.5"
      :style="{ gridTemplateColumns }"
      draggable="false"
    >
      <span
        v-if="draggable && !locked"
        class="drag-handle inline-flex cursor-grab items-center justify-center p-1 [-webkit-user-drag:none]"
        draggable="false"
      >
        <Grip
          :size="16"
          class="pointer-events-none text-black/30"
          draggable="false"
        />
      </span>

      <div
        v-for="column in columns"
        :key="column.key"
        class="flex self-center-safe min-w-0 items-center justify-start"
        :class="[
          column.fixed
            ? ''
            : 'overflow-x-auto scrollbar-hide whitespace-nowrap',
          variant === 'detail' && column.key === 'status' && !blocked && !locked
            ? 'cursor-pointer'
            : '',
        ]"
        @click="
          variant === 'detail' && column.key === 'status' && !blocked && !locked
            ? $emit('toggle-substatus', item)
            : undefined
        "
      >
        <component :is="column.component" v-bind="column.props(item)" />
      </div>

      <slot name="actions" :item="item" />
    </div>

    <TransitionGroup
      name="action-btn"
      tag="div"
      class="absolute px-4 h-full right-0 top-1/2 -translate-y-1/2 flex flex-row items-center-safe gap-2 bg-white"
    >
      <Button
        v-for="(action, index) in actions"
        :key="action.key"
        :icon="action.icon"
        variant="primary"
        :color="action.color"
        :small="true"
        :toggled="action.toggled"
        :disabled="action.disabled"
        :style="{ transitionDelay: `${index * 45}ms` }"
        @click="action.onClick"
      />
    </TransitionGroup>
  </div>
</template>

<style scoped>
.action-btn-enter-active {
  transition:
    opacity 220ms ease,
    transform 220ms ease;
}
.action-btn-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.action-btn-leave-active {
  position: absolute;
  transition:
    opacity 120ms ease,
    transform 120ms ease;
}
.action-btn-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
.action-btn-move {
  transition: none !important;
}
</style>
