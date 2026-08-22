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

export type CandidateStatus = "aprovado" | "reprovado";

export const Seniority = {
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
  experienceYears: number;
}

export interface TableColumn<T> {
  key: string;
  label: string;
  size?: "sm" | "md" | "lg";
  align?: "start" | "center";
  component: Component;
  props: (item: T) => Record<string, unknown>;
}
