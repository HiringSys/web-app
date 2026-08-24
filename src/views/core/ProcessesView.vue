<script setup lang="ts">

import { ref, computed, watch, onMounted } from "vue";

import Table from "@@/ui/table/Table.vue";
import TableSkeleton from "@@/ui/table/TableSkeleton.vue";
import Button from "@@/ui/Button.vue";
import FilterChips from "@@/layout/FilterChips.vue";
import ConfirmPopup from "@@/popup/ConfirmPopup.vue";
import FormPopup, { type FormField } from "@@/popup/FormPopup.vue";
import FiltersPopup from "@@/popup/FiltersPopup.vue";

import JobTitleField from "@@/ui/table/fields/JobTitleField.vue";
import ProcessStatusField from "@@/ui/table/fields/ProcessStatusField.vue";
import ValueField from "@@/ui/table/fields/ValueField.vue";

import type { TableColumn } from "@@/ui/table/types";
import {
  ProcessStatus,
  PROCESS_STATUS_COLORS,
  type SelectiveProcess,
} from "@/types/peneira";

import {
  listProcesses,
  createProcess,
  updateProcess,
  deleteProcess,
} from "@/service/Peneiras";

import { notify } from "@@/feedback/notify";
import { useNavbar } from "@/components/layout/navbar/useNavbar";

const processes = ref<SelectiveProcess[]>([]);
const loading = ref(true);
const loadError = ref("");

const { isNavOpen } = useNavbar();

async function loadProcesses() {
  loading.value = true;
  loadError.value = "";
  try {
    processes.value = await listProcesses();
  } catch (error) {
    loadError.value = error instanceof Error
      ? error.message
      : "Não foi possível carregar os processos seletivos.";
  } finally {
    loading.value = false;
  }
}

onMounted(loadProcesses);

