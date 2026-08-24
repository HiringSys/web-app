import { apiFetch } from "./api";
import type { CargoResponse } from "./api/models";

export async function findOrCreateCargoId(nome: string): Promise<number> {
  const cargo = nome.trim();
  if (!cargo) throw new Error("Informe o cargo do candidato.");

  const matches = await apiFetch<CargoResponse[]>(
    `/cargos/buscar?nome=${encodeURIComponent(cargo)}`,
  );
  const exact = matches.find(
    (item) => item.nome.localeCompare(cargo, "pt-BR", { sensitivity: "base" }) === 0,
  );
  if (exact) return exact.id;

  const created = await apiFetch<CargoResponse>("/cargos", {
    method: "POST",
    body: JSON.stringify({ nome: cargo }),
  });
  return created.id;
}
