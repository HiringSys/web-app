import { apiFetch, apiFetchBlob } from "./api";
import type {
  GrupoResponse, GrupoRequest, GrupoEstado,
  FuncionarioResponse, FuncionarioCreateRequest, FuncionarioUpdateRequest, FuncionarioStatus, FuncionarioExperiencia,
  CargoResponse,
  RedeRequest, RedeResponse, RedeTipo,
  VinculoGrupoFuncionarioRequest,
  AtualizarStatusRequest,
  ArquivoFuncionarioResponse, ArquivoCategoria,
  FuncionarioImportacaoRequest, ImportacaoFuncionariosRequest, ImportacaoFuncionariosResponse,
} from "./api/models";

import { CandidateStatus, Seniority, type Candidate, type SocialLink, type SocialNetwork } from "@/components/ui/table/types";
import { ProcessStatus, type SelectiveProcess } from "@/types/peneira";
import { getStageMocks, getPersonMocksForStage } from "@mocks/handler";

// --- Rede (social link) <-> SocialNetwork -----------------------------------
// The API only knows 4 network types; the frontend supports more (for
// display of hand-entered links). Only the overlapping ones round-trip.
// See .sdd/swagger/api.md.

const NETWORK_TO_REDE_TIPO: Partial<Record<SocialNetwork, RedeTipo>> = {
  linkedin: "LINKEDIN",
  github:   "GITHUB",
};

