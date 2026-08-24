<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";

import SelectionTable from "@@/ui/table/SelectionTable.vue";
import OrderableFilterChips from "@@/layout/OrderableFilterChips.vue";
import Button from "@@/ui/Button.vue";
import Sidebar from "@@/layout/sidebar/Sidebar.vue";

import CandidateResumeSidebar from "@@/layout/sidebar/content/CandidateResumeSidebar.vue";
import ApprovedListSidebar from "@@/layout/sidebar/content/ApprovedListSidebar.vue";
import ConfirmPopup from "@@/popup/ConfirmPopup.vue";
import FormPopup, { type FormField } from "@@/popup/FormPopup.vue";

import FiltersPopup from "@@/popup/FiltersPopup.vue";
import ImportCandidatesPopup from "@@/popup/ImportCandidatesPopup.vue";
import AddCandidateChoicePopup from "@@/popup/AddCandidateChoicePopup.vue";
import Skeleton from "@@/feedback/Skeleton.vue";

import { candidateColumns } from "@@/ui/table/columns/candidateColumns";
import {
  CandidateStatus,
  Seniority,
  type Candidate,
  type TableColumn,
} from "@@/ui/table/types";

import {
  ProcessStatus,
  PROCESS_STATUS_OPTIONS,
  type SelectiveProcess,
} from "@/types/peneira";

import { MAX_VISIBLE_COLUMNS } from "@@/ui/table/style/grid";
import {
  getProcess,
  getCandidatesForProcess,
  updateProcess,
  createCandidate,
  updateCandidate,
  removeCandidateFromProcess,
  resolveCandidateResumeUrl,
  submitStageSelection,
} from "@/service/Peneiras";

import { notify } from "@@/feedback/notify";

const route = useRoute();
const processId = route.params.id as string;

const process = ref<SelectiveProcess>();
const candidates = ref<Candidate[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    [process.value, candidates.value] = await Promise.all([
      getProcess(processId),
      getCandidatesForProcess(processId),
    ]);

    if (process.value) process.value.participants = candidates.value.length;
  } finally {
    loading.value = false;
  }
});

const isEncerrado = computed(
  () => process.value?.status === ProcessStatus.Encerrado,
);

const allColumns = candidateColumns();

const ACTION_OPTIONS = [
  { key: "editGroup", label: "Ações" },
  { key: "document", label: "Currículo" },
];

const COLUMN_OPTIONS = [
  ...allColumns.map((column) => ({ key: column.key, label: column.label })),
  ...ACTION_OPTIONS,
];

const activeColumns = ref<string[]>([
  "name",
  "status",
  "phone",
  "network",
  "editGroup",
  "document",
]);

const showManageActions = computed(() =>
  activeColumns.value.includes("editGroup"),
);
const showDocument = computed(() => activeColumns.value.includes("document"));

const visibleColumns = computed(() =>
  activeColumns.value
    .map((key) => allColumns.find((column) => column.key === key))
    .filter((column): column is TableColumn<Candidate> => Boolean(column)),
);

const tableRef = ref<InstanceType<typeof SelectionTable> | null>(null);

const sidebarOpen = ref(false);
const sidebarMode = ref<"resume" | "approved" | null>(null);
const activeCandidateId = ref<string | number>();

async function openResume(candidate: Candidate) {
  activeCandidateId.value = candidate.id;
  sidebarMode.value = "resume";
  sidebarOpen.value = true;

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
  set: (value: boolean) => {
    if (!value) deleteTarget.value = null;
  },
});

async function confirmDeleteCandidate() {
  if (!deleteTarget.value) return;
  const target = deleteTarget.value;
  deleteTarget.value = null;

  try {
    await removeCandidateFromProcess(processId, target.id);
    candidates.value = candidates.value.filter(
      (candidate) => candidate.id !== target.id,
    );
    if (process.value) process.value.participants = candidates.value.length;
  } catch {
    notify("Não foi possível excluir o candidato.", "error");
  }
}

const editTarget = ref<Candidate | null>(null);
const editOpen = computed({
  get: () => !!editTarget.value,
  set: (value: boolean) => {
    if (!value) editTarget.value = null;
  },
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
    const saved = Object.assign(
      target,
      await updateCandidate(processId, updated),
    );
    candidates.value = candidates.value.map((candidate) =>
      candidate.id === saved.id ? saved : candidate,
    );
  } catch {
    notify("Não foi possível salvar as alterações do candidato.", "error");
  }
}

const addCandidateChoiceOpen = ref(false);
const chooseWayToDownload = ref(false);
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
  } catch (err) {
    console.error(err);
    const reason = err instanceof Error ? err.message : undefined;
    notify(
      reason
        ? `Não foi possível adicionar o candidato: ${reason}`
        : "Não foi possível adicionar o candidato.",
      "error",
    );
  }
}

