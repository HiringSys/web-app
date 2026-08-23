<script setup lang="ts">

import { ref } from 'vue'
import Table    from '@/components/ui/table/Table.vue'

import { candidateColumns } from '@/components/ui/table/columns/candidateColumns'
import { SocialNetwork, Seniority, type Candidate } from '@/components/ui/table/types'

function toSocialLink(network: SocialNetwork) {
  return { network, url: `https://${network}.com` }
}

const columns = candidateColumns()

const candidates = ref<Candidate[]>([
  {
    id: 1,
    name: "Roberta Rocha",
    email: "roberta@email.com",
    status: "aprovado",
    phone: "(+55) 11 91022-3479",
    networks: [SocialNetwork.LinkedIn, SocialNetwork.GitHub].map(toSocialLink),
    seniority: Seniority.Senior,
    role: "Desenvolvedora Frontend",
    salaryExpectation: 12000,
    jobAffinity: 88,
  },
  {
    id: 2,
    name: "Lucas Almeida",
    email: "lucas@email.com",
    status: "aprovado",
    phone: "(+55) 11 98765-4321",
    networks: [SocialNetwork.LinkedIn, SocialNetwork.Instagram].map(toSocialLink),
    seniority: Seniority.Pleno,
    role: "Desenvolvedor Backend",
    salaryExpectation: 8000,
    jobAffinity: 55,
  },
  {
    id: 3,
    name: "Marina Souza",
    email: "marina@email.com",
    status: "reprovado",
    phone: "(+55) 11 99887-6655",
    networks: [SocialNetwork.GitHub].map(toSocialLink),
    seniority: Seniority.Junior,
    role: "Desenvolvedora Frontend",
    salaryExpectation: 4500,
    jobAffinity: 32,
  },
])

</script>

<template>
  <main class="flex flex-col gap-6 p-8">
    <h1>Candidatos</h1>
    <Table :columns="columns" v-model:items="candidates" />
  </main>
</template>
