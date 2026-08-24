import { apiFetch, apiFetchBlob, isMockMode } from "./api";
import { findOrCreateCargoId } from "./Cargos";

import type {
  GrupoResponse,
  GrupoRequest,
  GrupoEstado,
  FuncionarioResponse,
  FuncionarioCreateRequest,
  FuncionarioUpdateRequest,
  FuncionarioPatchRequest,
  FuncionarioStatus,
  FuncionarioExperiencia,
  RedeRequest,
  RedeResponse,
  RedeTipo,
  VinculoGrupoFuncionarioRequest,
  ArquivoFuncionarioResponse,
  ArquivoCategoria,
  StageCandidateResponse,
  StageSelectionRequest,
  FuncionarioImportacaoRequest,
  ImportacaoFuncionariosRequest,
  ImportacaoFuncionariosResponse,
} from "./api/models";

import {
  CandidateStatus,
  Seniority,
  type Candidate,
  type SocialLink,
  type SocialNetwork,
} from "@@/ui/table/types";
import { ProcessStatus, type SelectiveProcess } from "@/types/peneira";
import { getStageMocks, getPersonMocksForStage } from "@mocks/handler";

const NETWORK_TO_REDE_TIPO: Partial<Record<SocialNetwork, RedeTipo>> = {
  linkedin: "LINKEDIN",
  github: "GITHUB",
};

const REDE_TIPO_TO_NETWORK: Partial<Record<RedeTipo, SocialNetwork>> = {
  LINKEDIN: "linkedin",
  GITHUB: "github",
};

function toRedeRequests(networks: SocialLink[] = []): RedeRequest[] {
  return networks
    .map((link) => {
      const tipo = NETWORK_TO_REDE_TIPO[link.network];
      return tipo ? { tipo, url: link.url } : null;
    })
    .filter((rede): rede is RedeRequest => rede !== null);
}

function fromRedeResponses(redes: RedeResponse[] = []): SocialLink[] {
  return redes
    .map((rede) => {
      const network = REDE_TIPO_TO_NETWORK[rede.tipo];
      return network ? { network, url: rede.url } : null;
    })
    .filter((link): link is SocialLink => link !== null);
}

function mapGrupoToProcess(grupo: GrupoResponse): SelectiveProcess {
  return {
    id: grupo.id,
    jobTitle: grupo.nome,
    department: grupo.area,
    status: grupo.estado.toLowerCase() as ProcessStatus,
    availableSlots: grupo.disponiveis,
    participants: grupo.quantidadeParticipantes,
    role: grupo.cargo ?? "",
    approvalLimit: grupo.limiteAprovados ?? grupo.disponiveis,
    teamEmail: grupo.emailEquipe ?? "",
  };
}

function mapProcessToGrupoRequest(
  process: Pick<
    SelectiveProcess,
    | "jobTitle"
    | "department"
    | "status"
    | "availableSlots"
    | "role"
    | "approvalLimit"
    | "teamEmail"
  >,
): GrupoRequest {
  return {
    nome: process.jobTitle,
    area: process.department,
    estado: process.status.toUpperCase() as GrupoEstado,
    disponiveis: process.availableSlots,
    cargo: process.role || undefined,
    limiteAprovados: process.approvalLimit,
    emailEquipe: process.teamEmail || undefined,
  };
}

export async function listProcesses(): Promise<SelectiveProcess[]> {
  try {
    const grupos = await apiFetch<GrupoResponse[]>("/grupos");
    return grupos.map(mapGrupoToProcess);
  } catch {
    if (isMockMode()) return getStageMocks();
    throw new Error("Não foi possível carregar os processos seletivos.");
  }
}

export async function getProcess(
  id: string | number,
): Promise<SelectiveProcess | undefined> {
  try {
    const grupo = await apiFetch<GrupoResponse>(`/grupos/${id}`);
    return mapGrupoToProcess(grupo);
  } catch {
    if (isMockMode()) {
      return getStageMocks().find((process) => String(process.id) === String(id));
    }
    throw new Error("Não foi possível carregar o processo seletivo.");
  }
}

export async function createProcess(
  process: Pick<
    SelectiveProcess,
    | "jobTitle"
    | "department"
    | "status"
    | "availableSlots"
    | "role"
    | "approvalLimit"
    | "teamEmail"
  >,
): Promise<SelectiveProcess> {
  const grupo = await apiFetch<GrupoResponse>("/grupos", {
    method: "POST",
    body: JSON.stringify(mapProcessToGrupoRequest(process)),
  });
  return mapGrupoToProcess(grupo);
}

