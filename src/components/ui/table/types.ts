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
  blocked?: boolean;
  subStatus?: typeof CandidateStatus.Contratado | typeof CandidateStatus.EmAnalise;
}

export interface TableColumn<T> {
  key: string;
  label: string;
  size?: "sm" | "md" | "lg";
  fixed?: boolean;
  measure?: (item: T) => string;
  measureOffset?: number;
  component: Component;
  props: (item: T) => Record<string, unknown>;
}
