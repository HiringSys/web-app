import { Seniority, SocialNetwork, type Candidate } from '@/components/ui/table/types'
import { ProcessStatus, type SelectiveProcess } from '@/types/peneira'

function toSocialLink(network: SocialNetwork) {
  return { network, url: `https://${network}.com` }
}

const PROCESSES: SelectiveProcess[] = [
  {
    id: 1,
    jobTitle: 'Desenvolvedor frontend',
    department: 'Plataforma de Recebíveis',
    status: ProcessStatus.EmColeta,
    availableSlots: 500,
    participants: 7,
    role: 'Desenvolvedores',
    approvalLimit: 5,
  },
  {
    id: 2,
    jobTitle: 'Desenvolvedor backend',
    department: 'Plataforma de Pagamentos',
    status: ProcessStatus.EmProcesso,
    availableSlots: 300,
    participants: 9,
    role: 'Desenvolvedores',
    approvalLimit: 4,
  },
  {
    id: 3,
    jobTitle: 'Analista de QA',
    department: 'Qualidade',
    status: ProcessStatus.Pausado,
    availableSlots: 150,
    participants: 3,
    role: 'QA',
    approvalLimit: 2,
  },
  {
    id: 4,
    jobTitle: 'Product Designer',
    department: 'Design',
    status: ProcessStatus.Encerrado,
    availableSlots: 200,
    participants: 6,
    role: 'Design',
    approvalLimit: 3,
  },
  {
    id: 5,
    jobTitle: 'Engenheiro de dados',
    department: 'Dados',
    status: ProcessStatus.Rascunho,
    availableSlots: 100,
    participants: 0,
    role: 'Dados',
    approvalLimit: 2,
  },
]

// Only process id 1 ships with a full candidate mock (it's the one used to
// demonstrate the approve/reject drag mechanic end to end, matching the
// design mockup: 5 approved + 2 rejected against an approvalLimit of 5).
// The other processes intentionally return an empty candidate list.
const CANDIDATES_BY_PROCESS: Record<string | number, Candidate[]> = {
  1: [
    { id: 101, name: 'Roberta Rocha', email: 'roberta@email.com', status: 'aprovado', phone: '(+55) 11 91022-3479', networks: [SocialNetwork.LinkedIn, SocialNetwork.GitHub].map(toSocialLink), seniority: Seniority.Junior, experienceYears: 1, role: 'Desenvolvedora Frontend', salaryExpectation: 4200 },
    { id: 102, name: 'Lucas Almeida', email: 'lucas@email.com', status: 'aprovado', phone: '(+55) 11 98765-4321', networks: [SocialNetwork.LinkedIn].map(toSocialLink), seniority: Seniority.Pleno, experienceYears: 4, role: 'Desenvolvedor Frontend', salaryExpectation: 7500 },
    { id: 103, name: 'Marina Souza', email: 'marina@email.com', status: 'aprovado', phone: '(+55) 11 99887-6655', networks: [SocialNetwork.GitHub].map(toSocialLink), seniority: Seniority.Senior, experienceYears: 8, role: 'Desenvolvedora Frontend', salaryExpectation: 13000 },
    { id: 104, name: 'Pedro Lima', email: 'pedro@email.com', status: 'aprovado', phone: '(+55) 11 93344-5566', networks: [SocialNetwork.LinkedIn, SocialNetwork.Instagram].map(toSocialLink), seniority: Seniority.Pleno, experienceYears: 3, role: 'Desenvolvedor Frontend', salaryExpectation: 6800 },
    { id: 105, name: 'Ana Paula', email: 'ana@email.com', status: 'aprovado', phone: '(+55) 11 95566-7788', networks: [SocialNetwork.GitHub, SocialNetwork.LinkedIn].map(toSocialLink), seniority: Seniority.Junior, experienceYears: 2, role: 'Desenvolvedora Frontend', salaryExpectation: 4500 },
    { id: 106, name: 'Bruno Costa', email: 'bruno@email.com', status: 'reprovado', phone: '(+55) 11 92233-4455', networks: [SocialNetwork.LinkedIn].map(toSocialLink), seniority: Seniority.Junior, experienceYears: 1, role: 'Desenvolvedor Frontend', salaryExpectation: 3900 },
    { id: 107, name: 'Carla Nunes', email: 'carla@email.com', status: 'reprovado', phone: '(+55) 11 96677-8899', networks: [SocialNetwork.GitHub].map(toSocialLink), seniority: Seniority.Pleno, experienceYears: 3, role: 'Desenvolvedora Frontend', salaryExpectation: 7000 },
  ],
}

export function listProcesses(): SelectiveProcess[] {
  return PROCESSES
}

export function getProcess(id: string | number): SelectiveProcess | undefined {
  return PROCESSES.find((process) => String(process.id) === String(id))
}

export function getCandidatesForProcess(id: string | number): Candidate[] {
  return CANDIDATES_BY_PROCESS[id] ?? []
}