export async function updateProcess(
  id: string | number,
  process: SelectiveProcess,
): Promise<SelectiveProcess> {
  const grupo = await apiFetch<GrupoResponse>(`/grupos/${id}`, {
    method: "PUT",
    body: JSON.stringify(mapProcessToGrupoRequest(process)),
  });
  return mapGrupoToProcess(grupo);
}

export async function deleteProcess(id: string | number): Promise<void> {
  await apiFetch(`/grupos/${id}`, { method: "DELETE" });
}

function toFuncionarioStatus(
  candidate: Pick<Candidate, "status" | "blocked" | "subStatus">,
): FuncionarioStatus {
  if (candidate.blocked) return "REPROVADO";
  if (candidate.subStatus) {
    return candidate.subStatus.toUpperCase() as FuncionarioStatus;
  }
  return candidate.status.toUpperCase() as FuncionarioStatus;
}

function mapFuncionarioToCandidate(
  funcionario: FuncionarioResponse,
  grupoId: string | number,
  stageStatus?: CandidateStatus,
): Candidate {
  const grupoMembership = funcionario.grupos?.find(
    (grupo) => String(grupo.id) === String(grupoId),
  );

  return {
    id: funcionario.id,
    name: funcionario.nome,
    email: funcionario.email,
    status:
      stageStatus ?? (funcionario.status.toLowerCase() as CandidateStatus),
    phone: funcionario.telefone ?? "",
    networks: fromRedeResponses(funcionario.redes),
    seniority: (
      funcionario.experiencia ?? "SEM_EXPERIENCIA"
    ).toLowerCase() as Seniority,
    experienceYears: funcionario.anosExperiencia ?? 0,
    role: funcionario.cargos?.[0]?.nome ?? "",
    department: funcionario.departamento ?? "",
    salaryExpectation: funcionario.salario ?? 0,
    jobAffinity: grupoMembership?.scoreProximidade ?? 0,
  };
}

async function getStageCandidateStatuses(
  stageId: string | number,
): Promise<Map<number, CandidateStatus>> {
  try {
    const stageCandidates = await apiFetch<StageCandidateResponse[]>(
      `/stages/${stageId}/candidates`,
    );
    return new Map(
      stageCandidates.map((candidate) => [
        candidate.id,
        candidate.status as CandidateStatus,
      ]),
    );
  } catch {
    return new Map();
  }
}

export async function getCandidatesForProcess(
  id: string | number,
): Promise<Candidate[]> {
  try {
    const [funcionarios, stageStatuses] = await Promise.all([
      apiFetch<FuncionarioResponse[]>(`/funcionarios/grupo/${id}`),
      getStageCandidateStatuses(id),
    ]);
    return funcionarios.map((funcionario) =>
      mapFuncionarioToCandidate(
        funcionario,
        id,
        stageStatuses.get(funcionario.id),
      ),
    );
  } catch {
    if (isMockMode()) return getPersonMocksForStage(id);
    throw new Error("Não foi possível carregar os candidatos.");
  }
}

export interface NewCandidateInput {
  name: string;
  email: string;
  phone: string;
  role: string;
  department?: string;
  seniority: Seniority;
  experienceYears: number;
  salaryExpectation: number;
  networks?: SocialLink[];
}

export async function createCandidate(
  grupoId: string | number,
  values: NewCandidateInput,
): Promise<Candidate> {
  const cargoId = await findOrCreateCargoId(values.role);

  const body: FuncionarioCreateRequest = {
    nome: values.name,
    email: values.email,
    telefone: values.phone || undefined,
    salario: values.salaryExpectation,
    departamento: values.department || undefined,
    experiencia: values.seniority.toUpperCase() as FuncionarioExperiencia,
    anosExperiencia: values.experienceYears,
    cargoIds: [cargoId],
    redes: toRedeRequests(values.networks),
  };

  const funcionario = await apiFetch<FuncionarioResponse>("/funcionarios", {
    method: "POST",
    body: JSON.stringify(body),
  });

  await apiFetch(`/grupos/${grupoId}/funcionarios`, {
    method: "POST",
    body: JSON.stringify({
      funcionarioId: funcionario.id,
    } satisfies VinculoGrupoFuncionarioRequest),
  });

  return mapFuncionarioToCandidate(funcionario, grupoId);
}

