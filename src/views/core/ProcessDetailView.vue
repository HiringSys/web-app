<script setup lang="ts">

import { computed, onMounted, ref } from "vue";
import { useRoute }                 from "vue-router";

import SelectionTable          from "@/components/ui/table/SelectionTable.vue";
import FilterChips             from "@/components/ui/FilterChips.vue";
import Button                  from "@/components/ui/Button.vue";
import Sidebar                 from "@/components/layout/sidebar/Sidebar.vue";
import CandidateResumeSidebar  from "@/components/layout/sidebar/content/CandidateResumeSidebar.vue";
import ApprovedListSidebar     from "@/components/layout/sidebar/content/ApprovedListSidebar.vue";
import ConfirmPopup            from "@/components/popup/ConfirmPopup.vue";
import FormPopup, { type FormField } from "@/components/popup/FormPopup.vue";
import FiltersPopup            from "@/components/popup/FiltersPopup.vue";

import { candidateColumns } from "@/components/ui/table/columns/candidateColumns";
import { Seniority, type Candidate, type TableColumn } from "@/components/ui/table/types";
import type { SelectiveProcess } from "@/types/peneira";
import { MAX_VISIBLE_COLUMNS } from "@/components/ui/table/style/grid";
import { getProcess, getCandidatesForProcess } from "@/service/Peneiras";

const route     = useRoute();
const processId = route.params.id as string;

const process    = ref<SelectiveProcess>();
const candidates = ref<Candidate[]>([]);

onMounted(async () => {
  [process.value, candidates.value] = await Promise.all([
    getProcess(processId),
    getCandidatesForProcess(processId),
  ]);
});

const allColumns = candidateColumns();
const COLUMN_OPTIONS = allColumns.map((column) => ({
  key:   column.key,
  label: column.label,
}));

const activeColumns = ref<string[]>(["name", "status", "phone", "network"]);

const visibleColumns = computed(() =>
  activeColumns.value
    .map((key) => allColumns.find((column) => column.key === key))
    .filter((column): column is TableColumn<Candidate> => Boolean(column)),
);

const tableRef = ref<InstanceType<typeof SelectionTable> | null>(null);

const sidebarOpen        = ref(false);
const sidebarMode        = ref<"resume" | "approved" | null>(null);
const activeCandidateId  = ref<string | number>();

function openResume(candidate: Candidate) {
  activeCandidateId.value = candidate.id;
  sidebarMode.value       = "resume";
  sidebarOpen.value       = true;
}

function openApproved() {
  sidebarMode.value = "approved";
  sidebarOpen.value = true;
}

function reorderApproved(items: Candidate[]) {
  if (!tableRef.value) return;
  tableRef.value.approved = items;
  tableRef.value.syncStatuses();
}

function removeFromApproved(candidate: Candidate) {
  if (!tableRef.value) return;
  const index = tableRef.value.approved.findIndex((item) => item.id === candidate.id);
  if (index === -1) return;

  const [removed] = tableRef.value.approved.splice(index, 1);
  removed.status = "reprovado";
  tableRef.value.rejected.push(removed);
  tableRef.value.syncStatuses();
}

const filtersOpen = ref(false);

const CANDIDATE_FIELDS: FormField[] = [
  { key: "name", label: "Nome" },
  { key: "email", label: "E-mail", type: "email" },
  { key: "phone", label: "Telefone", type: "tel" },
  { key: "role", label: "Cargo" },
  {
    key: "seniority",
    label: "Senioridade",
    type: "select",
    options: [
      { value: Seniority.Junior, label: "Júnior" },
      { value: Seniority.Pleno, label: "Pleno" },
      { value: Seniority.Senior, label: "Sênior" },
    ],
  },
  { key: "experienceYears", label: "Anos de experiência", type: "number" },
  { key: "salaryExpectation", label: "Expectativa salarial", type: "number" },
];

const deleteTarget = ref<Candidate | null>(null);
const deleteConfirmOpen = computed({
  get: () => !!deleteTarget.value,
  set: (value: boolean) => { if (!value) deleteTarget.value = null; },
});

function confirmDeleteCandidate() {
  if (!deleteTarget.value) return;
  candidates.value = candidates.value.filter((candidate) => candidate.id !== deleteTarget.value!.id);
  deleteTarget.value = null;
}

const editTarget = ref<Candidate | null>(null);
const editOpen = computed({
  get: () => !!editTarget.value,
  set: (value: boolean) => { if (!value) editTarget.value = null; },
});

const editValues = computed<Record<string, string>>(() => {
  if (!editTarget.value) return {} as Record<string, string>;
  const candidate = editTarget.value;
  return {
    name: candidate.name,
    email: candidate.email,
    phone: candidate.phone,
    role: candidate.role,
    seniority: candidate.seniority,
    experienceYears: String(candidate.experienceYears),
    salaryExpectation: String(candidate.salaryExpectation),
  };
});

