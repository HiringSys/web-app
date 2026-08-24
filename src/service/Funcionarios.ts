import { apiFetch, isMockMode } from "./api";
import { findOrCreateCargoId } from "./Cargos";
import type {
  FuncionarioCreateRequest,
  FuncionarioExperiencia,
  FuncionarioIndicadoresResponse,
  FuncionarioPatchRequest,
  FuncionarioResponse,
  FuncionarioStatus,
  FuncionarioUpdateRequest,
} from "./api/models";

export interface FuncionarioFilters {
  nome?: string;
  cargo?: string;
  status?: FuncionarioStatus | "";
}

export interface FuncionarioFormData {
  nome: string;
  email: string;
  telefone: string;
  cargo: string;
  departamento: string;
  cidade: string;
  salario: number;
  experiencia: FuncionarioExperiencia;
  anosExperiencia: number;
  status?: FuncionarioStatus;
}

let nextMockId = 5;
let mockFuncionarios: FuncionarioResponse[] = [
  { id: 1, nome: "Ana Souza", email: "ana.souza@example.com", telefone: "11987654321", salario: 6500, cidade: "São Paulo", departamento: "Tecnologia", status: "EM_ANALISE", experiencia: "PLENO", anosExperiencia: 4, cargos: [{ id: 1, nome: "Desenvolvedora Java" }], redes: [] },
  { id: 2, nome: "Bruno Lima", email: "bruno.lima@example.com", telefone: "21976543210", salario: 4800, cidade: "Rio de Janeiro", departamento: "Produto", status: "APROVADO", experiencia: "JUNIOR", anosExperiencia: 2, cargos: [{ id: 2, nome: "Analista de Produto" }], redes: [] },
  { id: 3, nome: "Carla Mendes", email: "carla.mendes@example.com", salario: 7200, cidade: "Brasília", departamento: "Dados", status: "REPROVADO", experiencia: "SENIOR", anosExperiencia: 7, cargos: [{ id: 3, nome: "Engenheira de Dados" }], redes: [] },
  { id: 4, nome: "Diego Alves", email: "diego.alves@example.com", telefone: "31988887777", salario: 5900, cidade: "Belo Horizonte", departamento: "Design", status: "CONTRATADO", experiencia: "PLENO", anosExperiencia: 3, cargos: [{ id: 4, nome: "Product Designer" }], redes: [] },
];

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function mockFromForm(values: FuncionarioFormData, id: number, status: FuncionarioStatus): FuncionarioResponse {
  return {
    id,
    nome: values.nome.trim(),
    email: values.email.trim(),
    telefone: values.telefone.trim() || undefined,
    salario: values.salario,
    cidade: values.cidade.trim() || undefined,
    departamento: values.departamento.trim() || undefined,
    status,
    experiencia: values.experiencia,
    anosExperiencia: values.anosExperiencia,
    cargos: [{ id, nome: values.cargo.trim() }],
    redes: [],
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  };
}

export async function listFuncionarios(
  filters: FuncionarioFilters = {},
): Promise<FuncionarioResponse[]> {
  if (isMockMode()) {
    const nome = filters.nome?.trim().toLocaleLowerCase("pt-BR");
    const cargo = filters.cargo?.trim().toLocaleLowerCase("pt-BR");
    return clone(mockFuncionarios.filter((item) =>
      (!nome || item.nome.toLocaleLowerCase("pt-BR").includes(nome)) &&
      (!cargo || item.cargos?.some((value) => value.nome.toLocaleLowerCase("pt-BR").includes(cargo))) &&
      (!filters.status || item.status === filters.status),
    ));
  }
  const params = new URLSearchParams();
  if (filters.nome?.trim()) params.set("nome", filters.nome.trim());
  if (filters.cargo?.trim()) params.set("cargo", filters.cargo.trim());
  if (filters.status) params.set("status", filters.status);
  const query = params.size ? `?${params.toString()}` : "";
  return apiFetch<FuncionarioResponse[]>(`/funcionarios${query}`);
}

export function getFuncionario(id: number): Promise<FuncionarioResponse> {
  if (isMockMode()) {
    const item = mockFuncionarios.find((value) => value.id === id);
    return item ? Promise.resolve(clone(item)) : Promise.reject(new Error("Funcionário não encontrado."));
  }
  return apiFetch<FuncionarioResponse>(`/funcionarios/${id}`);
}