export async function importFuncionariosFromExcel(
  grupoId: string | number,
  funcionarios: FuncionarioImportacaoRequest[],
): Promise<ImportacaoFuncionariosResponse> {
  return apiFetch<ImportacaoFuncionariosResponse>(
    `/grupos/${grupoId}/funcionarios/importacao`,
    {
      method: "POST",
      body: JSON.stringify({
        funcionarios,
      } satisfies ImportacaoFuncionariosRequest),
    },
  );
}

export async function updateCandidate(
  grupoId: string | number,
  candidate: Candidate,
): Promise<Candidate> {
  const cargoId = await findOrCreateCargoId(candidate.role);

  const body: FuncionarioUpdateRequest = {
    nome: candidate.name,
    email: candidate.email,
    telefone: candidate.phone || undefined,
    salario: candidate.salaryExpectation,
    departamento: candidate.department || undefined,
    status: toFuncionarioStatus(candidate),
    experiencia: candidate.seniority.toUpperCase() as FuncionarioExperiencia,
    anosExperiencia: candidate.experienceYears ?? 0,
    cargoIds: [cargoId],
    redes: toRedeRequests(candidate.networks),
  };

  const funcionario = await apiFetch<FuncionarioResponse>(
    `/funcionarios/${candidate.id}`,
    {
      method: "PUT",
      body: JSON.stringify(body),
    },
  );

  return mapFuncionarioToCandidate(funcionario, grupoId);
}

export async function submitStageSelection(
  stageId: string | number,
  approvedCandidateIds: (string | number)[],
): Promise<void> {
  await apiFetch(`/stages/${stageId}/candidates/selection`, {
    method: "PUT",
    body: JSON.stringify({
      approvedCandidateIds: approvedCandidateIds.map(Number),
    } satisfies StageSelectionRequest),
  });
}

export async function removeCandidateFromProcess(
  grupoId: string | number,
  candidateId: string | number,
): Promise<void> {
  await apiFetch(`/grupos/${grupoId}/funcionarios/${candidateId}`, {
    method: "DELETE",
  });
}

export async function deleteCandidate(id: string | number): Promise<void> {
  await apiFetch(`/funcionarios/${id}`, { method: "DELETE" });
}

export async function getCandidateDepartment(
  grupoId: string | number,
  candidateId: string | number,
): Promise<string> {
  const funcionario = await apiFetch<FuncionarioResponse>(
    `/funcionarios/${candidateId}`,
  );
  return mapFuncionarioToCandidate(funcionario, grupoId).department ?? "";
}

export async function patchCandidateDepartment(
  grupoId: string | number,
  candidateId: string | number,
  department: string,
): Promise<Candidate> {
  const funcionario = await apiFetch<FuncionarioResponse>(
    `/funcionarios/${candidateId}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        departamento: department || undefined,
      } satisfies FuncionarioPatchRequest),
    },
  );
  return mapFuncionarioToCandidate(funcionario, grupoId);
}

export async function listCandidateFiles(
  candidateId: string | number,
): Promise<ArquivoFuncionarioResponse[]> {
  return apiFetch<ArquivoFuncionarioResponse[]>(
    `/funcionarios/${candidateId}/arquivos`,
  );
}

export async function downloadCandidateFile(
  candidateId: string | number,
  arquivoId: string | number,
): Promise<Blob> {
  return apiFetchBlob(
    `/funcionarios/${candidateId}/arquivos/${arquivoId}/download`,
  );
}

export async function uploadCandidateFile(
  candidateId: string | number,
  file: File,
  categoria: ArquivoCategoria = "CURRICULO",
): Promise<ArquivoFuncionarioResponse> {
  const formData = new FormData();
  formData.append("file", file);

  return apiFetch<ArquivoFuncionarioResponse>(
    `/funcionarios/${candidateId}/arquivos?categoria=${categoria}`,
    {
      method: "POST",
      body: formData,
    },
  );
}

export async function deleteCandidateFile(
  candidateId: string | number,
  arquivoId: string | number,
): Promise<void> {
  await apiFetch(`/funcionarios/${candidateId}/arquivos/${arquivoId}`, {
    method: "DELETE",
  });
}

export interface CandidateResumeFile {
  url: string;
  fileName: string;
}

export async function resolveCandidateResumeUrl(
  candidateId: string | number,
): Promise<CandidateResumeFile | undefined> {
  const files = await listCandidateFiles(candidateId);
  const resume = files.find((file) => file.categoria === "CURRICULO");
  if (!resume) return undefined;

  const blob = await downloadCandidateFile(candidateId, resume.id);
  return { url: URL.createObjectURL(blob), fileName: resume.nomeArquivo };
}