const REDE_TIPO_TO_NETWORK: Partial<Record<RedeTipo, SocialNetwork>> = {
  LINKEDIN: "linkedin",
  GITHUB:   "github",
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

// --- Cargo --------------------------------------------------------------

/** Finds a cargo by exact name, creating it if it doesn't exist yet. */
export async function findOrCreateCargoId(nome: string): Promise<number | undefined> {
  const trimmed = nome.trim();
  if (!trimmed) return undefined;

  const matches = await apiFetch<CargoResponse[]>(`/cargos/buscar?nome=${encodeURIComponent(trimmed)}`);
  const exact = matches.find((cargo) => cargo.nome.toLowerCase() === trimmed.toLowerCase());
  if (exact) return exact.id;

  const created = await apiFetch<CargoResponse>("/cargos", {
    method: "POST",
    body: JSON.stringify({ nome: trimmed }),
  });
  return created.id;
}

// --- Grupo <-> SelectiveProcess ------------------------------------------

function mapGrupoToProcess(grupo: GrupoResponse): SelectiveProcess {
  return {
    id:             grupo.id,
    jobTitle:       grupo.nome,
    department:     grupo.area,
    status:         grupo.estado.toLowerCase() as ProcessStatus,
    availableSlots: grupo.disponiveis,
    // The API doesn't expose a headcount on Grupo; see .sdd/swagger/api.md.
    participants:   0,
    role:           grupo.cargo ?? "",
    // Seeded from disponiveis when the group predates limiteAprovados.
    approvalLimit:  grupo.limiteAprovados ?? grupo.disponiveis,
    teamEmail:      grupo.emailEquipe ?? "",
  };
}

function mapProcessToGrupoRequest(process: Pick<SelectiveProcess, "jobTitle" | "department" | "status" | "availableSlots" | "role" | "approvalLimit" | "teamEmail">): GrupoRequest {
  return {
    nome:            process.jobTitle,
    area:            process.department,
    estado:          process.status.toUpperCase() as GrupoEstado,
    disponiveis:     process.availableSlots,
    cargo:           process.role || undefined,
    limiteAprovados: process.approvalLimit,
    emailEquipe:     process.teamEmail || undefined,
  };
}

export async function listProcesses(): Promise<SelectiveProcess[]> {
  try {
    const grupos = await apiFetch<GrupoResponse[]>("/grupos");
    return grupos.map(mapGrupoToProcess);
  } catch {
    return getStageMocks();
  }
}

export async function getProcess(id: string | number): Promise<SelectiveProcess | undefined> {
  try {
    const grupo = await apiFetch<GrupoResponse>(`/grupos/${id}`);
    return mapGrupoToProcess(grupo);
  } catch {
    return getStageMocks().find((process) => String(process.id) === String(id));
  }
}

export async function createProcess(process: Pick<SelectiveProcess, "jobTitle" | "department" | "status" | "availableSlots" | "role" | "approvalLimit" | "teamEmail">): Promise<SelectiveProcess> {
  const grupo = await apiFetch<GrupoResponse>("/grupos", {
    method: "POST",
    body: JSON.stringify(mapProcessToGrupoRequest(process)),
  });
  return mapGrupoToProcess(grupo);
}

export async function updateProcess(id: string | number, process: SelectiveProcess): Promise<SelectiveProcess> {
  const grupo = await apiFetch<GrupoResponse>(`/grupos/${id}`, {
    method: "PUT",
    body: JSON.stringify(mapProcessToGrupoRequest(process)),
  });
  return mapGrupoToProcess(grupo);
}

export async function deleteProcess(id: string | number): Promise<void> {
  await apiFetch(`/grupos/${id}`, { method: "DELETE" });
}

// --- Funcionario <-> Candidate --------------------------------------------

/** Suprimido (the `blocked` override) has no backend status — sent as Reprovado whenever the candidate reaches the API. */
function toFuncionarioStatus(candidate: Pick<Candidate, "status" | "blocked">): FuncionarioStatus {
  return candidate.blocked ? "REPROVADO" : (candidate.status.toUpperCase() as FuncionarioStatus);
}

/**
 * `Funcionario.status` is global to the employee record, not scoped to a
 * selective process — it drifts from what a given peneira actually decided.
 * `stageStatus`, read separately from `/stages/{id}/candidates`, is the
 * status that's actually specific to this stage; it wins when present.
 */
function mapFuncionarioToCandidate(
  funcionario: FuncionarioResponse,
  grupoId: string | number,
  stageStatus?: CandidateStatus,
): Candidate {
  const grupoMembership = funcionario.grupos?.find((grupo) => String(grupo.id) === String(grupoId));

  return {
    id:                funcionario.id,
    name:              funcionario.nome,
    email:             funcionario.email,
    status:            stageStatus ?? (funcionario.status.toLowerCase() as CandidateStatus),
    phone:             funcionario.telefone ?? "",
    networks:          fromRedeResponses(funcionario.redes),
    seniority:         (funcionario.experiencia ?? "SEM_EXPERIENCIA").toLowerCase() as Seniority,
    role:              funcionario.cargos?.[0]?.nome ?? "",
    salaryExpectation: funcionario.salario ?? 0,
    jobAffinity:       grupoMembership?.scoreProximidade ?? 0,
  };
}

/** Falls back to an empty map (letting callers keep `Funcionario.status`) if the newer Stages API is unreachable. */
async function getStageCandidateStatuses(stageId: string | number): Promise<Map<number, CandidateStatus>> {
  try {
    const stageCandidates = await apiFetch<StageCandidateResponse[]>(`/stages/${stageId}/candidates`);
    return new Map(stageCandidates.map((candidate) => [candidate.id, candidate.status as CandidateStatus]));
  } catch {
    return new Map();
  }
}

export async function getCandidatesForProcess(id: string | number): Promise<Candidate[]> {
  try {
    const [funcionarios, stageStatuses] = await Promise.all([
      apiFetch<FuncionarioResponse[]>(`/funcionarios/grupo/${id}`),
      getStageCandidateStatuses(id),
    ]);
    return funcionarios.map((funcionario) => mapFuncionarioToCandidate(funcionario, id, stageStatuses.get(funcionario.id)));
  } catch {
    return getPersonMocksForStage(id);
  }
}

export interface NewCandidateInput {
  name:  string;
  email: string;
  phone: string;
  role:  string;
  seniority: Seniority;
  salaryExpectation: number;
}

/** Creates the funcionario, then links them to the process's grupo. */
export async function createCandidate(grupoId: string | number, values: NewCandidateInput): Promise<Candidate> {
  const cargoId = await findOrCreateCargoId(values.role);

  const body: FuncionarioCreateRequest = {
    nome:  values.name,
    email: values.email,
    telefone:    values.phone || undefined,
    salario:     values.salaryExpectation,
    experiencia: values.seniority.toUpperCase() as FuncionarioExperiencia,
    cargoIds:    cargoId !== undefined ? [cargoId] : undefined,
  };

  const funcionario = await apiFetch<FuncionarioResponse>("/funcionarios", {
    method: "POST",
    body: JSON.stringify(body),
  });

  await apiFetch(`/grupos/${grupoId}/funcionarios`, {
    method: "POST",
    body: JSON.stringify({ funcionarioId: funcionario.id } satisfies VinculoGrupoFuncionarioRequest),
  });

  return mapFuncionarioToCandidate(funcionario, grupoId);
}

/** Bulk-imports pre-parsed rows (see `parseFuncionariosSheet`) into the group in a single request. */
export async function importFuncionariosFromExcel(grupoId: string | number, funcionarios: FuncionarioImportacaoRequest[]): Promise<ImportacaoFuncionariosResponse> {
  return apiFetch<ImportacaoFuncionariosResponse>(`/grupos/${grupoId}/funcionarios/importacao`, {
    method: "POST",
    body: JSON.stringify({ funcionarios } satisfies ImportacaoFuncionariosRequest),
  });
}

/** Full update (PUT) — the API requires status/experiencia/cargoIds/redes on every call, so the whole candidate is round-tripped. */
export async function updateCandidate(grupoId: string | number, candidate: Candidate): Promise<Candidate> {
  const cargoId = await findOrCreateCargoId(candidate.role);

  const body: FuncionarioUpdateRequest = {
    nome:  candidate.name,
    email: candidate.email,
    telefone:    candidate.phone || undefined,
    salario:     candidate.salaryExpectation,
    status:      toFuncionarioStatus(candidate),
    experiencia: candidate.seniority.toUpperCase() as FuncionarioExperiencia,
    cargoIds:    cargoId !== undefined ? [cargoId] : [],
    redes:       toRedeRequests(candidate.networks),
  };

  const funcionario = await apiFetch<FuncionarioResponse>(`/funcionarios/${candidate.id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });

  return mapFuncionarioToCandidate(funcionario, grupoId);
}

export async function updateCandidateStatus(id: string | number, status: CandidateStatus): Promise<void> {
  await apiFetch(`/funcionarios/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status: status.toUpperCase() as FuncionarioStatus } satisfies AtualizarStatusRequest),
  });
}

