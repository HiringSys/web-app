// Types generated from the HiringSys API OpenAPI spec (v1.0).
// Source: https://ms-hiring-api-r3jt.onrender.com/v3/api-docs
// Documented in detail at .sdd/swagger/. Kept close to the backend's own
// (Portuguese) naming — the `service/` layer maps these to the app's
// domain types (Candidate, SelectiveProcess, ...).

export type RedeTipo = "LINKEDIN" | "GITHUB" | "PORTFOLIO" | "OUTRO";

export interface RedeRequest {
  tipo: RedeTipo;
  url:  string;
}

export interface RedeResponse {
  id:   number;
  tipo: RedeTipo;
  url:  string;
}

export type GrupoEstado = "EM_COLETA" | "EM_PROCESSO" | "PAUSADO" | "ENCERRADO" | "RASCUNHO";

export interface GrupoRequest {
  nome:        string;
  area:        string;
  estado:      GrupoEstado;
  disponiveis: number;
  cargo?:      string;
}

export interface GrupoResponse {
  id:          number;
  nome:        string;
  area:        string;
  estado:      GrupoEstado;
  disponiveis: number;
  cargo?:      string;
  criadoEm:    string;
}

export interface CargoRequest {
  nome: string;
}

export interface CargoResponse {
  id:   number;
  nome: string;
}

export type FuncionarioStatus = "EM_ANALISE" | "APROVADO" | "REPROVADO" | "CONTRATADO";
export type FuncionarioExperiencia = "SEM_EXPERIENCIA" | "ESTAGIARIO" | "JUNIOR" | "PLENO" | "SENIOR";

export interface GrupoFuncionarioResponse {
  id:               number;
  nome:             string;
  area:             string;
  scoreProximidade?: number;
}

export interface FuncionarioCreateRequest {
  nome:         string;
  email:        string;
  telefone?:    string;
  salario?:     number;
  cidade?:      string;
  experiencia?: FuncionarioExperiencia;
  cargoIds?:    number[];
  redes?:       RedeRequest[];
}

export interface FuncionarioUpdateRequest {
  nome:        string;
  email:       string;
  telefone?:   string;
  salario?:    number;
  cidade?:     string;
  status:      FuncionarioStatus;
  experiencia: FuncionarioExperiencia;
  cargoIds:    number[];
  redes:       RedeRequest[];
}

export interface FuncionarioPatchRequest {
  nome?:        string;
  email?:       string;
  telefone?:    string;
  salario?:     number;
  cidade?:      string;
  status?:      FuncionarioStatus;
  experiencia?: FuncionarioExperiencia;
  cargoIds?:    number[];
  redes?:       RedeRequest[];
}

export interface FuncionarioResponse {
  id:           number;
  nome:         string;
  email:        string;
  telefone?:    string;
  salario?:     number;
  cidade?:      string;
  status:       FuncionarioStatus;
  experiencia?: FuncionarioExperiencia;
  cargos?:      CargoResponse[];
  redes?:       RedeResponse[];
  grupos?:      GrupoFuncionarioResponse[];
  arquivos?:    ArquivoFuncionarioResponse[];
  criadoEm?:    string;
  atualizadoEm?: string;
}

export interface AtualizarStatusRequest {
  status: FuncionarioStatus;
}

export interface VinculoGrupoFuncionarioRequest {
  funcionarioId:     number;
  scoreProximidade?: number;
}

export interface ScoreProximidadeRequest {
  scoreProximidade?: number;
}

export interface IntegranteGrupoResponse {
  funcionarioId:     number;
  nome:              string;
  email:             string;
  scoreProximidade?: number;
}

export type ArquivoCategoria = "CURRICULO" | "FOTO" | "CERTIFICADO" | "DOCUMENTO" | "OUTRO";

export interface ArquivoFuncionarioResponse {
  id:            number;
  funcionarioId: number;
  nomeArquivo:   string;
  categoria:     ArquivoCategoria;
  mimeType?:     string;
  extensao?:     string;
  tamanhoBytes?: number;
  criadoEm:      string;
}

export interface LoginRequest {
  email:    string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType?:  string;
  expiresIn?:  number;
  perfil?:     string;
}

export interface RecuperacaoSenhaRequest {
  email: string;
}

export interface RecuperacaoSenhaResponse {
  mensagem?: string;
}