export function getFuncionarioIndicadores(): Promise<FuncionarioIndicadoresResponse> {
  if (isMockMode()) {
    return Promise.resolve({
      total: mockFuncionarios.length,
      emAnalise: mockFuncionarios.filter((item) => item.status === "EM_ANALISE").length,
      aprovados: mockFuncionarios.filter((item) => item.status === "APROVADO").length,
      reprovados: mockFuncionarios.filter((item) => item.status === "REPROVADO").length,
      contratados: mockFuncionarios.filter((item) => item.status === "CONTRATADO").length,
    });
  }
  return apiFetch<FuncionarioIndicadoresResponse>("/funcionarios/indicadores");
}

export async function createFuncionario(
  values: FuncionarioFormData,
): Promise<FuncionarioResponse> {
  if (isMockMode()) {
    const created = mockFromForm(values, nextMockId++, "EM_ANALISE");
    mockFuncionarios = [created, ...mockFuncionarios];
    return clone(created);
  }
  const cargoId = await findOrCreateCargoId(values.cargo);
  const body: FuncionarioCreateRequest = {
    nome: values.nome.trim(),
    email: values.email.trim(),
    telefone: values.telefone.trim() || undefined,
    salario: values.salario,
    cidade: values.cidade.trim() || undefined,
    departamento: values.departamento.trim() || undefined,
    experiencia: values.experiencia,
    anosExperiencia: values.anosExperiencia,
    cargoIds: [cargoId],
    redes: [],
  };
  return apiFetch<FuncionarioResponse>("/funcionarios", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateFuncionario(
  current: FuncionarioResponse,
  values: FuncionarioFormData,
): Promise<FuncionarioResponse> {
  if (isMockMode()) {
    const updated = mockFromForm(values, current.id, values.status ?? current.status);
    updated.redes = current.redes;
    updated.criadoEm = current.criadoEm;
    const index = mockFuncionarios.findIndex((item) => item.id === current.id);
    if (index < 0) throw new Error("Funcionário não encontrado.");
    mockFuncionarios[index] = updated;
    return clone(updated);
  }
  const cargoId = await findOrCreateCargoId(values.cargo);
  const body: FuncionarioUpdateRequest = {
    nome: values.nome.trim(),
    email: values.email.trim(),
    telefone: values.telefone.trim() || undefined,
    salario: values.salario,
    cidade: values.cidade.trim() || undefined,
    departamento: values.departamento.trim() || undefined,
    status: values.status ?? current.status,
    experiencia: values.experiencia,
    anosExperiencia: values.anosExperiencia,
    cargoIds: [cargoId],
    redes: (current.redes ?? []).map(({ tipo, url }) => ({ tipo, url })),
  };
  return apiFetch<FuncionarioResponse>(`/funcionarios/${current.id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export function patchFuncionario(
  id: number,
  changes: FuncionarioPatchRequest,
): Promise<FuncionarioResponse> {
  if (isMockMode()) {
    const index = mockFuncionarios.findIndex((item) => item.id === id);
    if (index < 0) return Promise.reject(new Error("Funcionário não encontrado."));
    const current = mockFuncionarios[index];
    mockFuncionarios[index] = {
      ...current,
      nome: changes.nome ?? current.nome,
      email: changes.email ?? current.email,
      telefone: changes.telefone ?? current.telefone,
      salario: changes.salario ?? current.salario,
      cidade: changes.cidade ?? current.cidade,
      departamento: changes.departamento ?? current.departamento,
      status: changes.status ?? current.status,
      experiencia: changes.experiencia ?? current.experiencia,
      anosExperiencia: changes.anosExperiencia ?? current.anosExperiencia,
      redes: changes.redes
        ? changes.redes.map((rede, position) => ({ id: position + 1, ...rede }))
        : current.redes,
      atualizadoEm: new Date().toISOString(),
    };
    return Promise.resolve(clone(mockFuncionarios[index]));
  }
  return apiFetch<FuncionarioResponse>(`/funcionarios/${id}`, {
    method: "PATCH",
    body: JSON.stringify(changes),
  });
}

export async function deleteFuncionario(id: number): Promise<void> {
  if (isMockMode()) {
    mockFuncionarios = mockFuncionarios.filter((item) => item.id !== id);
    return;
  }
  await apiFetch(`/funcionarios/${id}`, { method: "DELETE" });
}
