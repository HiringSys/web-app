<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import SelectionTable from "@@/ui/table/SelectionTable.vue";
import Button from "@@/ui/Button.vue";

import OrderableFilterChips from "@@/layout/OrderableFilterChips.vue";
import Sidebar from "@@/layout/sidebar/Sidebar.vue";
import CandidateResumeSidebar from "@@/layout/sidebar/content/CandidateResumeSidebar.vue";
import ApprovedListSidebar from "@@/layout/sidebar/content/ApprovedListSidebar.vue";

import ConfirmPopup from "@@/popup/ConfirmPopup.vue";
import FormPopup, { type FormField } from "@@/popup/FormPopup.vue";
import FiltersPopup from "@@/popup/FiltersPopup.vue";

import ImportCandidatesPopup from "@@/popup/variants/ImportCandidatesPopup.vue";
import AddCandidateChoicePopup from "@@/popup/variants/AddCandidateChoicePopup.vue";
import WayToDownloadPopUp from "@@/popup/variants/WayToDownloadPopUp.vue";

import Skeleton from "@@/feedback/Skeleton.vue";
import { candidateColumns } from "@@/ui/table/columns/candidateColumns";
import { useNavbar } from "@/components/layout/navbar/useNavbar";

import {
  CandidateStatus,
  Seniority,
  SocialNetwork,
  type Candidate,
  type SocialLink,
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
  getCandidateDepartment,
  patchCandidateDepartment,
} from "@/service/Peneiras";
  
import { notify } from "@@/feedback/notify";

import {
  downloadCandidatesAsTxt,
  downloadCandidatesAsCsv,
  downloadCandidatesAsXlsx,
} from "@/lib/exportCandidates";

const route = useRoute();
const router = useRouter();
const processId = route.params.id as string;

const process = ref<SelectiveProcess>();
const candidates = ref<Candidate[]>([]);
const loading = ref(true);
const loadError = ref("");

const { isNavOpen } = useNavbar();

async function loadProcessDetails() {
  loading.value = true;
  loadError.value = "";
  try {
    [process.value, candidates.value] = await Promise.all([
      getProcess(processId),
      getCandidatesForProcess(processId),
    ]);

    if (process.value) process.value.participants = candidates.value.length;
  } catch (error) {
    loadError.value = error instanceof Error
      ? error.message
      : "Não foi possível carregar o processo seletivo.";
  } finally {
    loading.value = false;
  }
}

onMounted(loadProcessDetails);

const isEncerrado = computed(
  () => process.value?.status === ProcessStatus.Encerrado,
);

function returnToProcessesList() {
  router.push({ name: "peneiras" });
}

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
      const resume = await resolveCandidateResumeUrl(candidate.id);
      candidate.curriculumUrl = resume?.url;
      candidate.curriculumFileName = resume?.fileName;
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
  { key: "name", label: "Nome", required: true },
  { key: "email", label: "E-mail", type: "email", required: true },
  { key: "phone", label: "Telefone", type: "tel" },
  { key: "role", label: "Cargo", required: true },
  { key: "department", label: "Departamento" },
  {
    key: "seniority",
    label: "Senioridade",
    type: "select",
    required: true,
    options: [
      { value: Seniority.SemExperiencia, label: "Sem experiência" },
      { value: Seniority.Estagiario, label: "Estagiário" },
      { value: Seniority.Junior, label: "Júnior" },
      { value: Seniority.Pleno, label: "Pleno" },
      { value: Seniority.Senior, label: "Sênior" },
    ],
  },
  { key: "experienceYears", label: "Anos de experiência", type: "number", min: 0, step: 1, required: true },
  { key: "salaryExpectation", label: "Expectativa salarial", type: "number", min: 0, step: "0.01", required: true },
  { key: "linkedinUrl", label: "LinkedIn", placeholder: "URL do perfil" },
  { key: "githubUrl", label: "GitHub", placeholder: "URL do perfil" },
];

