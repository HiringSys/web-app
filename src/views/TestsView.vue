<script setup lang="ts">

import { ref }   from "vue";
import { Grip }  from "@lucide/vue";
import draggable from "vuedraggable";
import Button      from "../components/ui/Button.vue";
import Input       from "../components/ui/Input.vue";
import FilterChips from "../components/ui/FilterChips.vue";
import Icon      from "../components/ui/Icon.vue";
import Table          from "../components/ui/table/Table.vue";
import SelectionTable from "../components/ui/table/SelectionTable.vue";

import { useDragGhostOpacityFix } from "../lib/dragGhostOpacity";
import { SocialNetwork, Seniority, type Candidate, type SocialLink } from "../components/ui/table/types";
import { candidateColumns } from "../components/ui/table/columns/candidateColumns";

useDragGhostOpacityFix();

interface ListItem {
  id:    number
  label: string
}

const listItems = ref<ListItem[]>([
  { id: 1, label: "Primeiro item" },
  { id: 2, label: "Segundo item" },
  { id: 3, label: "Terceiro item" },
  { id: 4, label: "Quarto item" },
  { id: 5, label: "Quinto item" },
]);

const networks: SocialLink[] = [
  { network: SocialNetwork.LinkedIn, url: "https://linkedin.com" },
  { network: SocialNetwork.GitHub, url: "https://github.com" },
  { network: SocialNetwork.Instagram, url: "https://instagram.com" },
  { network: SocialNetwork.Facebook, url: "https://facebook.com" },
];

const name = ref("");
const activeFilterDemo = ref<string[]>(["a"]);

const columns = candidateColumns();

const selectionItems = ref<Candidate[]>([
  { id: 201, name: "Roberta Rocha", email: "email@email.com", status: "aprovado", phone: "(+55) 11 91022-3479", networks, seniority: Seniority.Senior, experienceYears: 8, role: "Desenvolvedora Frontend", salaryExpectation: 12000 },
  { id: 202, name: "Lucas Almeida", email: "email@email.com", status: "aprovado", phone: "(+55) 11 91022-3479", networks, seniority: Seniority.Pleno, experienceYears: 4, role: "Desenvolvedor Frontend", salaryExpectation: 8000 },
  { id: 203, name: "Marina Souza", email: "email@email.com", status: "reprovado", phone: "(+55) 11 91022-3479", networks, seniority: Seniority.Junior, experienceYears: 1, role: "Desenvolvedora Frontend", salaryExpectation: 4000 },
  { id: 204, name: "Pedro Lima", email: "email@email.com", status: "reprovado", phone: "(+55) 11 91022-3479", networks, seniority: Seniority.Pleno, experienceYears: 3, role: "Desenvolvedor Frontend", salaryExpectation: 6500 },
  { id: 205, name: "Ana Paula", email: "email@email.com", status: "reprovado", phone: "(+55) 11 91022-3479", networks, seniority: Seniority.Junior, experienceYears: 2, role: "Desenvolvedora Frontend", salaryExpectation: 4200 },
]);

const candidates = ref<Candidate[]>([
  {
    id: 1,
    name: "Roberta Rocha",
    email: "email@email.com",
    status: "aprovado",
    phone: "(+55) 11 91022-3479",
    networks,
    seniority: Seniority.Junior,
    experienceYears: 1,
    role: "Desenvolvedora Frontend",
    salaryExpectation: 4000,
  },
  {
    id: 2,
    name: "Roberta Rocha",
    email: "email@email.com",
    status: "aprovado",
    phone: "(+55) 11 91022-3479",
    networks,
    seniority: Seniority.Pleno,
    experienceYears: 4,
    role: "Desenvolvedora Frontend",
    salaryExpectation: 7000,
  },
  {
    id: 3,
    name: "Roberta Rocha",
    email: "email@email.com",
    status: "aprovado",
    phone: "(+55) 11 91022-3479",
    networks,
    seniority: Seniority.Senior,
    experienceYears: 8,
    role: "Desenvolvedora Frontend",
    salaryExpectation: 12000,
  },
  {
    id: 4,
    name: "Roberta Rocha",
    email: "email@email.com",
    status: "reprovado",
    phone: "(+55) 11 91022-3479",
    networks,
    seniority: Seniority.Pleno,
    experienceYears: 3,
    role: "Desenvolvedora Frontend",
    salaryExpectation: 6500,
  },
  {
    id: 5,
    name: "Roberta Rocha",
    email: "email@email.com",
    status: "reprovado",
    phone: "(+55) 11 91022-3479",
    networks,
    seniority: Seniority.Junior,
    experienceYears: 1,
    role: "Desenvolvedora Frontend",
    salaryExpectation: 3800,
  },
]);

</script>

<template>
  <main class="mx-auto flex max-w-6xl flex-col gap-6 p-8">
    <h1>Componentes UI</h1>

    <section class="flex flex-wrap items-center gap-3">
      <Button text="Padrão" />
      <Button text="Perigo" />
      <Button text="Desabilitado" disabled />
      <Button icon="Home" variant="primary" />
      <Button icon="Trash2" variant="neutral" />
    </section>

    <section class="flex flex-col gap-2">
      <Input v-model="name" placeholder="Digite seu nome" />
      <p class="text-sm text-gray-500">Você digitou: {{ name || "—" }}</p>
    </section>

    <section class="flex flex-wrap items-center gap-4">
      <Icon name="Home" />
      <Icon name="Search" />
      <Icon name="Trash2" :size="28" />
    </section>

    <section class="flex flex-col gap-2">
      <h2>Filtros</h2>
      <FilterChips
        :options="[{ key: 'a', label: 'Opção A' }, { key: 'b', label: 'Opção B' }, { key: 'c', label: 'Opção C' }]"
        v-model="activeFilterDemo"
      />
    </section>

    <section class="flex flex-col gap-3">
      <h2>Tabela</h2>
      <Table :columns="columns" v-model:items="candidates" />
    </section>

    <section class="flex flex-col gap-3">
      <h2>Seleção com aprovação (SelectionTable, limite 2)</h2>
      <SelectionTable :columns="columns" :items="selectionItems" :approval-limit="2" @update:items="selectionItems = $event" />
    </section>

    <section class="flex flex-col gap-3">
      <h2>Lista</h2>
      <draggable
        v-model="listItems"
        tag="div"
        item-key="id"
        handle=".drag-handle"
        :animation="150"
        :force-fallback="true"
        class="flex flex-col gap-2"
      >
        <template #item="{ element }">
          <div class="flex items-center gap-3 rounded-medium bg-white px-4 py-3 select-none">
            <span class="drag-handle inline-flex cursor-grab items-center justify-center p-1 [-webkit-user-drag:none]" draggable="false">
              <Grip :size="16" class="pointer-events-none text-black/30" draggable="false" />
            </span>
            <span class="text-small text-black">{{ element.label }}</span>
          </div>
        </template>
      </draggable>
    </section>
  </main>
</template>
