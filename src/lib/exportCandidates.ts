import { CandidateStatus, Seniority, type Candidate } from "@@/ui/table/types";
import { formatPhoneNumber, formatSalary } from "./format";

const STATUS_LABELS: Record<CandidateStatus, string> = {
  [CandidateStatus.EmAnalise]: "Em análise",
  [CandidateStatus.Aprovado]: "Aprovado",
  [CandidateStatus.Reprovado]: "Reprovado",
  [CandidateStatus.Contratado]: "Contratado",
  [CandidateStatus.Suprimido]: "Suprimido",
};

const SENIORITY_LABELS: Record<Seniority, string> = {
  [Seniority.SemExperiencia]: "Sem experiência",
  [Seniority.Estagiario]: "Estagiário",
  [Seniority.Junior]: "Junior",
  [Seniority.Pleno]: "Pleno",
  [Seniority.Senior]: "Senior",
};

const EXPORT_HEADERS = [
  "Nome",
  "E-mail",
  "Telefone",
  "Cargo",
  "Senioridade",
  "Expectativa salarial",
  "Status",
  "Afinidade com a vaga",
];

function statusLabel(candidate: Candidate): string {
  return candidate.blocked
    ? STATUS_LABELS[CandidateStatus.Suprimido]
    : STATUS_LABELS[candidate.status];
}

function candidateRow(candidate: Candidate): (string | number)[] {
  return [
    candidate.name,
    candidate.email,
    formatPhoneNumber(candidate.phone),
    candidate.role,
    SENIORITY_LABELS[candidate.seniority],
    formatSalary(candidate.salaryExpectation),
    statusLabel(candidate),
    candidate.jobAffinity === null
      ? "Em análise"
      : `${candidate.jobAffinity}%`,
  ];
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function escapeCsvField(value: string): string {
  return /[",;\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function downloadCandidatesAsTxt(
  candidates: Candidate[],
  filename: string,
) {
  const lines = [
    EXPORT_HEADERS.join("\t"),
    ...candidates.map((candidate) => candidateRow(candidate).join("\t")),
  ];

  const blob = new Blob([lines.join("\n")], {
    type: "text/plain;charset=utf-8",
  });
  triggerDownload(blob, `${filename}.txt`);
}

export function downloadCandidatesAsCsv(
  candidates: Candidate[],
  filename: string,
) {
  const lines = [
    EXPORT_HEADERS.map(escapeCsvField).join(";"),
    ...candidates.map((candidate) =>
      candidateRow(candidate)
        .map((value) => escapeCsvField(String(value)))
        .join(";"),
    ),
  ];

  const blob = new Blob(["﻿" + lines.join("\n")], {
    type: "text/csv;charset=utf-8",
  });
  triggerDownload(blob, `${filename}.csv`);
}

export async function downloadCandidatesAsXlsx(
  candidates: Candidate[],
  filename: string,
) {
  const { Workbook } = await import("exceljs");
  const workbook = new Workbook();
  const sheet = workbook.addWorksheet("Candidatos");

  sheet.addRow(EXPORT_HEADERS).font = { bold: true };
  candidates.forEach((candidate) => sheet.addRow(candidateRow(candidate)));
  sheet.columns.forEach((column) => {
    column.width = 22;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  triggerDownload(blob, `${filename}.xlsx`);
}
