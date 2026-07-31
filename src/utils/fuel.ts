import type { FuelEntity, FuelType } from "../types";

export const ALLOWED_FUEL_TYPES = ["DIE", "SUP", "GAS"] as const;
export const UNKNOWN_FUEL_GROUP = "UNKNOWN";

export type FuelGroupKey = FuelType | typeof UNKNOWN_FUEL_GROUP;

export function isFuelType(value: unknown): value is FuelType {
  return value === "DIE" || value === "SUP" || value === "GAS";
}

export function normaliseFuelType(raw: string | undefined): FuelType | string {
  const value = raw?.trim().toLowerCase();
  switch (value) {
    case "diesel":
    case "d":
    case "die":
      return "DIE";
    case "super":
    case "super95":
    case "e5":
    case "95":
    case "sup":
      return "SUP";
    case "cng":
    case "gas":
      return "GAS";
    default:
      return raw ?? "";
  }
}

export function detectEntityFuelType(entity: FuelEntity): FuelType | "" {
  const attrs = entity.attributes;
  const rawFuel = attrs.fuel_type || attrs.fuel_type_name;
  if (rawFuel) {
    const norm = normaliseFuelType(String(rawFuel));
    if (isFuelType(norm)) return norm;
  }
  const searchStr = `${entity.entity_id} ${attrs.friendly_name ?? ""} ${attrs.station_name ?? ""}`.toLowerCase();
  if (/\b(diesel|die)\b/i.test(searchStr) || searchStr.includes("diesel")) {
    return "DIE";
  }
  if (
    /\b(super|sup|e5|e10|95|benzin)\b/i.test(searchStr) ||
    searchStr.includes("super") ||
    searchStr.includes("benzin")
  ) {
    return "SUP";
  }
  if (
    /\b(cng|gas|lpg|autogas)\b/i.test(searchStr) ||
    searchStr.includes("cng") ||
    searchStr.includes("gas")
  ) {
    return "GAS";
  }
  return "";
}

export function resolveEntityFuelType(
  entity: FuelEntity,
  override?: string,
): FuelType | "" {
  const detected = detectEntityFuelType(entity);
  if (detected) return detected;
  if (!override) return "";
  const normalised = normaliseFuelType(override);
  return isFuelType(normalised) ? normalised : "";
}

export function fuelGroupKey(fuelType: FuelType | ""): FuelGroupKey {
  return fuelType || UNKNOWN_FUEL_GROUP;
}
