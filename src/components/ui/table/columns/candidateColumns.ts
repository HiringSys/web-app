import type { TableColumn, Candidate } from '../types'
import { CandidateStatus } from '../types'
import { formatSalary, formatPhoneNumber } from '@/lib/format'

import CandidateField  from '../fields/CandidateField.vue'
import StatusField     from '../fields/StatusField.vue'
import NetworkField    from '../fields/NetworkField.vue'
import ValueField      from '../fields/ValueField.vue'
import PhoneField      from '../fields/PhoneField.vue'
import SeniorityField  from '../fields/SeniorityField.vue'
import AffinityField   from '../fields/AffinityField.vue'

export function candidateColumns(): TableColumn<Candidate>[] {
  return [
    {
      key: 'name',
      label: 'Nome',
      size: 'lg',
      measure: (item) => item.name,
      measureOffset: 48, // avatar (2.5rem) + gap (0.5rem)
      component: CandidateField,
      props: (item) => ({ name: item.name, email: item.email, avatarUrl: item.avatarUrl }),
    },
    {
      key: 'status',
      label: 'Estado',
      size: 'sm',
      fixed: true,
      component: StatusField,
      props: (item) => ({ status: item.blocked ? CandidateStatus.Suprimido : (item.subStatus ?? item.status) }),
    },
    {
      key: 'phone',
      label: 'Telefone',
      size: 'md',
      measure: (item) => formatPhoneNumber(item.phone),
      component: PhoneField,
      props: (item) => ({ value: item.phone }),
    },
    {
      key: 'network',
      label: 'Network',
      size: 'sm',
      component: NetworkField,
      props: (item) => ({ networks: item.networks }),
    },
    {
      key: 'role',
      label: 'Cargo',
      size: 'md',
      measure: (item) => item.role,
      component: ValueField,
      props: (item) => ({ value: item.role }),
    },
    {
      key: 'salaryExpectation',
      label: 'Expectativa salarial',
      size: 'sm',
      measure: (item) => formatSalary(item.salaryExpectation),
      component: ValueField,
      props: (item) => ({ value: formatSalary(item.salaryExpectation) }),
    },
    {
      key: 'seniority',
      label: 'Senioridade',
      size: 'sm',
      fixed: true,
      component: SeniorityField,
      props: (item) => ({ seniority: item.seniority }),
    },
    {
      key: 'jobAffinity',
      label: 'Afinidade com a vaga',
      size: 'sm',
      fixed: true,
      component: AffinityField,
      props: (item) => ({ affinity: item.jobAffinity }),
    },
  ]
}
