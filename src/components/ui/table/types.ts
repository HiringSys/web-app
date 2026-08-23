import type { Component } from "vue";

export const SocialNetwork = {
  LinkedIn: "linkedin",
  GitHub: "github",
  Instagram: "instagram",
  Facebook: "facebook",
  X: "x",
  WhatsApp: "whatsapp",
  GitLab: "gitlab",
  Behance: "behance",
  Dribbble: "dribbble",
  TikTok: "tiktok",
} as const;

export type SocialNetwork = (typeof SocialNetwork)[keyof typeof SocialNetwork];

export const CandidateStatus = {
  EmAnalise: "em_analise",
  Aprovado:  "aprovado",
  Reprovado: "reprovado",
  Contratado: "contratado",
  /** Client-only status set via the block action — no backend field (see .sdd/swagger/api.md); sent as Reprovado whenever it has to reach the API. */
  Suprimido: "suprimido",
} as const;

export type CandidateStatus = (typeof CandidateStatus)[keyof typeof CandidateStatus];

export const Seniority = {
  SemExperiencia: "sem_experiencia",
  Estagiario: "estagiario",
  Junior: "junior",
  Pleno: "pleno",
  Senior: "senior",
} as const;

export type Seniority = (typeof Seniority)[keyof typeof Seniority];

export interface SocialLink {
  network: SocialNetwork;
  url: string;
}

export interface Candidate {
  id: string | number;
  name: string;
  email: string;
  avatarUrl?: string;
  status: CandidateStatus;
  phone: string;
  networks?: SocialLink[];
  seniority: Seniority;
  role: string;
  salaryExpectation: number;
  curriculumUrl?: string;
  jobAffinity: number;
  /** Overrides the displayed status to Suprimido without moving the candidate out of its actual section/status. Client-only. */
  blocked?: boolean;
}

export interface TableColumn<T> {
  key: string;
  label: string;
  size?: "sm" | "md" | "lg";
  /** Fixed-size content (badges/chips) — skips the per-cell scroll wrapper so effects like press-shadow aren't clipped. */
  fixed?: boolean;
  /** Text whose rendered width drives this column's auto-sizing, capped by `size`. Omit for icon-only or badge columns, which stay fixed at `size`. */
  measure?: (item: T) => string;
  /** Extra pixel width to reserve alongside the measured text, e.g. for an avatar. */
  measureOffset?: number;
  component: Component;
  props: (item: T) => Record<string, unknown>;
}
