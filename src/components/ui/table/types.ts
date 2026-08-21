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

export interface Candidate {
  id: string | number;
  name: string;
  email: string;
  avatarUrl?: string;
  status: CandidateStatus;
  phone: string;
  networks?: SocialNetwork[];
  seniority: string;
}

export type TableColumnKey =
  | "name"
  | "status"
  | "phone"
  | "network"
  | "seniority";

export interface TableColumn {
  key: TableColumnKey;
  label: string;
  width?: string;
  align?: "start" | "center";
}
