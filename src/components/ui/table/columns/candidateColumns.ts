import type { TableColumn, Candidate } from '../types'
import { formatSalary } from '@/lib/format'

import CandidateField  from '../fields/CandidateField.vue'
import StatusField     from '../fields/StatusField.vue'
import PhoneField      from '../fields/PhoneField.vue'
import NetworkField    from '../fields/NetworkField.vue'
import TextField       from '../fields/TextField.vue'
import SalaryField     from '../fields/SalaryField.vue'
import SeniorityField  from '../fields/SeniorityField.vue'
import ExperienceField from '../fields/ExperienceField.vue'

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
      props: (item) => ({ status: item.status }),
    },
    {
      key: 'phone',
      label: 'Telefone',
      size: 'md',
      measure: (item) => item.phone,
      component: PhoneField,
      props: (item) => ({ phone: item.phone }),
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
      component: TextField,
      props: (item) => ({ value: item.role }),
    },
    {
      key: 'salaryExpectation',
      label: 'Expectativa salarial',
      size: 'sm',
      measure: (item) => formatSalary(item.salaryExpectation),
      component: SalaryField,
      props: (item) => ({ amount: item.salaryExpectation }),
    },
    {
      key: 'experience',
      label: 'Tempo de experiência',
      size: 'sm',
      measure: (item) => `${item.experienceYears} ${item.experienceYears === 1 ? 'ano' : 'anos'}`,
      component: ExperienceField,
      props: (item) => ({ years: item.experienceYears }),
    },
    {
      key: 'seniority',
      label: 'Senioridade',
      size: 'sm',
      fixed: true,
      component: SeniorityField,
      props: (item) => ({ seniority: item.seniority }),
    },
  ]
}
