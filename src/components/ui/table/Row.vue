<script setup lang="ts">
import { computed } from 'vue'
import { Grip } from '@lucide/vue'
import CandidateField from './fields/CandidateField.vue'
import StatusField from './fields/StatusField.vue'
import PhoneField from './fields/PhoneField.vue'
import NetworkField from './fields/NetworkField.vue'
import SeniorityField from './fields/SeniorityField.vue'
import { gridTemplate } from './grid'
import type { Candidate, TableColumn } from './types'

const props = defineProps<{
  candidate: Candidate
  columns: TableColumn[]
}>()

const style = computed(() => ({ gridTemplateColumns: gridTemplate(props.columns) }))
</script>

<template>
  <div class="grid items-center gap-4 rounded-medium bg-white px-4 py-3 shadow-sm" :style="style">
    <Grip :size="16" class="text-gray-300" />

    <div
      v-for="column in columns"
      :key="column.key"
      class="flex items-center"
      :class="column.align === 'start' ? 'justify-start' : 'justify-center'"
    >
      <CandidateField
        v-if="column.key === 'name'"
        :name="candidate.name"
        :email="candidate.email"
        :avatar-url="candidate.avatarUrl"
      />
      <StatusField v-else-if="column.key === 'status'" :status="candidate.status" />
      <PhoneField v-else-if="column.key === 'phone'" :phone="candidate.phone" />
      <NetworkField v-else-if="column.key === 'network'" :networks="candidate.networks" />
      <SeniorityField v-else-if="column.key === 'seniority'" :seniority="candidate.seniority" />
    </div>
  </div>
</template>
