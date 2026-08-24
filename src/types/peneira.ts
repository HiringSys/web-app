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

export const PROCESS_STATUS_COLORS: Record<ProcessStatus, { bg: string; text: string; shadow: string }> = {
  [ProcessStatus.Encerrado]:  { bg: 'bg-red',    text: 'text-white',    shadow: 'var(--color-red-co)'    },
  [ProcessStatus.EmProcesso]: { bg: 'bg-blue',   text: 'text-white',    shadow: 'var(--color-blue-co)'   },
  [ProcessStatus.Pausado]:    { bg: 'bg-yellow', text: 'text-white',    shadow: 'var(--color-yellow-co)' },
  [ProcessStatus.EmColeta]:   { bg: 'bg-green',  text: 'text-white',    shadow: 'var(--color-green-co)'  },
  [ProcessStatus.Rascunho]:   { bg: 'bg-gray',   text: 'text-black/60', shadow: 'var(--color-gray-co)'   },
}

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
