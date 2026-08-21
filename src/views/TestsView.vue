<script setup lang="ts">

import { ref } from "vue";
import Button  from "../components/ui/Button.vue";
import Input   from "../components/ui/Input.vue";
import Icon    from "../components/ui/Icon.vue";
import Table   from "../components/ui/table/Table.vue";

import { ThemeColor } from "../lib/colors";
import { SocialNetwork, type Candidate, type TableColumn } from "../components/ui/table/types";

const networks = [
  SocialNetwork.LinkedIn,
  SocialNetwork.GitHub,
  SocialNetwork.Instagram,
  SocialNetwork.Facebook,
];

const name = ref("");

const columns: TableColumn[] = [
  { key: "name", label: "Nome", width: "2fr", align: "start" },
  { key: "status", label: "Estado" },
  { key: "phone", label: "Telefone" },
  { key: "network", label: "Network" },
  { key: "seniority", label: "Senioridade" },
];

const candidates: Candidate[] = [
  {
    id: 1,
    name: "Roberta Rocha",
    email: "email@email.com",
    status: "aprovado",
    phone: "(+55) 11 91022-3479",
    networks,
    seniority: "Junior",
  },
  {
    id: 2,
    name: "Roberta Rocha",
    email: "email@email.com",
    status: "aprovado",
    phone: "(+55) 11 91022-3479",
    networks,
    seniority: "Junior",
  },
  {
    id: 3,
    name: "Roberta Rocha",
    email: "email@email.com",
    status: "aprovado",
    phone: "(+55) 11 91022-3479",
    networks,
    seniority: "Junior",
  },
  {
    id: 4,
    name: "Roberta Rocha",
    email: "email@email.com",
    status: "reprovado",
    phone: "(+55) 11 91022-3479",
    networks,
    seniority: "Junior",
  },
  {
    id: 5,
    name: "Roberta Rocha",
    email: "email@email.com",
    status: "reprovado",
    phone: "(+55) 11 91022-3479",
    networks,
    seniority: "Junior",
  },
];

</script>

<template>
  <main class="mx-auto flex max-w-3xl flex-col gap-6 p-8">
    <h1>Componentes UI</h1>

    <section class="flex flex-wrap gap-3">
      <Button text="Padrão" />
      <Button text="Perigo" />
      <Button text="Desabilitado" disabled />
    </section>

    <section class="flex flex-col gap-2">
      <Input v-model="name" placeholder="Digite seu nome" />
      <p class="text-sm text-gray-500">Você digitou: {{ name || "—" }}</p>
    </section>

    <section class="flex flex-wrap items-center gap-4">
      <Icon name="Home" />
      <Icon name="Search" />
      <Icon name="Trash2" :color="ThemeColor.Danger" :size="28" />
    </section>

    <section class="flex flex-col gap-3">
      <h2>Tabela</h2>
      <Table :columns="columns" :items="candidates" />
    </section>
  </main>
</template>