function submitEditCandidate(values: Record<string, string>) {
  if (!editTarget.value) return;
  Object.assign(editTarget.value, {
    name: values.name,
    email: values.email,
    phone: values.phone,
    role: values.role,
    seniority: values.seniority,
    experienceYears: Number(values.experienceYears),
    salaryExpectation: Number(values.salaryExpectation),
  });
  editTarget.value = null;
}

const newCandidateOpen = ref(false);

function submitNewCandidate(values: Record<string, string>) {
  candidates.value.push({
    id: `${Date.now()}`,
    name: values.name,
    email: values.email,
    phone: values.phone,
    role: values.role,
    seniority: values.seniority as Seniority,
    experienceYears: Number(values.experienceYears),
    salaryExpectation: Number(values.salaryExpectation),
    status: "reprovado",
  });
}

const PROCESS_FIELDS: FormField[] = [
  { key: "jobTitle", label: "Finalidade da vaga" },
  { key: "department", label: "Departamento" },
  { key: "availableSlots", label: "Vagas disponíveis", type: "number" },
  { key: "approvalLimit", label: "Quantidade de aprovados", type: "number" },
  { key: "teamEmail", label: "E-mail da equipe responsável", type: "email" },
];

const editProcessOpen = ref(false);

const editProcessValues = computed<Record<string, string>>(() => {
  if (!process.value) return {} as Record<string, string>;
  return {
    jobTitle: process.value.jobTitle,
    department: process.value.department,
    availableSlots: String(process.value.availableSlots),
    approvalLimit: String(process.value.approvalLimit),
    teamEmail: process.value.teamEmail,
  };
});

function submitEditProcess(values: Record<string, string>) {
  if (!process.value) return;
  Object.assign(process.value, {
    jobTitle: values.jobTitle,
    department: values.department,
    availableSlots: Number(values.availableSlots),
    approvalLimit: Number(values.approvalLimit),
    teamEmail: values.teamEmail,
  });
}

</script>

<template>
  <div v-if="process" class="flex h-full overflow-hidden">
    <main
      class="flex flex-col gap-6 overflow-y-auto p-8 transition-[width] duration-300 ease-in-out"
      :style="{ width: sidebarOpen ? '60%' : '100%' }"
    >
      <div class="flex items-start gap-3">
        <div>
          <h1 class="leading-none">{{ process.jobTitle }}</h1>
          <h3>{{ process.department }}</h3>
        </div>
        <Button icon="EllipsisVertical" variant="neutral" @click="editProcessOpen = true" />
        <div class="ml-auto flex items-center gap-3">
          <Button icon="UserPlus" variant="primary" @click="newCandidateOpen = true" />
          <Button icon="Download" variant="primary" />
          <Button icon="Share2"   variant="primary" />
          <Button icon="ListTodo" variant="primary" @click="openApproved" />
        </div>
      </div>

      <FilterChips
        :options="COLUMN_OPTIONS" v-model="activeColumns" orderable :pinned="['name']" :max="MAX_VISIBLE_COLUMNS"
        @open-filters="filtersOpen = true"
      />

      <SelectionTable
        ref="tableRef"
        :columns="visibleColumns"
        :items="candidates"
        :approval-limit="process.approvalLimit"
        @update:items="candidates = $event"
        @view-resume="openResume"
        @delete-item="deleteTarget = $event"
        @edit-item="editTarget = $event"
      />
    </main>

    <Sidebar v-model="sidebarOpen" width="40%">
      <CandidateResumeSidebar
        v-if="sidebarMode === 'resume'"
        :candidates="candidates"
        :candidate-id="activeCandidateId!"
        @update:candidate-id="activeCandidateId = $event"
      />
      <ApprovedListSidebar
        v-else-if="sidebarMode === 'approved' && tableRef"
        :items="tableRef.approved"
        :approval-limit="process.approvalLimit"
        @reorder="reorderApproved"
        @remove="removeFromApproved"
      />
    </Sidebar>

    <ConfirmPopup
      v-model="deleteConfirmOpen"
      title="Excluir candidato"
      :message="`Tem certeza que deseja excluir ${deleteTarget?.name}? Essa ação não pode ser desfeita.`"
      confirm-text="Excluir"
      danger
      @confirm="confirmDeleteCandidate"
    />

    <FormPopup
      v-model="editOpen"
      title="Editar candidato"
      :fields="CANDIDATE_FIELDS"
      :initial-values="editValues"
      @submit="submitEditCandidate"
    />

    <FormPopup
      v-model="newCandidateOpen"
      title="Novo candidato"
      submit-text="Adicionar"
      :fields="CANDIDATE_FIELDS"
      :initial-values="{}"
      @submit="submitNewCandidate"
    />

    <FormPopup
      v-model="editProcessOpen"
      title="Editar processo"
      :fields="PROCESS_FIELDS"
      :initial-values="editProcessValues"
      @submit="submitEditProcess"
    />

    <FiltersPopup v-model="filtersOpen" title="Colunas visíveis" :options="COLUMN_OPTIONS" v-model:active="activeColumns" />
  </div>
  <main v-else class="flex flex-col gap-6 p-8">
    <p>Peneira não encontrada.</p>
  </main>
</template>
