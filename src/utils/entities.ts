import type { HomeAssistant } from "../types";

// Find all fuel price sensors in hass states.
export function findFuelPriceEntities(hass: HomeAssistant | undefined): string[] {
  if (!hass || !hass.states) return [];
  return Object.keys(hass.states).filter((eid) => {
    const state = hass.states[eid];
    if (!state || !eid.startsWith("sensor.")) return false;
    if (state.attributes?.fuel_type || Array.isArray(state.attributes?.stations)) return true;
    const num = parseFloat(state.state);
    if (!Number.isFinite(num)) return false;
    const name = `${eid} ${state.attributes?.friendly_name ?? ""}`.toLowerCase();
    return (
      name.includes("diesel") ||
      name.includes("super") ||
      name.includes("fuel") ||
      name.includes("sprit") ||
      name.includes("tankstelle") ||
      name.includes("kraftstoff") ||
      name.includes("benzin") ||
      name.includes("petrol") ||
      name.includes("gasoline")
    );
  });
}

export const findTankstellenEntities = findFuelPriceEntities;
