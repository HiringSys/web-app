<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { ChevronDown } from "@lucide/vue";

import Button from "@@/ui/Button.vue";
import Input from "@@/ui/Input.vue";
import ConfirmPopup from "@@/popup/ConfirmPopup.vue";
import FormPopup, { type FormField } from "@@/popup/FormPopup.vue";
import Popup from "@@/popup/Popup.vue";
import Skeleton from "@@/feedback/Skeleton.vue";
import { notify } from "@@/feedback/notify";
import { formatPhoneNumber, formatSalary } from "@/lib/format";
import {
  createFuncionario,
  deleteFuncionario,
  getFuncionario,
  getFuncionarioIndicadores,
  listFuncionarios,
  patchFuncionario,
  updateFuncionario,
  type FuncionarioFormData,
} from "@/service/Funcionarios";
import type {
  FuncionarioExperiencia,
  FuncionarioIndicadoresResponse,
  FuncionarioPatchRequest,
  FuncionarioResponse,
  FuncionarioStatus,
} from "@/service/api/models";

const STATUS_OPTIONS: { value: FuncionarioStatus; label: string }[] = [
  { value: "EM_ANALISE", label: "Em análise" },
  { value: "APROVADO", label: "Aprovado" },
  { value: "REPROVADO", label: "Reprovado" },
  { value: "CONTRATADO", label: "Contratado" },
];

const EXPERIENCE_OPTIONS: { value: FuncionarioExperiencia; label: string }[] = [
  { value: "SEM_EXPERIENCIA", label: "Sem experiência" },
  { value: "ESTAGIARIO", label: "Estagiário" },
  { value: "JUNIOR", label: "Júnior" },
  { value: "PLENO", label: "Pleno" },
  { value: "SENIOR", label: "Sênior" },
];

const BASE_FIELDS: FormField[] = [
  { key: "nome", label: "Nome", required: true },
  { key: "email", label: "E-mail", type: "email", required: true },
  { key: "telefone", label: "Telefone", type: "tel" },
  { key: "cargo", label: "Cargo", required: true },
  { key: "departamento", label: "Departamento" },
  { key: "cidade", label: "Cidade" },
  {
    key: "salario",
    label: "Salário",
    type: "number",
    min: 0,
    step: "0.01",
    required: true,
  },
  {
    key: "experiencia",
    label: "Experiência",
    type: "select",
    options: EXPERIENCE_OPTIONS,
    required: true,
  },
  {
    key: "anosExperiencia",
    label: "Anos de experiência",
    type: "number",
    min: 0,
    step: 1,
    required: true,
  },
];

const EDIT_FIELDS: FormField[] = [
  ...BASE_FIELDS,
  {
    key: "status",
    label: "Status",
    type: "select",
    options: STATUS_OPTIONS,
    required: true,
  },
];

const PATCH_FIELDS: FormField[] = [
  {
    key: "status",
    label: "Status",
    type: "select",
    options: STATUS_OPTIONS,
    required: true,
  },
  { key: "departamento", label: "Departamento" },
  { key: "salario", label: "Salário", type: "number", min: 0, step: "0.01" },
];

const funcionarios = ref<FuncionarioResponse[]>([]);
const indicadores = ref<FuncionarioIndicadoresResponse>({
  total: 0,
  emAnalise: 0,
  aprovados: 0,
  reprovados: 0,
  contratados: 0,
});
const loading = ref(true);
const searching = ref(false);
const loadError = ref("");
const filters = reactive({ nome: "", cargo: "", status: "" as FuncionarioStatus | "" });

const indicatorCards = computed(() => [
  { label: "Total", value: indicadores.value.total, tone: "neutral" },
  { label: "Em análise", value: indicadores.value.emAnalise, tone: "blue" },
  { label: "Aprovados", value: indicadores.value.aprovados, tone: "green" },
  { label: "Reprovados", value: indicadores.value.reprovados, tone: "red" },
  { label: "Contratados", value: indicadores.value.contratados, tone: "purple" },
]);

async function refreshIndicators() {
  indicadores.value = await getFuncionarioIndicadores();
}

async function search() {
  searching.value = true;
  loadError.value = "";
  try {
    funcionarios.value = await listFuncionarios(filters);
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : "Não foi possível carregar os funcionários.";
  } finally {
    searching.value = false;
  }
}