function networksFromFormValues(values: Record<string, string>): SocialLink[] {
  const networks: SocialLink[] = [];
  if (values.linkedinUrl?.trim()) {
    networks.push({ network: SocialNetwork.LinkedIn, url: values.linkedinUrl.trim() });
  }
  if (values.githubUrl?.trim()) {
    networks.push({ network: SocialNetwork.GitHub, url: values.githubUrl.trim() });
  }
  return networks;
}

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
    department: candidate.department ?? "",
    seniority: candidate.seniority,
    experienceYears: String(candidate.experienceYears ?? 0),
    salaryExpectation: String(candidate.salaryExpectation),
    linkedinUrl:
      candidate.networks?.find((link) => link.network === SocialNetwork.LinkedIn)
        ?.url ?? "",
    githubUrl:
      candidate.networks?.find((link) => link.network === SocialNetwork.GitHub)
        ?.url ?? "",
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
    department: values.department,
    seniority: values.seniority as Seniority,
    experienceYears: Number(values.experienceYears ?? 0),
    salaryExpectation: Number(values.salaryExpectation),
    networks: networksFromFormValues(values),
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

const DEPARTMENT_FIELDS: FormField[] = [
  { key: "department", label: "Departamento" },
];

const departmentTarget = ref<Candidate | null>(null);
const departmentOpen = computed({
  get: () => !!departmentTarget.value,
  set: (value: boolean) => {
    if (!value) departmentTarget.value = null;
  },
});
const departmentValues = ref<Record<string, string>>({});

async function openDepartmentEditor(candidate: Candidate) {
  let department = candidate.department ?? "";

  try {
    department = await getCandidateDepartment(processId, candidate.id);
  } catch {
    notify("Não foi possível carregar o departamento atual.", "error");
  }

  departmentValues.value = { department };
  departmentTarget.value = candidate;
}

async function submitDepartment(values: Record<string, string>) {
  if (!departmentTarget.value) return;
  const target = departmentTarget.value;
  departmentTarget.value = null;

  try {
    const saved = Object.assign(
      target,
      await patchCandidateDepartment(processId, target.id, values.department),
    );
    candidates.value = candidates.value.map((candidate) =>
      candidate.id === saved.id ? saved : candidate,
    );
  } catch {
    notify("Não foi possível salvar o departamento.", "error");
  }
}

const addCandidateChoiceOpen = ref(false);
const chooseWayToDownload = ref(false);
const newCandidateOpen = ref(false);
const importOpen = ref(false);

const exportFilename = computed(() => {
  const slug = (process.value?.jobTitle ?? "candidatos")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "candidatos";
});

function downloadTxt() {
  downloadCandidatesAsTxt(candidates.value, exportFilename.value);
  chooseWayToDownload.value = false;
}

function downloadCsv() {
  downloadCandidatesAsCsv(candidates.value, exportFilename.value);
  chooseWayToDownload.value = false;
}

