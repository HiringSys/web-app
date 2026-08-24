export const ProcessStatus = {
  Encerrado: 'encerrado',
  EmProcesso: 'em_processo',
  Pausado: 'pausado',
  EmColeta: 'em_coleta',
  Rascunho: 'rascunho',
} as const

export type ProcessStatus = (typeof ProcessStatus)[keyof typeof ProcessStatus]

export const PROCESS_STATUS_OPTIONS: { value: ProcessStatus; label: string }[] = [
  { value: ProcessStatus.Rascunho, label: 'Rascunho' },
  { value: ProcessStatus.EmColeta, label: 'Em coleta' },
  { value: ProcessStatus.EmProcesso, label: 'Em processo' },
  { value: ProcessStatus.Pausado, label: 'Pausado' },
  { value: ProcessStatus.Encerrado, label: 'Encerrado' },
]

export interface SelectiveProcess {
  id: string | number
  jobTitle: string
  department: string
  status: ProcessStatus
  availableSlots: number
  participants: number
  role: string
  approvalLimit: number
  teamEmail: string
}
