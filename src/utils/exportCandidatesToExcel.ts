import type { Column } from 'write-excel-file/browser'

import { CandidateStatus, Seniority, type Candidate } from '@/components/ui/table/types'
import type { SelectiveProcess } from '@/types/peneira'
import { formatPhoneNumber } from '@/lib/format'

const STATUS_LABELS: Record<CandidateStatus, string> = {
  [CandidateStatus.EmAnalise]: 'Em análise',
  [CandidateStatus.Aprovado]: 'Aprovado',
  [CandidateStatus.Reprovado]: 'Reprovado',
  [CandidateStatus.Contratado]: 'Contratado',
  [CandidateStatus.Suprimido]: 'Suprimido',
}

const SENIORITY_LABELS: Record<Seniority, string> = {
  [Seniority.SemExperiencia]: 'Sem experiência',
  [Seniority.Estagiario]: 'Estagiário',
  [Seniority.Junior]: 'Júnior',
  [Seniority.Pleno]: 'Pleno',
  [Seniority.Senior]: 'Sênior',
}

const COLUMNS: Column<Candidate>[] = [
  { header: 'Nome', cell: (candidate) => ({ value: candidate.name, type: String }) },
  { header: 'E-mail', cell: (candidate) => ({ value: candidate.email, type: String }) },
  { header: 'Telefone', cell: (candidate) => ({ value: formatPhoneNumber(candidate.phone), type: String }) },
  { header: 'Cargo', cell: (candidate) => ({ value: candidate.role, type: String }) },
  { header: 'Senioridade', cell: (candidate) => ({ value: SENIORITY_LABELS[candidate.seniority], type: String }) },
  {
    header: 'Status',
    cell: (candidate) => ({
      value: STATUS_LABELS[candidate.blocked ? CandidateStatus.Suprimido : (candidate.subStatus ?? candidate.status)],
      type: String,
    }),
  },
  { header: 'Expectativa salarial (R$)', cell: (candidate) => ({ value: candidate.salaryExpectation, type: Number, format: '#,##0.00' }) },
  {
    header: 'Afinidade com a vaga (%)',
    cell: (candidate) => candidate.jobAffinity === null
      ? { value: 'Em análise', type: String }
      : { value: candidate.jobAffinity, type: Number },
  },
  { header: 'Redes sociais', cell: (candidate) => ({ value: (candidate.networks ?? []).map((network) => network.url).join('; '), type: String }) },
]

/** Strips accents/punctuation so the generated file name is safe across filesystems. */
function slugify(value: string): string {
  return value
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default async function exportCandidatesToExcel(process: SelectiveProcess, candidates: Candidate[]): Promise<void> {
  const { default: writeXlsxFile } = await import('write-excel-file/browser')

  const date     = new Date().toISOString().slice(0, 10)
  const fileName = `${slugify(process.jobTitle) || 'leva'}-${date}.xlsx`

  await writeXlsxFile(candidates, { columns: COLUMNS }).toFile(fileName)
}