const PROCESS_FIELDS: FormField[] = [
  { key: "jobTitle", label: "Finalidade da vaga" },
  { key: "department", label: "Departamento" },
  {
    key: "status",
    label: "Estado",
    type: "select",
    options: PROCESS_STATUS_OPTIONS,
  },
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
    status: process.value.status,
    availableSlots: String(process.value.availableSlots),
    approvalLimit: String(process.value.approvalLimit),
    teamEmail: process.value.teamEmail,
  };
});

const shareConfirmOpen = ref(false);

async function confirmShare() {
  if (!process.value || !tableRef.value) return;

  const approvedIds = tableRef.value.groups[CandidateStatus.Aprovado].map(
    (candidate) => candidate.id,
  );

  try {
    await submitStageSelection(processId, approvedIds);
    process.value.status = ProcessStatus.Encerrado;
    await updateProcess(processId, process.value);
  } catch {
    notify("Não foi possível encerrar o processo seletivo.", "error");
  }
}

async function submitEditProcess(values: Record<string, string>) {
  if (!process.value) return;

  const updated: SelectiveProcess = {
    ...process.value,
    jobTitle: values.jobTitle,
    department: values.department,
    status: values.status as ProcessStatus,
    availableSlots: Number(values.availableSlots),
    approvalLimit: Number(values.approvalLimit),
    teamEmail: values.teamEmail,
  };

  try {
    const saved = await updateProcess(processId, updated);
    Object.assign(process.value, saved, {
      participants: process.value.participants,
    });
  } catch {
    notify("Não foi possível salvar as alterações do processo.", "error");
  }
}
</script>

<template>
  <main v-if="loading" class="flex flex-col gap-6 p-8">
    <div class="flex flex-col gap-2">
      <div class="flex items-start gap-3">
        <div class="flex flex-col gap-2">
          <Skeleton width="16rem" height="2rem" />
          <Skeleton width="10rem" height="1.25rem" />
        </div>
        <Skeleton width="2.5rem" height="2.5rem" rounded="rounded-medium" />
        <div class="ml-auto flex items-center gap-3">
          <Skeleton
            v-for="n in 4"
            :key="n"
            width="2.5rem"
            height="2.5rem"
            rounded="rounded-medium"
          />
        </div>
      </div>

      <div class="flex items-center gap-2">
        <Skeleton
          v-for="n in 6"
          :key="n"
          :width="n % 2 ? '6rem' : '4.5rem'"
          height="2rem"
          rounded="rounded-full"
        />
      </div>
    </div>

    <div
      v-for="section in 2"
      :key="section"
      class="rounded-medium bg-black/5 p-3"
    >
      <Skeleton width="6arem" height="1rem" class="mb-2 ml-1" />

      <div class="flex flex-col gap-2">
        <div
          v-for="row in 3"
          :key="row"
          class="flex items-center gap-4 rounded-medium bg-white px-4 py-3"
        >
          <Skeleton width="9rem" height="2rem" />
          <Skeleton width="5rem" height="2rem" />
          <Skeleton width="7rem" height="2rem" />
          <Skeleton width="5rem" height="2rem" />
        </div>
      </div>
    </div>
  </main>

  <div v-else-if="process" class="flex h-full overflow-hidden">
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
          <Button
            icon="EllipsisVertical"
            variant="neutral"
            :disabled="isEncerrado"
            @click="editProcessOpen = true"
          />
          <div class="ml-auto flex items-center gap-3">
            <Button
              icon="UserPlus"
              variant="primary"
              :disabled="isEncerrado"
              @click="addCandidateChoiceOpen = true"
            />
            <Button
              icon="Download"
              color="purple"
              variant="primary"
              @click="chooseWayToDownload = true"
            />
            <Button
              icon="CheckCheck"
              variant="primary"
              color="green"
              :disabled="isEncerrado"
              @click="shareConfirmOpen = true"
            />
            <Button
              icon="ListTodo"
              variant="primary"
              :disabled="isEncerrado"
              @click="openApproved"
            />
          </div>
        </div>

        <OrderableFilterChips
          :options="COLUMN_OPTIONS"
          v-model="activeColumns"
          :pinned="['name']"
          :locked-toggleable="['editGroup', 'document']"
          :max="MAX_VISIBLE_COLUMNS"
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
        :locked="isEncerrado"
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
        :read-only="isEncerrado"
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

    <ConfirmPopup
      v-model="shareConfirmOpen"
      title="Encerrar processo seletivo"
      message="Tem certeza que deseja compartilhar o resultado e encerrar este processo seletivo? Os candidatos aprovados serão notificados por e-mail e essa ação não pode ser desfeita."
      confirm-text="Encerrar"
      danger
      @confirm="confirmShare"
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

    <FiltersPopup
      v-model="filtersOpen"
      title="Colunas visíveis"
      :options="COLUMN_OPTIONS"
      v-model:active="activeColumns"
    />
  </div>
  <main v-else class="flex flex-col gap-6 p-8">
    <p>Peneira não encontrada.</p>
  </main>
</template>