async function load() {
  loading.value = true;
  loadError.value = "";
  try {
    const [items, totals] = await Promise.all([
      listFuncionarios(),
      getFuncionarioIndicadores(),
    ]);
    funcionarios.value = items;
    indicadores.value = totals;
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : "Não foi possível carregar os funcionários.";
  } finally {
    loading.value = false;
  }
}

onMounted(load);

function clearFilters() {
  filters.nome = "";
  filters.cargo = "";
  filters.status = "";
  void search();
}

const newOpen = ref(false);
const editTarget = ref<FuncionarioResponse>();
const patchTarget = ref<FuncionarioResponse>();
const deleteTarget = ref<FuncionarioResponse>();
const details = ref<FuncionarioResponse>();
const detailsOpen = ref(false);

const editOpen = computed({
  get: () => Boolean(editTarget.value),
  set: (open: boolean) => {
    if (!open) editTarget.value = undefined;
  },
});
const patchOpen = computed({
  get: () => Boolean(patchTarget.value),
  set: (open: boolean) => {
    if (!open) patchTarget.value = undefined;
  },
});
const deleteOpen = computed({
  get: () => Boolean(deleteTarget.value),
  set: (open: boolean) => {
    if (!open) deleteTarget.value = undefined;
  },
});

const newInitialValues = {
  salario: "0",
  experiencia: "SEM_EXPERIENCIA",
  anosExperiencia: "0",
};

function valuesFor(item?: FuncionarioResponse): Record<string, string> {
  if (!item) return {};
  return {
    nome: item.nome,
    email: item.email,
    telefone: item.telefone ?? "",
    cargo: item.cargos?.[0]?.nome ?? "",
    departamento: item.departamento ?? "",
    cidade: item.cidade ?? "",
    salario: String(item.salario ?? 0),
    experiencia: item.experiencia ?? "SEM_EXPERIENCIA",
    anosExperiencia: String(item.anosExperiencia ?? 0),
    status: item.status,
  };
}

function formData(values: Record<string, string>): FuncionarioFormData {
  return {
    nome: values.nome,
    email: values.email,
    telefone: values.telefone ?? "",
    cargo: values.cargo,
    departamento: values.departamento ?? "",
    cidade: values.cidade ?? "",
    salario: Number(values.salario),
    experiencia: values.experiencia as FuncionarioExperiencia,
    anosExperiencia: Number(values.anosExperiencia),
    status: values.status as FuncionarioStatus | undefined,
  };
}

async function submitNew(values: Record<string, string>) {
  try {
    const created = await createFuncionario(formData(values));
    funcionarios.value = [created, ...funcionarios.value];
    newOpen.value = false;
    await refreshIndicators();
    notify("Funcionário cadastrado com sucesso.", "success");
  } catch (error) {
    notify(error instanceof Error ? error.message : "Não foi possível cadastrar o funcionário.", "error");
  }
}

async function submitEdit(values: Record<string, string>) {
  const current = editTarget.value;
  if (!current) return;
  try {
    const updated = await updateFuncionario(current, formData(values));
    funcionarios.value = funcionarios.value.map((item) => item.id === updated.id ? updated : item);
    editTarget.value = undefined;
    await refreshIndicators();
    notify("Cadastro atualizado por completo.", "success");
  } catch (error) {
    notify(error instanceof Error ? error.message : "Não foi possível atualizar o funcionário.", "error");
  }
}

async function submitPatch(values: Record<string, string>) {
  const current = patchTarget.value;
  if (!current) return;

  const changes: FuncionarioPatchRequest = {};
  if (values.status !== current.status) changes.status = values.status as FuncionarioStatus;
  if ((values.departamento ?? "") !== (current.departamento ?? "")) {
    changes.departamento = values.departamento;
  }
  if (Number(values.salario || 0) !== Number(current.salario ?? 0)) {
    changes.salario = Number(values.salario || 0);
  }
  if (!Object.keys(changes).length) {
    notify("Nenhuma alteração foi informada.", "info");
    return;
  }

  try {
    const updated = await patchFuncionario(current.id, changes);
    funcionarios.value = funcionarios.value.map((item) => item.id === updated.id ? updated : item);
    patchTarget.value = undefined;
    await refreshIndicators();
    notify("Atualização parcial concluída.", "success");
  } catch (error) {
    notify(error instanceof Error ? error.message : "Não foi possível realizar a atualização parcial.", "error");
  }
}