/** Unlinks the candidate from this process only — the funcionario record itself (and any other group membership) is untouched. */
export async function removeCandidateFromProcess(grupoId: string | number, candidateId: string | number): Promise<void> {
  await apiFetch(`/grupos/${grupoId}/funcionarios/${candidateId}`, { method: "DELETE" });
}

/** Hard-deletes the funcionario record everywhere, not just from one process. */
export async function deleteCandidate(id: string | number): Promise<void> {
  await apiFetch(`/funcionarios/${id}`, { method: "DELETE" });
}

// --- Arquivos (candidate files) -------------------------------------------
// Implemented for completeness; only résumé preview/download is wired into
// the UI today (no upload UI exists yet — see .sdd/swagger/api.md).

export async function listCandidateFiles(candidateId: string | number): Promise<ArquivoFuncionarioResponse[]> {
  return apiFetch<ArquivoFuncionarioResponse[]>(`/funcionarios/${candidateId}/arquivos`);
}

export async function downloadCandidateFile(candidateId: string | number, arquivoId: string | number): Promise<Blob> {
  return apiFetchBlob(`/funcionarios/${candidateId}/arquivos/${arquivoId}/download`);
}

export async function uploadCandidateFile(candidateId: string | number, file: File, categoria: ArquivoCategoria = "CURRICULO"): Promise<ArquivoFuncionarioResponse> {
  const formData = new FormData();
  formData.append("file", file);

  return apiFetch<ArquivoFuncionarioResponse>(`/funcionarios/${candidateId}/arquivos?categoria=${categoria}`, {
    method: "POST",
    body: formData,
  });
}

export async function deleteCandidateFile(candidateId: string | number, arquivoId: string | number): Promise<void> {
  await apiFetch(`/funcionarios/${candidateId}/arquivos/${arquivoId}`, { method: "DELETE" });
}

/** Resolves an object URL for the candidate's first CURRICULO file, for the resume sidebar. Caller owns revoking it. */
export async function resolveCandidateResumeUrl(candidateId: string | number): Promise<string | undefined> {
  const files = await listCandidateFiles(candidateId);
  const resume = files.find((file) => file.categoria === "CURRICULO");
  if (!resume) return undefined;

  const blob = await downloadCandidateFile(candidateId, resume.id);
  return URL.createObjectURL(blob);
}