async function downloadXlsx() {
  try {
    await downloadCandidatesAsXlsx(candidates.value, exportFilename.value);
  } catch {
    notify("Não foi possível gerar o arquivo XLSX.", "error");
  } finally {
    chooseWayToDownload.value = false;
  }
}

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
      department: values.department,
      seniority: values.seniority as Seniority,
      experienceYears: Number(values.experienceYears ?? 0),
      salaryExpectation: Number(values.salaryExpectation),
      networks: networksFromFormValues(values),
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
  <main v-if="loading" class="flex min-w-0 flex-col gap-6 p-4 sm:p-8">
    <div class="flex flex-col gap-2">
      <div class="flex min-w-0 flex-wrap items-start gap-3">
        <div class="flex min-w-0 flex-1 basis-52 flex-col gap-2">
          <Skeleton width="min(16rem, 100%)" height="2rem" />
          <Skeleton class="mt-2" width="min(10rem, 75%)" height="1.25rem" />
        </div>
        <Skeleton width="2.5rem" height="2.5rem" rounded="rounded-medium" />
        <div class="grid w-full grid-cols-4 items-center gap-2 sm:ml-auto sm:flex sm:w-auto sm:gap-3">
          <Skeleton
            v-for="n in 4"
            :key="n"
            width="2.5rem"
            height="2.5rem"
            rounded="rounded-medium"
          />
        </div>
      </div>

      <div class="flex min-w-0 items-center gap-2 overflow-hidden">
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
      <Skeleton width="6rem" height="1rem" class="mb-2 ml-1" />

      <div class="flex flex-col gap-2">
        <div
          v-for="row in 3"
          :key="row"
          class="grid grid-cols-2 gap-3 rounded-medium bg-white px-4 py-3 sm:flex sm:items-center sm:gap-4"
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
      class="detail-main min-w-0 max-w-[100vw] flex flex-col gap-6 overflow-x-hidden overflow-y-auto p-4 pb-28 transition-[width] duration-300 ease-in-out sm:p-8"
      :class="{ 'sidebar-active': sidebarOpen }"
    >
      <div class="flex flex-col gap-2">
        <div class="flex flex-col items-stretch gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:gap-3">
          <div
          class="flex w-full min-w-0 max-w-full flex-row gap-3 overflow-hidden transition-[padding] duration-300 sm:w-auto sm:flex-1 sm:basis-60"
          :class="!isNavOpen ? 'sm:pl-16' : ''"
          >
            <div class="min-w-0 flex-1 overflow-hidden">
              <h1 class="truncate text-heading leading-none pb-px sm:text-display">{{ process.jobTitle }}</h1>
              <h3 class="truncate">{{ process.department }}</h3>
            </div>
            <Button
              class="h-fit shrink-0"
              icon="EllipsisVertical"
              variant="neutral"
              aria-label="Editar processo seletivo"
              title="Editar processo seletivo"
              :disabled="isEncerrado"
              @click="editProcessOpen = true"
            />
          </div>
          <div class="grid w-full max-w-full shrink-0 grid-cols-4 items-center gap-3 rounded-medium bg-white/55 p-2 pb-3 shadow-soft sm:ml-auto sm:max-w-72" role="toolbar" aria-label="Ações do processo seletivo">
            <Button
              class="w-full min-w-0 px-3"
              icon="UserPlus"
              aria-label="Adicionar candidato"
              title="Adicionar candidato"
              variant="primary"
              :disabled="isEncerrado"
              @click="addCandidateChoiceOpen = true"
            />
            <Button
              class="w-full min-w-0 px-3"
              icon="Download"
              aria-label="Exportar candidatos"
              title="Exportar candidatos"
              color="purple"
              variant="primary"
              @click="chooseWayToDownload = true"
            />
            <Button
              class="w-full min-w-0 px-3"
              icon="CheckCheck"
              aria-label="Encerrar processo seletivo"
              title="Encerrar processo seletivo"
              variant="primary"
              color="green"
              :disabled="isEncerrado"
              @click="shareConfirmOpen = true"
            />
            <Button
              class="w-full min-w-0 px-3"
              icon="ListTodo"
              aria-label="Ver candidatos aprovados"
              title="Ver candidatos aprovados"
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
        @edit-department="openDepartmentEditor"
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

    <WayToDownloadPopUp
      v-model="chooseWayToDownload"
      @txt="downloadTxt"
      @csv="downloadCsv"
      @xlsx="downloadXlsx"
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

    <FormPopup
      v-model="departmentOpen"
      title="Departamento do candidato"
      submit-text="Atualizar"
      :fields="DEPARTMENT_FIELDS"
      :initial-values="departmentValues"
      @submit="submitDepartment"
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
      :pinned="['name']"
      v-model:active="activeColumns"
    />
  </div>
  <main v-else class="w-full h-full items-center-safe justify-center mx-auto flex max-w-md flex-col gap-6 text-center">
    <div class="flex flex-col gap-2">
      <h1 class="leading-none pb-px">{{ loadError ? "Não foi possível carregar" : "Peneira não encontrada" }}</h1>
      <h3 class="leading-none pb-px">{{ loadError || "Esse processo seletivo não existe ou foi removido." }}</h3>
    </div>
    <div class="flex flex-wrap justify-center gap-3">
      <Button v-if="loadError" text="Tentar novamente" icon="RefreshCw" small @click="loadProcessDetails" />
      <Button text="Voltar aos processos" icon="ArrowLeft" color="orange" small @click="returnToProcessesList()" />
    </div>
  </main>
</template>

<style scoped>
.detail-main { width: 100%; }

@media (min-width: 1280px) {
  .detail-main.sidebar-active { width: 60%; }
}
</style>