async function showDetails(item: FuncionarioResponse) {
  try {
    details.value = await getFuncionario(item.id);
    detailsOpen.value = true;
  } catch (error) {
    notify(error instanceof Error ? error.message : "Não foi possível consultar o funcionário.", "error");
  }
}

async function confirmDelete() {
  const current = deleteTarget.value;
  if (!current) return;
  try {
    await deleteFuncionario(current.id);
    funcionarios.value = funcionarios.value.filter((item) => item.id !== current.id);
    deleteTarget.value = undefined;
    await refreshIndicators();
    notify("Funcionário excluído.", "success");
  } catch (error) {
    notify(error instanceof Error ? error.message : "Não foi possível excluir o funcionário.", "error");
  }
}

function statusLabel(status: FuncionarioStatus) {
  return STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;
}

function experienceLabel(experience?: FuncionarioExperiencia) {
  return EXPERIENCE_OPTIONS.find((option) => option.value === experience)?.label ?? "Não informada";
}
</script>

<template>
  <main class="min-h-full p-4 pb-28 sm:p-6 lg:p-8">
    <div class="mx-auto flex w-full max-w-[90rem] flex-col gap-6">
      <header class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p class="mb-1 text-small font-semibold uppercase tracking-[0.16em] text-blue-co">Gestão de pessoas</p>
          <h1>Funcionários</h1>
          <p class="mt-1 text-black/55">Cadastre, consulte e acompanhe candidatos em um só lugar.</p>
        </div>
        <Button text="Novo funcionário" icon="UserPlus" aria-label="Cadastrar novo funcionário" @click="newOpen = true" />
      </header>

      <section aria-label="Indicadores de funcionários" class="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <article
          v-for="card in indicatorCards"
          :key="card.label"
          class="indicator-card rounded-medium bg-white p-4 shadow-soft"
          :data-tone="card.tone"
        >
          <p class="text-small font-semibold text-black/50">{{ card.label }}</p>
          <strong class="mt-1 block text-[1.75rem] leading-none text-black">{{ card.value }}</strong>
        </article>
      </section>

      <form class="grid gap-3 rounded-medium bg-white p-4 shadow-soft md:grid-cols-[1fr_1fr_13rem_auto]" @submit.prevent="search">
        <label class="flex flex-col gap-1.5">
          <span class="text-small font-semibold text-black/55">Nome</span>
          <Input v-model="filters.nome" class="bg-gray" placeholder="Buscar por nome" />
        </label>
        <label class="flex flex-col gap-1.5">
          <span class="text-small font-semibold text-black/55">Cargo</span>
          <Input v-model="filters.cargo" class="bg-gray" placeholder="Buscar por cargo" />
        </label>
        <label class="flex flex-col gap-1.5">
          <span class="text-small font-semibold text-black/55">Status</span>
          <div class="group relative">
            <select
              v-model="filters.status"
              class="h-[2.75rem] w-full cursor-pointer appearance-none rounded-medium bg-gray pl-4 pr-12 font-medium text-black transition-colors hover:bg-gray-co/45 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue/70"
              aria-label="Filtrar por status"
            >
              <option value="">Todos</option>
              <option v-for="option in STATUS_OPTIONS" :key="option.value" :value="option.value">{{ option.label }}</option>
            </select>
            <span
              class="pointer-events-none absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-medium border-l border-black/[0.06] text-black/45 transition-colors group-hover:text-black/70"
              aria-hidden="true"
            >
              <ChevronDown :size="18" :stroke-width="2.4" />
            </span>
          </div>
        </label>
        <div class="flex items-end gap-2">
          <Button text="Buscar" icon="Search" type="submit" :disabled="searching" />
          <Button icon="RotateCcw" variant="neutral" aria-label="Limpar filtros" @click="clearFilters" />
        </div>
      </form>

      <div v-if="loading" class="flex flex-col gap-3" aria-label="Carregando funcionários">
        <Skeleton v-for="item in 5" :key="item" height="4.5rem" rounded="rounded-medium" />
      </div>

      <section v-else-if="loadError" class="flex flex-col items-center gap-4 rounded-medium bg-white px-6 py-12 text-center shadow-soft">
        <div class="rounded-full bg-red/10 p-4 text-red-co"><span class="text-2xl">!</span></div>
        <div>
          <h2>Não foi possível carregar os dados</h2>
          <p class="mt-1 text-black/55">{{ loadError }}</p>
        </div>
        <Button text="Tentar novamente" icon="RefreshCw" @click="load" />
      </section>

      <section v-else-if="!funcionarios.length" class="rounded-medium bg-white px-6 py-14 text-center shadow-soft">
        <h2>Nenhum funcionário encontrado</h2>
        <p class="mt-2 text-black/50">Ajuste os filtros ou cadastre o primeiro candidato.</p>
      </section>

      <section v-else aria-label="Lista de funcionários" class="overflow-hidden rounded-medium bg-white shadow-soft">
        <div class="flex items-center justify-between border-b border-black/5 px-5 py-4">
          <h2 class="text-subheading">Resultados</h2>
          <span class="rounded-full bg-gray px-3 py-1 text-small font-semibold text-black/55">{{ funcionarios.length }} exibidos</span>
        </div>

        <div class="hidden overflow-x-auto lg:block">
          <table class="w-full border-collapse text-left">
            <thead class="bg-black/[0.025] text-small text-black/50">
              <tr>
                <th class="px-5 py-3 font-semibold">Candidato</th>
                <th class="px-4 py-3 font-semibold">Cargo e departamento</th>
                <th class="px-4 py-3 font-semibold">Cidade</th>
                <th class="px-4 py-3 font-semibold">Salário</th>
                <th class="px-4 py-3 font-semibold">Status</th>
                <th class="px-5 py-3 text-right font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in funcionarios" :key="item.id" class="border-t border-black/5 transition-colors hover:bg-blue/[0.025]">
                <td class="px-5 py-4">
                  <p class="font-semibold text-black">{{ item.nome }}</p>
                  <p class="text-small text-black/45">#{{ item.id }} · {{ item.email }}</p>
                </td>
                <td class="px-4 py-4">
                  <p class="font-medium">{{ item.cargos?.[0]?.nome ?? "—" }}</p>
                  <p class="text-small text-black/45">{{ item.departamento || "Sem departamento" }}</p>
                </td>
                <td class="px-4 py-4 text-black/65">{{ item.cidade || "—" }}</td>
                <td class="px-4 py-4 text-black/65">{{ formatSalary(item.salario ?? 0) }}</td>
                <td class="px-4 py-4"><span class="status-badge" :data-status="item.status">{{ statusLabel(item.status) }}</span></td>
                <td class="px-5 py-4">
                  <div class="flex justify-end gap-2">
                    <Button icon="Eye" small variant="neutral" aria-label="Consultar funcionário" @click="showDetails(item)" />
                    <Button icon="Gauge" small color="orange" aria-label="Atualização parcial" @click="patchTarget = item" />
                    <Button icon="Pencil" small aria-label="Editar funcionário" @click="editTarget = item" />
                    <Button icon="Trash2" small color="red" aria-label="Excluir funcionário" @click="deleteTarget = item" />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="grid gap-3 p-3 sm:grid-cols-2 lg:hidden">
          <article v-for="item in funcionarios" :key="item.id" class="rounded-medium border border-black/5 bg-gray/45 p-4">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="truncate font-semibold">{{ item.nome }}</p>
                <p class="truncate text-small text-black/45">{{ item.email }}</p>
              </div>
              <span class="status-badge shrink-0" :data-status="item.status">{{ statusLabel(item.status) }}</span>
            </div>
            <dl class="mt-4 grid grid-cols-2 gap-3 text-small">
              <div><dt class="text-black/40">Cargo</dt><dd class="font-medium">{{ item.cargos?.[0]?.nome ?? "—" }}</dd></div>
              <div><dt class="text-black/40">Departamento</dt><dd class="font-medium">{{ item.departamento || "—" }}</dd></div>
            </dl>
            <div class="mt-4 flex flex-wrap gap-2">
              <Button text="Consultar" icon="Eye" small variant="neutral" @click="showDetails(item)" />
              <Button text="Editar" icon="Pencil" small @click="editTarget = item" />
              <Button icon="Gauge" small color="orange" aria-label="Atualização parcial" @click="patchTarget = item" />
              <Button icon="Trash2" small color="red" aria-label="Excluir funcionário" @click="deleteTarget = item" />
            </div>
          </article>
        </div>
      </section>
    </div>

    <FormPopup v-model="newOpen" title="Cadastrar funcionário" submit-text="Cadastrar" :fields="BASE_FIELDS" :initial-values="newInitialValues" :close-on-submit="false" @submit="submitNew" />
    <FormPopup v-model="editOpen" title="Editar funcionário (PUT)" :fields="EDIT_FIELDS" :initial-values="valuesFor(editTarget)" :close-on-submit="false" @submit="submitEdit" />
    <FormPopup v-model="patchOpen" title="Atualização parcial (PATCH)" submit-text="Atualizar" :fields="PATCH_FIELDS" :initial-values="valuesFor(patchTarget)" :close-on-submit="false" @submit="submitPatch" />

    <ConfirmPopup
      v-model="deleteOpen"
      title="Excluir funcionário"
      :message="`Tem certeza que deseja excluir ${deleteTarget?.nome}? O cadastro e seus vínculos serão removidos.`"
      confirm-text="Excluir"
      danger
      @confirm="confirmDelete"
    />

    <Popup v-model="detailsOpen" title="Dados do funcionário" width="38rem">
      <dl v-if="details" class="details-grid">
        <div><dt>ID</dt><dd>#{{ details.id }}</dd></div>
        <div><dt>Status</dt><dd><span class="status-badge" :data-status="details.status">{{ statusLabel(details.status) }}</span></dd></div>
        <div class="sm:col-span-2"><dt>Nome</dt><dd>{{ details.nome }}</dd></div>
        <div><dt>E-mail</dt><dd>{{ details.email }}</dd></div>
        <div><dt>Telefone</dt><dd>{{ details.telefone ? formatPhoneNumber(details.telefone) : "—" }}</dd></div>
        <div><dt>Cargo</dt><dd>{{ details.cargos?.map((cargo) => cargo.nome).join(", ") || "—" }}</dd></div>
        <div><dt>Departamento</dt><dd>{{ details.departamento || "—" }}</dd></div>
        <div><dt>Cidade</dt><dd>{{ details.cidade || "—" }}</dd></div>
        <div><dt>Salário</dt><dd>{{ formatSalary(details.salario ?? 0) }}</dd></div>
        <div><dt>Experiência</dt><dd>{{ experienceLabel(details.experiencia) }}</dd></div>
        <div><dt>Anos de experiência</dt><dd>{{ details.anosExperiencia ?? 0 }}</dd></div>
      </dl>
    </Popup>
  </main>
