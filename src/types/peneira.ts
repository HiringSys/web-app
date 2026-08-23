export const ProcessStatus = {
  Encerrado: 'encerrado',
  EmProcesso: 'em_processo',
  Pausado: 'pausado',
  EmColeta: 'em_coleta',
  Rascunho: 'rascunho',
} as const

export type ProcessStatus = (typeof ProcessStatus)[keyof typeof ProcessStatus]

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
