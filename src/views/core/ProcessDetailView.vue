<script setup lang="ts">

import { computed, onMounted, ref } from "vue";
import { useRoute }                 from "vue-router";

import SelectionTable          from "@/components/ui/table/SelectionTable.vue";
import OrderableFilterChips    from "@/components/layout/OrderableFilterChips.vue";
import Button                  from "@/components/ui/Button.vue";
import Sidebar                 from "@/components/layout/sidebar/Sidebar.vue";
import CandidateResumeSidebar  from "@/components/layout/sidebar/content/CandidateResumeSidebar.vue";
import ApprovedListSidebar     from "@/components/layout/sidebar/content/ApprovedListSidebar.vue";
import ConfirmPopup            from "@/components/popup/ConfirmPopup.vue";
import FormPopup, { type FormField } from "@/components/popup/FormPopup.vue";
import FiltersPopup            from "@/components/popup/FiltersPopup.vue";
import ImportCandidatesPopup   from "@/components/popup/ImportCandidatesPopup.vue";
import AddCandidateChoicePopup from "@/components/popup/AddCandidateChoicePopup.vue";

import { candidateColumns } from "@/components/ui/table/columns/candidateColumns";
import { CandidateStatus, Seniority, type Candidate, type TableColumn } from "@/components/ui/table/types";
import type { SelectiveProcess } from "@/types/peneira";
import { MAX_VISIBLE_COLUMNS } from "@/components/ui/table/style/grid";
import {
  getProcess, getCandidatesForProcess, updateProcess,
  createCandidate, updateCandidate, removeCandidateFromProcess,
  resolveCandidateResumeUrl,
} from "@/service/Peneiras";
import { notify } from "@/components/feedback/notify";

const route     = useRoute();
const processId = route.params.id as string;

const process    = ref<SelectiveProcess>();
const candidates = ref<Candidate[]>([]);

onMounted(async () => {
  [process.value, candidates.value] = await Promise.all([
    getProcess(processId),
    getCandidatesForProcess(processId),
  ]);
  // The API doesn't expose a headcount on Grupo; derive it from the roster we already fetched.
  if (process.value) process.value.participants = candidates.value.length;
});

const allColumns = candidateColumns();

// Pseudo-columns for the actions panel — not real data columns (kept out of
// `allColumns`/`visibleColumns`), only used to toggle Row's action groups.
const ACTION_OPTIONS = [
  { key: "editGroup", label: "Ações" },
  { key: "document",  label: "Currículo" },
];

const COLUMN_OPTIONS = [
  ...allColumns.map((column) => ({ key: column.key, label: column.label })),
  ...ACTION_OPTIONS,
];

const activeColumns = ref<string[]>(["name", "status", "phone", "network", "editGroup", "document"]);

const showManageActions = computed(() => activeColumns.value.includes("editGroup"));
const showDocument      = computed(() => activeColumns.value.includes("document"));

const visibleColumns = computed(() =>
  activeColumns.value
    .map((key) => allColumns.find((column) => column.key === key))
    .filter((column): column is TableColumn<Candidate> => Boolean(column)),
);

const tableRef = ref<InstanceType<typeof SelectionTable> | null>(null);

const sidebarOpen        = ref(false);
const sidebarMode        = ref<"resume" | "approved" | null>(null);
const activeCandidateId  = ref<string | number>();

async function openResume(candidate: Candidate) {
  activeCandidateId.value = candidate.id;
  sidebarMode.value       = "resume";
  sidebarOpen.value       = true;

  if (!candidate.curriculumUrl) {
    try {
      candidate.curriculumUrl = await resolveCandidateResumeUrl(candidate.id);
    } catch {
      notify("Não foi possível carregar o currículo.", "error");
    }
  }
}

function openApproved() {
  sidebarMode.value = "approved";
  sidebarOpen.value = true;
}

function reorderApproved(items: Candidate[]) {
  if (!tableRef.value) return;
  tableRef.value.groups[CandidateStatus.Aprovado] = items;
}

function removeFromApproved(candidate: Candidate) {
  tableRef.value?.moveToStatus(candidate, CandidateStatus.Reprovado);
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
      { value: Seniority.SemExperiencia, label: "Sem experiência" },
      { value: Seniority.Estagiario, label: "Estagiário" },
      { value: Seniority.Junior, label: "Júnior" },
      { value: Seniority.Pleno, label: "Pleno" },
      { value: Seniority.Senior, label: "Sênior" },
    ],
  },
  { key: "salaryExpectation", label: "Expectativa salarial", type: "number" },
];

const deleteTarget = ref<Candidate | null>(null);
const deleteConfirmOpen = computed({
  get: () => !!deleteTarget.value,
  set: (value: boolean) => { if (!value) deleteTarget.value = null; },
});

