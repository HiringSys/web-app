import type { FuncionarioImportacaoRequest, FuncionarioStatus, FuncionarioExperiencia } from "./api/models";

// Column layout matches the exemplo.xlsx template shipped with the project:
// nome, email, telefone, salario, cidade, status, experiencia, cargos (";"-separated).
const COLUMNS = ["nome", "email", "telefone", "salario", "cidade", "status", "experiencia", "cargos"] as const;
type ColumnKey = (typeof COLUMNS)[number];
const REQUIRED_COLUMNS: ColumnKey[] = ["nome", "email", "salario", "status", "experiencia", "cargos"];

const STATUS_VALUES: FuncionarioStatus[] = ["EM_ANALISE", "APROVADO", "REPROVADO", "CONTRATADO"];
const EXPERIENCIA_VALUES: FuncionarioExperiencia[] = ["SEM_EXPERIENCIA", "ESTAGIARIO", "JUNIOR", "PLENO", "SENIOR"];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Matches ImportacaoFuncionariosRequest.funcionarios' maxItems. */
const MAX_FUNCIONARIOS = 1000;

export interface ImportIssue {
  row:     number; // 1-based Excel row (0 = sheet-level issue, not tied to a row)
  message: string;
}

export interface ParsedFuncionariosImport {
  funcionarios: FuncionarioImportacaoRequest[];
  issues:       ImportIssue[];
  totalRows:    number;
}

function cellToString(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function isBlankRow(row: unknown[]): boolean {
  return row.every((cell) => cellToString(cell) === "");
}

/** Maps each expected column to its index in the header row; missing columns come back as -1. */
function indexColumns(header: unknown[]): Record<ColumnKey, number> {
  const normalized = header.map((cell) => cellToString(cell).toLowerCase());
  return Object.fromEntries(COLUMNS.map((key) => [key, normalized.indexOf(key)])) as Record<ColumnKey, number>;
}

/**
 * Rows missing a required field (nome/email/salario/status/experiencia/cargos) are dropped
 * entirely and reported — sending them would get the whole batch rejected by the API, since
 * it validates FuncionarioImportacaoRequest per-item with no partial-failure response.
 * Invalid *optional* fields (telefone/cidade) are cleared instead, and the row still imports.
 */
export function parseFuncionariosSheet(rows: unknown[][]): ParsedFuncionariosImport {
  const issues: ImportIssue[] = [];
  const funcionarios: FuncionarioImportacaoRequest[] = [];

  const [header, ...dataRows] = rows;
  if (!header) {
    return { funcionarios, issues: [{ row: 0, message: "Planilha vazia." }], totalRows: 0 };
  }

  const columns = indexColumns(header);
  const missingColumns = REQUIRED_COLUMNS.filter((key) => columns[key] === -1);
  if (missingColumns.length > 0) {
    return {
      funcionarios,
      issues: [{ row: 0, message: `Colunas obrigatórias ausentes na planilha: ${missingColumns.join(", ")}.` }],
      totalRows: dataRows.length,
    };
  }

  dataRows.forEach((row, index) => {
    const excelRow = index + 2; // header occupies row 1
    if (isBlankRow(row)) return;

    const get = (key: ColumnKey) => row[columns[key]];

    const nome        = cellToString(get("nome"));
    const email       = cellToString(get("email"));
    const salarioRaw  = get("salario");
    const salario     = typeof salarioRaw === "number" ? salarioRaw : Number(cellToString(salarioRaw));
    const status      = cellToString(get("status")).toUpperCase();
    const experiencia = cellToString(get("experiencia")).toUpperCase();
    const cargos      = cellToString(get("cargos")).split(";").map((cargo) => cargo.trim()).filter(Boolean);

    const rowIssues: string[] = [];
    if (!nome) rowIssues.push("nome ausente");
    if (!email || !EMAIL_PATTERN.test(email)) rowIssues.push("e-mail ausente ou inválido");
    if (!Number.isFinite(salario) || salario < 0) rowIssues.push("salário ausente ou inválido");
    if (!STATUS_VALUES.includes(status as FuncionarioStatus)) rowIssues.push("status ausente ou inválido");
    if (!EXPERIENCIA_VALUES.includes(experiencia as FuncionarioExperiencia)) rowIssues.push("experiência ausente ou inválida");
    if (cargos.length === 0) rowIssues.push("cargos ausentes");

    if (rowIssues.length > 0) {
      issues.push({ row: excelRow, message: `Linha ${excelRow} ignorada: ${rowIssues.join(", ")}.` });
      return;
    }

    let telefone: string | undefined = cellToString(get("telefone")) || undefined;
    if (telefone && telefone.length > 20) {
      issues.push({ row: excelRow, message: `Linha ${excelRow}: telefone muito longo, campo desconsiderado.` });
      telefone = undefined;
    }

    let cidade: string | undefined = cellToString(get("cidade")) || undefined;
    if (cidade && cidade.length > 100) {
      issues.push({ row: excelRow, message: `Linha ${excelRow}: cidade muito longa, campo desconsiderado.` });
      cidade = undefined;
    }

    funcionarios.push({
      nome,
      email,
      telefone,
      salario,
      cidade,
      status:      status as FuncionarioStatus,
      experiencia: experiencia as FuncionarioExperiencia,
      cargos,
    });
  });

  if (funcionarios.length > MAX_FUNCIONARIOS) {
    issues.push({
      row: 0,
      message: `A planilha tem mais de ${MAX_FUNCIONARIOS} linhas válidas; somente as ${MAX_FUNCIONARIOS} primeiras serão importadas.`,
    });
    funcionarios.length = MAX_FUNCIONARIOS;
  }

  return { funcionarios, issues, totalRows: dataRows.length };
}
