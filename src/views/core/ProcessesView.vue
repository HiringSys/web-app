<script setup lang="ts">
import { ref, computed, onMounted } from "vue";

import Table from "@/components/ui/table/Table.vue";
import Button from "@/components/ui/Button.vue";
import FilterChips from "@/components/layout/FilterChips.vue";
import ConfirmPopup from "@/components/popup/ConfirmPopup.vue";
import FormPopup, { type FormField } from "@/components/popup/FormPopup.vue";
import FiltersPopup from "@/components/popup/FiltersPopup.vue";

import JobTitleField from "@/components/ui/table/fields/JobTitleField.vue";
import ProcessStatusField from "@/components/ui/table/fields/ProcessStatusField.vue";
import ValueField from "@/components/ui/table/fields/ValueField.vue";

import type { TableColumn } from "@/components/ui/table/types";
import { ProcessStatus, type SelectiveProcess } from "@/types/peneira";
import { listProcesses, updateProcess, deleteProcess } from "@/service/Peneiras";
import { notify } from "@/components/feedback/notify";

const processes = ref<SelectiveProcess[]>([]);

onMounted(async () => {
  processes.value = await listProcesses();
});

const columns: TableColumn<SelectiveProcess>[] = [
  {
    key: "jobTitle",
    label: "Finalidade da vaga",
    size: "lg",
    measure: (item) => (item.jobTitle.length >= item.department.length ? item.jobTitle : item.department),
    component: JobTitleField,
    props: (item) => ({
      title: item.jobTitle,
      subtitle: item.department,
      to: { name: "peneira-filtragem", params: { id: item.id } },
    }),
  },
  {
    key: "status",
    label: "Estado",
    size: "sm",
    fixed: true,
    component: ProcessStatusField,
    props: (item) => ({ status: item.status }),
  },
  {
    key: "availableSlots",
    label: "Disponíveis",
    size: "sm",
    measure: (item) => String(item.availableSlots),
    component: ValueField,
    props: (item) => ({ value: item.availableSlots }),
  },
  {
    key: "participants",
    label: "Participantes",
    size: "sm",
    measure: (item) => String(item.participants),
    component: ValueField,
    props: (item) => ({ value: item.participants }),
  },
  {
    key: "role",
    label: "Cargo",
    size: "md",
    measure: (item) => item.role,
    component: ValueField,
    props: (item) => ({ value: item.role }),
  },
];

const STATUS_OPTIONS = [
  { key: ProcessStatus.Encerrado, label: "Encerrados" },
  { key: ProcessStatus.EmProcesso, label: "Em processo" },
  { key: ProcessStatus.Pausado, label: "Pausados" },
  { key: ProcessStatus.EmColeta, label: "Em coleta" },
  { key: ProcessStatus.Rascunho, label: "Rascunhos" },
];

const activeStatuses = ref<string[]>(
  STATUS_OPTIONS.map((option) => option.key),
);

const filteredProcesses = computed(() =>
  processes.value.filter((process) => activeStatuses.value.includes(process.status)),
);

const filtersOpen = ref(false);

const deleteTarget = ref<SelectiveProcess | null>(null);
const deleteConfirmOpen = computed({
  get: () => !!deleteTarget.value,
  set: (value: boolean) => { if (!value) deleteTarget.value = null; },
});

async function confirmDeleteProcess() {
  if (!deleteTarget.value) return;
  const target = deleteTarget.value;
  deleteTarget.value = null;

  try {
    await deleteProcess(target.id);
    processes.value = processes.value.filter((process) => process.id !== target.id);
  } catch {
    notify("Não foi possível excluir o processo.", "error");
  }
}

const PROCESS_FIELDS: FormField[] = [
  { key: "jobTitle", label: "Finalidade da vaga" },
  { key: "department", label: "Departamento" },
  { key: "availableSlots", label: "Vagas disponíveis", type: "number" },
  { key: "approvalLimit", label: "Quantidade de aprovados", type: "number" },
  { key: "teamEmail", label: "E-mail da equipe responsável", type: "email" },
];

const editTarget = ref<SelectiveProcess | null>(null);
const editOpen = computed({
  get: () => !!editTarget.value,
  set: (value: boolean) => { if (!value) editTarget.value = null; },
});

const editValues = computed<Record<string, string>>(() => {
  if (!editTarget.value) return {} as Record<string, string>;
  const process = editTarget.value;
  return {
    jobTitle: process.jobTitle,
    department: process.department,
    availableSlots: String(process.availableSlots),
    approvalLimit: String(process.approvalLimit),
    teamEmail: process.teamEmail,
  };
});

async function submitEditProcess(values: Record<string, string>) {
  if (!editTarget.value) return;
  const target = editTarget.value;
  editTarget.value = null;

  // approvalLimit/teamEmail have no backend field yet (see .sdd/swagger/gaps.md) — applied locally only.
  Object.assign(target, {
    jobTitle: values.jobTitle,
    department: values.department,
    availableSlots: Number(values.availableSlots),
    approvalLimit: Number(values.approvalLimit),
    teamEmail: values.teamEmail,
  });

  try {
    await updateProcess(target.id, target);
  } catch {
    notify("Não foi possível salvar as alterações do processo.", "error");
  }
}
</script>

<template>
  <main class="flex flex-col gap-6 p-8">
    <div class="flex items-center gap-3">
      <h1>Processos seletivos</h1>
      <Button icon="LayoutGrid" variant="primary" />
    </div>

    <FilterChips :options="STATUS_OPTIONS" v-model="activeStatuses" @open-filters="filtersOpen = true" />

    <Table
      :columns="columns" :items="filteredProcesses" :draggable="false"
      :disabled-items="(process) => process.status === ProcessStatus.Encerrado"
      @delete-item="deleteTarget = $event"
      @edit-item="editTarget = $event"
    >
    </Table>

    <ConfirmPopup
      v-model="deleteConfirmOpen"
      title="Excluir processo"
      :message="`Tem certeza que deseja excluir ${deleteTarget?.jobTitle}? Essa ação não pode ser desfeita.`"
      confirm-text="Excluir"
      danger
      @confirm="confirmDeleteProcess"
    />

    <FormPopup
      v-model="editOpen"
      title="Editar processo"
      :fields="PROCESS_FIELDS"
      :initial-values="editValues"
      @submit="submitEditProcess"
    />

    <FiltersPopup v-model="filtersOpen" title="Status" :options="STATUS_OPTIONS" v-model:active="activeStatuses" />
  </main>
</template>
