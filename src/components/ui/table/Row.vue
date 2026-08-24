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
  "edit-department": [item: T];
  "toggle-block": [item: T];
  "toggle-substatus": [item: T];
  "reject-item": [item: T];
}>();

type ActionButton = {
  key: string;
  label: string;
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
      label: "Excluir candidato",
      icon: "Trash2",
      color: "red",
      disabled: props.variant === "detail" && props.locked,
      onClick: () => emit("delete-item", props.item),
    });
    list.push({
      key: "edit",
      label: "Editar candidato",
      icon: "Pencil",
      disabled: props.locked,
      onClick: () => emit("edit-item", props.item),
    });

    if (props.variant === "detail") {
      list.push({
        key: "department",
        label: "Editar departamento",
        icon: "Building2",
        disabled: props.locked,
        onClick: () => emit("edit-department", props.item),
      });

      list.push({
        key: "block",
        label: props.blocked ? "Desbloquear candidato" : "Bloquear candidato",
        icon: "CircleSlash",
        color: "orange",
        toggled: props.blocked,
        disabled: props.locked,
        onClick: () => emit("toggle-block", props.item),
      });

      if (props.boardStatus === CandidateStatus.Aprovado) {
        list.push({
          key: "reject",
          label: "Mover para reprovados",
          icon: "X",
          color: "red",
          disabled: props.locked,
          onClick: () => emit("reject-item", props.item),
        });
      }
      if (props.boardStatus === CandidateStatus.Reprovado) {
        list.push({
          key: "toggle-substatus",
          label: "Alterar situação da análise",
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
      label: "Visualizar currículo",
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
    class="relative flex min-h-16 select-none overflow-hidden rounded-medium bg-white px-4 py-3 shadow-[0_1px_0_rgb(25_25_25/0.03)]"
    :class="variant === 'detail' ? 'flex-col gap-3 lg:flex-row lg:items-center' : 'flex-row justify-between'"
  >
    <div
      class="grid min-w-0 flex-1 items-center gap-4 overflow-x-auto py-1.5 scrollbar-hide"
      :class="variant === 'detail' ? 'max-h-none' : 'max-h-18'"
      :style="{ gridTemplateColumns }"
      draggable="false"
    >
      <span
        v-if="draggable"
        class="inline-flex items-center justify-center p-1 [-webkit-user-drag:none]"
        :class="locked ? 'cursor-default' : 'drag-handle cursor-grab'"
        draggable="false"
      >
        <Grip
          v-if="!locked"
          :size="16"
          class="pointer-events-none text-black/40"
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
      v-if="actions.length"
      name="action-btn"
      tag="div"
      class="flex shrink-0 flex-row items-center gap-2 bg-white"
      :class="variant === 'detail'
        ? 'w-full justify-start overflow-x-auto border-t border-black/10 pb-1 pt-3 scrollbar-hide lg:w-auto lg:justify-end lg:overflow-visible lg:border-l lg:border-t-0 lg:pb-1 lg:pl-4 lg:pt-1'
        : 'absolute right-0 top-1/2 h-full -translate-y-1/2 px-4'"
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
        :aria-label="action.label"
        :title="action.label"
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
