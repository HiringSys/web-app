import type { TableColumn, Candidate } from '../types'

import CandidateField  from '../fields/CandidateField.vue'
import StatusField     from '../fields/StatusField.vue'
import PhoneField      from '../fields/PhoneField.vue'
import NetworkField    from '../fields/NetworkField.vue'
import SeniorityField  from '../fields/SeniorityField.vue'
import ExperienceField from '../fields/ExperienceField.vue'

export function candidateColumns(): TableColumn<Candidate>[] {
  return [
    {
      key: 'name',
      label: 'Nome',
      size: 'lg',
      align: 'start',
      component: CandidateField,
      props: (item) => ({ name: item.name, email: item.email, avatarUrl: item.avatarUrl }),
    },
    {
      key: 'status',
      label: 'Estado',
      size: 'sm',
      component: StatusField,
      props: (item) => ({ status: item.status }),
    },
    {
      key: 'phone',
      label: 'Telefone',
      size: 'md',
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
      key: 'experience',
      label: 'Tempo de experiência',
      size: 'sm',
      component: ExperienceField,
      props: (item) => ({ years: item.experienceYears }),
    },
    {
      key: 'seniority',
      label: 'Senioridade',
      size: 'sm',
      component: SeniorityField,
      props: (item) => ({ seniority: item.seniority }),
    },
  ]
}