</template>

<style scoped>
.indicator-card { border-top: 3px solid var(--color-gray-co); }
.indicator-card[data-tone="blue"] { border-color: var(--color-blue); }
.indicator-card[data-tone="green"] { border-color: var(--color-green); }
.indicator-card[data-tone="red"] { border-color: var(--color-red); }
.indicator-card[data-tone="purple"] { border-color: var(--color-purple); }

.status-badge {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0.3rem 0.65rem;
  font-size: 0.75rem;
  font-weight: 700;
  white-space: nowrap;
  background: color-mix(in srgb, var(--color-blue) 16%, white);
  color: var(--color-blue-co);
}
.status-badge[data-status="APROVADO"] { background: color-mix(in srgb, var(--color-green) 18%, white); color: var(--color-green-co); }
.status-badge[data-status="REPROVADO"] { background: color-mix(in srgb, var(--color-red) 16%, white); color: var(--color-red-co); }
.status-badge[data-status="CONTRATADO"] { background: color-mix(in srgb, var(--color-purple) 16%, white); color: var(--color-purple-co); }

.details-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; padding-bottom: 1.5rem; }
.details-grid > div { border-radius: var(--radius-medium); background: white; padding: 0.9rem 1rem; min-width: 0; }
.details-grid dt { margin-bottom: 0.25rem; color: rgb(25 25 25 / 0.45); font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
.details-grid dd { overflow-wrap: anywhere; font-weight: 600; color: var(--color-black); }

@media (max-width: 639px) {
  .details-grid { grid-template-columns: 1fr; }
}
</style>
