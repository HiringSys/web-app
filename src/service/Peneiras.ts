import type { Candidate } from "@/components/ui/table/types";
import type { SelectiveProcess } from "@/types/peneira";

import { apiFetch } from "./api";
import { getStageMocks, getPersonMocksForStage } from "@mocks/handler";

export async function listProcesses(): Promise<SelectiveProcess[]> {
  try {
    return await apiFetch<SelectiveProcess[]>("/stages");
  } catch {
    return getStageMocks();
  }
}

export async function getProcess(id: string | number): Promise<SelectiveProcess | undefined> {
  try {
    return await apiFetch<SelectiveProcess>(`/stages/${id}`);
  } catch {
    return getStageMocks().find((process) => String(process.id) === String(id));
  }
}

export async function getCandidatesForProcess(id: string | number): Promise<Candidate[]> {
  try {
    return await apiFetch<Candidate[]>(`/stages/${id}/candidates`);
  } catch {
    return getPersonMocksForStage(id);
  }
}
