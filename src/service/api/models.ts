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
  nome:             string;
  area:             string;
  estado:           GrupoEstado;
  disponiveis:      number;
  cargo?:           string;
  limiteAprovados?: number;
  emailEquipe?:     string;
}

export interface GrupoResponse {
  id:               number;
  nome:             string;
  area:             string;
  estado:           GrupoEstado;
  disponiveis:      number;
  cargo?:           string;
  limiteAprovados?: number;
  emailEquipe?:     string;
  criadoEm:         string;
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
  nome:          string;
  email:         string;
  telefone?:     string;
  salario?:      number;
  cidade?:       string;
  departamento?: string;
  experiencia?:  FuncionarioExperiencia;
  anosExperiencia?: number;
  cargoIds:      number[];
  redes?:        RedeRequest[];
}

export interface FuncionarioUpdateRequest {
  nome:          string;
  email:         string;
  telefone?:     string;
  salario?:      number;
  cidade?:       string;
  departamento?: string;
  status:        FuncionarioStatus;
  experiencia:   FuncionarioExperiencia;
  anosExperiencia: number;
  cargoIds:      number[];
  redes:         RedeRequest[];
}

export interface FuncionarioPatchRequest {
  nome?:         string;
  email?:        string;
  telefone?:     string;
  salario?:      number;
  cidade?:       string;
  departamento?: string;
  status?:       FuncionarioStatus;
  experiencia?:  FuncionarioExperiencia;
  anosExperiencia?: number;
  cargoIds?:     number[];
  redes?:        RedeRequest[];
}

export interface FuncionarioResponse {
  id:            number;
  nome:          string;
  email:         string;
  telefone?:     string;
  salario?:      number;
  cidade?:       string;
  departamento?: string;
  status:        FuncionarioStatus;
  experiencia?:  FuncionarioExperiencia;
  anosExperiencia?: number;
  cargos?:       CargoResponse[];
  redes?:        RedeResponse[];
  grupos?:       GrupoFuncionarioResponse[];
  arquivos?:     ArquivoFuncionarioResponse[];
  criadoEm?:     string;
  atualizadoEm?: string;
}

export interface FuncionarioIndicadoresResponse {
  total:       number;
  emAnalise:   number;
  aprovados:   number;
  reprovados:  number;
  contratados: number;
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

export interface StageCandidateResponse {
  id:     number;
  status: string;
}

export interface StageSelectionRequest {
  approvedCandidateIds: number[];
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

export interface FuncionarioImportacaoRequest {
  nome:             string;
  email:            string;
  telefone?:        string;
  salario:          number;
  cidade?:          string;
  status:           FuncionarioStatus;
  experiencia:      FuncionarioExperiencia;
  anosExperiencia?: number;
  cargos:           string[];
}

export interface ImportacaoFuncionariosRequest {
  funcionarios: FuncionarioImportacaoRequest[];
}

export interface ImportacaoFuncionariosResponse {
  grupoId?:        number;
  totalRecebidos?: number;
  mensagem?:       string;
}