async function confirmDeleteCandidate() {
  if (!deleteTarget.value) return;
  const target = deleteTarget.value;
  deleteTarget.value = null;

  try {
    await removeCandidateFromProcess(processId, target.id);
    candidates.value = candidates.value.filter((candidate) => candidate.id !== target.id);
    if (process.value) process.value.participants = candidates.value.length;
  } catch {
    notify("Não foi possível excluir o candidato.", "error");
  }
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
    salaryExpectation: String(candidate.salaryExpectation),
  };
});

async function submitEditCandidate(values: Record<string, string>) {
  if (!editTarget.value) return;
  const target = editTarget.value;
  editTarget.value = null;

  const updated: Candidate = {
    ...target,
    name: values.name,
    email: values.email,
    phone: values.phone,
    role: values.role,
    seniority: values.seniority as Seniority,
    salaryExpectation: Number(values.salaryExpectation),
  };

  try {
    const saved = Object.assign(target, await updateCandidate(processId, updated));
    candidates.value = candidates.value.map((candidate) => (candidate.id === saved.id ? saved : candidate));
  } catch {
    notify("Não foi possível salvar as alterações do candidato.", "error");
  }
}

const addCandidateChoiceOpen = ref(false);
const newCandidateOpen = ref(false);
const importOpen = ref(false);

async function refreshCandidates() {
  candidates.value = await getCandidatesForProcess(processId);
  if (process.value) process.value.participants = candidates.value.length;
}

async function submitNewCandidate(values: Record<string, string>) {
  try {
    const created = await createCandidate(processId, {
      name: values.name,
      email: values.email,
      phone: values.phone,
      role: values.role,
      seniority: values.seniority as Seniority,
      salaryExpectation: Number(values.salaryExpectation),
    });
    candidates.value.push(created);
    if (process.value) process.value.participants = candidates.value.length;
  } catch {
    notify("Não foi possível adicionar o candidato.", "error");
  }
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

async function submitEditProcess(values: Record<string, string>) {
  if (!process.value) return;

  const updated: SelectiveProcess = {
    ...process.value,
    jobTitle: values.jobTitle,
    department: values.department,
    availableSlots: Number(values.availableSlots),
    approvalLimit: Number(values.approvalLimit),
    teamEmail: values.teamEmail,
  };

  try {
    const saved = await updateProcess(processId, updated);
    // The API doesn't expose a headcount on Grupo, so `saved.participants` is always 0 — keep the count derived from the roster.
    Object.assign(process.value, saved, { participants: process.value.participants });
  } catch {
    notify("Não foi possível salvar as alterações do processo.", "error");
  }
}

</script>

<template>
  <div v-if="process" class="flex h-full overflow-hidden">
    <main
      class="flex flex-col gap-6 overflow-y-auto p-8 transition-[width] duration-300 ease-in-out"
      :style="{ width: sidebarOpen ? '60%' : '100%' }"
    >
      <div class="flex flex-col gap-2">
        <div class="flex items-start gap-3">
          <div>
            <h1 class="leading-none">{{ process.jobTitle }}</h1>
            <h3>{{ process.department }}</h3>
          </div>
          <Button icon="EllipsisVertical" variant="neutral" @click="editProcessOpen = true" />
          <div class="ml-auto flex items-center gap-3">
            <Button icon="UserPlus" variant="primary" @click="addCandidateChoiceOpen = true" />
            <Button icon="Download" variant="primary" />
            <Button icon="Share2"   variant="primary" />
            <Button icon="ListTodo" variant="primary" @click="openApproved" />
          </div>
        </div>
  
        <OrderableFilterChips
          :options="COLUMN_OPTIONS" v-model="activeColumns" :pinned="['name']" :locked-toggleable="['editGroup', 'document']" :max="MAX_VISIBLE_COLUMNS"
          @open-filters="filtersOpen = true"
        />
      </div>

      <SelectionTable
        ref="tableRef"
        :columns="visibleColumns"
        :items="candidates"
        :approval-limit="process.approvalLimit"
        :show-manage-actions="showManageActions"
        :show-document="showDocument"
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
        :items="tableRef.groups[CandidateStatus.Aprovado]"
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

    <AddCandidateChoicePopup
      v-model="addCandidateChoiceOpen"
      @manual="newCandidateOpen = true"
      @excel="importOpen = true"
    />

    <ImportCandidatesPopup
      v-model="importOpen"
      :grupo-id="processId"
      @imported="refreshCandidates"
    />

    <FiltersPopup v-model="filtersOpen" title="Colunas visíveis" :options="COLUMN_OPTIONS" v-model:active="activeColumns" />
  </div>
  <main v-else class="flex flex-col gap-6 p-8">
    <p>Peneira não encontrada.</p>
  </main>
</template>