const columns: TableColumn<SelectiveProcess>[] = [
  {
    key: "jobTitle",
    label: "Finalidade da vaga",
    size: "lg",
    measure: (item) =>
      item.jobTitle.length >= item.department.length
        ? item.jobTitle
        : item.department,
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
  { key: ProcessStatus.Encerrado,  label: "Encerrados",  color: PROCESS_STATUS_COLORS[ProcessStatus.Encerrado]  },
  { key: ProcessStatus.EmProcesso, label: "Em processo", color: PROCESS_STATUS_COLORS[ProcessStatus.EmProcesso] },
  { key: ProcessStatus.Pausado,    label: "Pausados",    color: PROCESS_STATUS_COLORS[ProcessStatus.Pausado]    },
  { key: ProcessStatus.EmColeta,   label: "Em coleta",   color: PROCESS_STATUS_COLORS[ProcessStatus.EmColeta]   },
  { key: ProcessStatus.Rascunho,   label: "Rascunhos",   color: PROCESS_STATUS_COLORS[ProcessStatus.Rascunho]   },
];

const activeStatuses = ref<string[]>(
  STATUS_OPTIONS.map((option) => option.key),
);

const filteredProcesses = computed(() =>
  processes.value.filter((process) =>
    activeStatuses.value.includes(process.status),
  ),
);

const PAGE_SIZE = 5;
const page = ref(1);

watch(filteredProcesses, () => {
  page.value = 1;
});

const pageCount = computed(() =>
  Math.max(1, Math.ceil(filteredProcesses.value.length / PAGE_SIZE)),
);

const paginatedProcesses = computed(() => {
  const start = (page.value - 1) * PAGE_SIZE;
  return filteredProcesses.value.slice(start, start + PAGE_SIZE);
});

const hasPrevPage = computed(() => page.value > 1);
const hasNextPage = computed(() => page.value < pageCount.value);

function prevPage() {
  if (hasPrevPage.value) page.value -= 1;
}
function nextPage() {
  if (hasNextPage.value) page.value += 1;
}

const filtersOpen = ref(false);

const deleteTarget = ref<SelectiveProcess | null>(null);
const deleteConfirmOpen = computed({
  get: () => !!deleteTarget.value,
  set: (value: boolean) => {
    if (!value) deleteTarget.value = null;
  },
});

async function confirmDeleteProcess() {
  if (!deleteTarget.value) return;
  const target = deleteTarget.value;
  deleteTarget.value = null;

  try {
    await deleteProcess(target.id);
    processes.value = processes.value.filter(
      (process) => process.id !== target.id,
    );
  } catch {
    notify("Não foi possível excluir o processo.", "error");
  }
}

const PROCESS_FIELDS: FormField[] = [
  { key: "jobTitle", label: "Finalidade da vaga", required: true },
  { key: "department", label: "Departamento", required: true },
  {
    key: "status",
    label: "Estado",
    type: "select",
    required: true,
    options: STATUS_OPTIONS.map((option) => ({
      value: option.key,
      label: option.label,
    })),
  },
  { key: "availableSlots", label: "Vagas disponíveis", type: "number", min: 0, required: true },
  { key: "approvalLimit", label: "Quantidade de aprovados", type: "number", min: 0, required: true },
  { key: "teamEmail", label: "E-mail da equipe responsável", type: "email", required: true },
];

const editTarget = ref<SelectiveProcess | null>(null);
const editOpen = computed({
  get: () => !!editTarget.value,
  set: (value: boolean) => {
    if (!value) editTarget.value = null;
  },
});

const NEW_PROCESS_FIELDS: FormField[] = [
  { key: "jobTitle", label: "Finalidade da vaga", required: true },
  { key: "department", label: "Departamento", required: true },
  {
    key: "status",
    label: "Estado",
    type: "select",
    required: true,
    options: STATUS_OPTIONS.map((option) => ({
      value: option.key,
      label: option.label,
    })),
  },
  { key: "availableSlots", label: "Vagas disponíveis", type: "number", min: 0, required: true },
  { key: "approvalLimit", label: "Quantidade de aprovados", type: "number", min: 0, required: true },
  { key: "teamEmail", label: "E-mail da equipe responsável", type: "email", required: true },
];

const NEW_PROCESS_INITIAL_VALUES: Record<string, string> = {
  status: ProcessStatus.Rascunho,
  availableSlots: "0",
  approvalLimit: "0",
};

const newProcessOpen = ref(false);

async function submitNewProcess(values: Record<string, string>) {
  try {
    const created = await createProcess({
      jobTitle: values.jobTitle,
      department: values.department,
      status: values.status as ProcessStatus,
      availableSlots: Number(values.availableSlots),
      role: "",
      approvalLimit: Number(values.approvalLimit),
      teamEmail: values.teamEmail,
    });
    processes.value.push(created);
  } catch {
    notify("Não foi possível criar o processo.", "error");
  }
}

const editValues = computed<Record<string, string>>(() => {
  if (!editTarget.value) return {} as Record<string, string>;
  const process = editTarget.value;
  return {
    jobTitle: process.jobTitle,
    department: process.department,
    status: process.status,
    availableSlots: String(process.availableSlots),
    approvalLimit: String(process.approvalLimit),
    teamEmail: process.teamEmail,
  };
});

async function submitEditProcess(values: Record<string, string>) {
  if (!editTarget.value) return;
  const target = editTarget.value;
  editTarget.value = null;

  const updated: SelectiveProcess = {
    ...target,
    jobTitle: values.jobTitle,
    department: values.department,
    status: values.status as ProcessStatus,
    availableSlots: Number(values.availableSlots),
    approvalLimit: Number(values.approvalLimit),
    teamEmail: values.teamEmail,
  };

  try {
    const saved = Object.assign(
      target,
      await updateProcess(target.id, updated),
    );
    processes.value = processes.value.map((process) =>
      process.id === saved.id ? saved : process,
    );
  } catch {
    notify("Não foi possível salvar as alterações do processo.", "error");
  }
}

</script>

<template>
  <main class="flex flex-col gap-6 p-4 pb-28 sm:p-8">
    <div class="flex items-center gap-3">
      <div
        class="flex flex-row gap-4"
        :class="!isNavOpen ? 'translate-x-16' : ''"
      >
        <h1>Processos seletivos</h1>
        <Button class="h-fit" icon="LayoutGrid" variant="primary" />
      </div>
      <Button
        icon="ListFilterPlus"
        aria-label="Criar processo seletivo"
        variant="primary"
        class="ml-auto"
        @click="newProcessOpen = true"
      />
    </div>

    <FilterChips
      :options="STATUS_OPTIONS"
      v-model="activeStatuses"
      @open-filters="filtersOpen = true"
    />

    <TableSkeleton
      v-if="loading"
      :columns="columns"
      :rows="PAGE_SIZE"
      :draggable="false"
    />

    <section v-else-if="loadError" class="flex flex-col items-center gap-4 rounded-medium bg-white px-6 py-12 text-center shadow-soft">
      <div>
        <h2>Não foi possível carregar os processos</h2>
        <p class="mt-1 text-black/55">{{ loadError }}</p>
      </div>
      <Button text="Tentar novamente" icon="RefreshCw" @click="loadProcesses" />
    </section>

    <section v-else-if="!paginatedProcesses.length" class="rounded-medium bg-white px-6 py-12 text-center shadow-soft">
      <h2>Nenhum processo encontrado</h2>
      <p class="mt-1 text-black/50">Ajuste os filtros ou crie um novo processo seletivo.</p>
    </section>

    <Table
      v-else
      :columns="columns"
      :items="paginatedProcesses"
      :draggable="false"
      :disabled-items="(process) => process.status === ProcessStatus.Encerrado"
      @delete-item="deleteTarget = $event"
      @edit-item="editTarget = $event"
    >
    </Table>

    <div
      v-if="!loading && !loadError && filteredProcesses.length"
      class="flex w-full items-center justify-end-safe gap-4 px-3 pb-4 pt-2 rounded-medium"
    >
      <Button
        icon="ArrowLeft"
        :variant="hasPrevPage ? 'primary' : 'neutral'"
        :disabled="!hasPrevPage"
        :class="!hasPrevPage ? 'opacity-40 bg-white!' : ''"
        @click="prevPage"
      />
      <Button
        icon="ArrowRight"
        :variant="hasNextPage ? 'primary' : 'neutral'"
        :disabled="!hasNextPage"
        :class="!hasNextPage ? 'opacity-40 bg-white!' : ''"
        @click="nextPage"
      />
    </div>

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

    <FormPopup
      v-model="newProcessOpen"
      title="Novo processo"
      submit-text="Criar"
      :fields="NEW_PROCESS_FIELDS"
      :initial-values="NEW_PROCESS_INITIAL_VALUES"
      @submit="submitNewProcess"
    />

    <FiltersPopup
      v-model="filtersOpen"
      title="Status"
      :options="STATUS_OPTIONS"
      v-model:active="activeStatuses"
    />
  </main>
</template>
