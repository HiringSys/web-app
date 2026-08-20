import type { SocialNetwork } from './socials'

export type CandidateStatus = 'aprovado' | 'reprovado'

export interface Candidate {
  id: string | number
  name: string
  email: string
  avatarUrl?: string
  status: CandidateStatus
  phone: string
  networks?: SocialNetwork[]
  seniority: string
}

export type TableColumnKey = 'name' | 'status' | 'phone' | 'network' | 'seniority'

export interface TableColumn {
  key: TableColumnKey
  label: string
  width?: string
  align?: 'start' | 'center'
}
