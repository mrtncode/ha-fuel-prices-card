// Local mirror of the HA / Lovelace types this card actually uses.
// Replaces the `custom-card-helpers` dependency — the package is
// effectively unmaintained and bundled HA-internal types drift faster
// than its release cadence. We only depend on a handful of fields, so
// pinning a local shape is cheaper than a transitive npm dep.

/** Single entity in `hass.states`. The attributes bag is open-ended —
 *  the integration's coordinator emits the keys this card reads
 *  (`stations`, `fuel_type`, `attribution`, `dynamic_mode`, …). HA
 *  always populates `last_updated`, so it stays non-optional here to
 *  satisfy the card's `_resolveEntities` mapper without an extra guard. */
export interface HassEntity {
  state: string;
  attributes: Record<string, unknown> & TankstellenEntityAttributes;
  last_changed?: string;
  last_updated: string;
  entity_id?: string;
}

/** Minimal HA shape — only the fields this card touches. `language` is
 *  the user-profile locale; `localize` is HA's own UI translation
 *  lookup (the editor reuses it for built-in field names so we don't
 *  carry duplicates); `callWS` powers both the card-version probe and
 *  the history fetch; `callService` powers the manual-refresh button;
 *  `themes.darkMode` is reserved for future adaptive logo work.
 *  `callWS` and `callService` are non-optional — the card requires
 *  both at runtime (history view + manual refresh would silently fail
 *  otherwise) and HA core has shipped both since well before our
 *  `requirements.txt` floor. Anything beyond these lives untyped and
 *  is read with a cast at the call site. */
/** Minimal entity-registry shape — only `platform` is read, by the card
 *  picker's `getEntitySuggestion` to gate suggestions to this integration's
 *  own entities (registry platform === integration domain). */
export interface RegistryEntity {
  platform?: string;
}

export interface HomeAssistant {
  states: Record<string, HassEntity>;
  entities?: Record<string, RegistryEntity>;
  language?: string;
  themes?: { darkMode?: boolean } & Record<string, unknown>;
  config?: { time_zone?: string } & Record<string, unknown>;
  localize?: (key: string, ...args: unknown[]) => string;
  callWS<T = unknown>(msg: { type: string; [key: string]: unknown }): Promise<T>;
  callService(
    domain: string,
    service: string,
    data?: Record<string, unknown>,
  ): Promise<unknown> | void;
}

/** Marker every card config extends. */
export interface LovelaceCardConfig {
  type: string;
  [key: string]: unknown;
}

/** Custom-card editor contract — Lovelace expects an HTMLElement that
 *  accepts `setConfig(config)` and reads `hass`. */
export interface LovelaceCardEditor extends HTMLElement {
  hass?: HomeAssistant;
  setConfig(config: LovelaceCardConfig): void;
}

/** `LovelaceCard` is only referenced as the `hui-error-card` tag-map
 *  entry below, so an HTMLElement alias suffices. */
export type LovelaceCard = HTMLElement;

/** Local `fireEvent` shim — same shape as the helper from
 *  custom-card-helpers. `bubbles: true` + `composed: true` are required
 *  so the event crosses the editor's shadow boundary and reaches the
 *  dashboard's card-editor listener. */
export function fireEvent<T>(
  node: HTMLElement,
  type: string,
  detail: T,
): void {
  node.dispatchEvent(
    new CustomEvent(type, { detail, bubbles: true, composed: true }),
  );
}

interface HaEntityPickerElement extends HTMLElement {
  hass?: HomeAssistant;
  value?: string;
  label?: string;
  includeDomains?: string[];
  allowCustomEntity?: boolean;
}

declare global {
  interface HTMLElementTagNameMap {
    "fuel-prices-card-editor": LovelaceCardEditor;
    "tankstellen-austria-card-editor": LovelaceCardEditor;
    "hui-error-card": LovelaceCard;
    "ha-entity-picker": HaEntityPickerElement;
  }
}

export type FuelType = "DIE" | "SUP" | "GAS";

export interface CarConfig {
  name: string;
  fuel_type: FuelType;
  tank_size: number; // litres, 1..200
  consumption?: number; // l / 100km, 0..30; optional
  icon?: string; // mdi:*
}

export interface FuelPricesCardConfig extends LovelaceCardConfig {
  type: string;
  name?: string;
  entities?: string[];

  language?: "de" | "en";

  max_stations?: number; // 0..5

  show_index?: boolean;
  show_map_links?: boolean;
  map_provider?: "auto" | "google" | "apple";
  show_distance?: boolean;
  sort_by_distance?: boolean;
  show_opening_hours?: boolean;
  show_payment_methods?: boolean;
  show_history?: boolean;
  show_best_refuel?: boolean;
  show_median_line?: boolean;
  show_hour_envelope?: boolean;
  show_noon_markers?: boolean;
  show_minmax?: boolean;

  payment_filter?: string[];
  payment_highlight_mode?: boolean;

  tab_labels?: Record<string, string>;

  show_cars?: boolean;
  show_car_fillup?: boolean;
  show_car_consumption?: boolean;
  cars?: CarConfig[];

  hide_header_price?: boolean;
  logo_adapt_to_theme?: boolean;
  hide_header?: boolean;
  hide_attribution?: boolean;
}

export type TankstellenAustriaCardConfig = FuelPricesCardConfig;

// --- Upstream API shapes, as surfaced on the HA sensor's `.attributes`. ---

export interface OpeningHours {
  day: string; // "MO" | "SA" | "SO" | "FE" etc.
  from: string; // "HH:MM"
  to: string; // "HH:MM" — "24:00" means closes at midnight next day
}

export interface PaymentMethods {
  cash?: boolean;
  debit_card?: boolean;
  credit_card?: boolean;
  others?: string[];
}

export interface StationLocation {
  address?: string;
  postalCode?: string | number;
  city?: string;
  latitude?: number;
  longitude?: number;
}

export interface Station {
  name?: string;
  price?: number;
  open?: boolean;
  location?: StationLocation;
  distance_m?: number;
  opening_hours?: OpeningHours[];
  payment_methods?: PaymentMethods;
}

export interface FuelEntityAttributes {
  friendly_name?: string;
  fuel_type?: FuelType | string;
  fuel_type_name?: string;
  stations?: Station[];
  average_price?: number;
  dynamic_mode?: boolean;
  dynamic_tracker_label?: string;
  attribution?: string;
}

export type TankstellenEntityAttributes = FuelEntityAttributes;

export interface FuelEntity {
  entity_id: string;
  state: string;
  attributes: FuelEntityAttributes;
  last_updated?: string;
}

export type TankstellenEntity = FuelEntity;

// ---------------------------------------------------------------------------
// <ha-form> schema types
// ---------------------------------------------------------------------------
//
// These mirror the HA core editor types so the form editor stays
// strictly typed. `expandable` + `flatten: true` is non-negotiable —
// without `flatten`, ha-form scopes inner-schema values under
// `data[name]` and the card's flat-key reads silently default. The
// HaFormExpandableSchema interface declares `flatten?: boolean`
// explicitly so a future maintainer can't add an expandable that
// quietly nests its values.

export type HASelector =
  | {
      entity: {
        domain?: string | string[];
        integration?: string;
        multiple?: boolean;
      };
    }
  | { boolean: Record<string, never> }
  | { text: { type?: "text" | "password" | "url" | "email"; multiline?: boolean } }
  | {
      number: {
        min?: number;
        max?: number;
        step?: number;
        mode?: "box" | "slider";
        unit_of_measurement?: string;
      };
    }
  | {
      select: {
        mode?: "dropdown" | "list";
        multiple?: boolean;
        custom_value?: boolean;
        options: ReadonlyArray<{ value: string; label: string }>;
      };
    };

export interface HaFormBaseSchema {
  name: string;
  required?: boolean;
}

export interface HaFormSelectorSchema extends HaFormBaseSchema {
  selector: HASelector;
}

export interface HaFormExpandableSchema {
  type: "expandable";
  name: string;
  title?: string;
  /** When true, ha-form keeps the inner schema's values flat in
   *  `data` (i.e. `data.show_history` rather than
   *  `data.display.show_history`). Required for cards whose render()
   *  reads flat config keys — forgetting it silently leaves every
   *  flag at its default. */
  flatten?: boolean;
  schema: ReadonlyArray<HaFormSchema>;
}

export type HaFormSchema = HaFormSelectorSchema | HaFormExpandableSchema;

// `<ha-form>` element shape — mirror the props the editor sets so
// `tsc --noEmit` validates the template at compile time.
interface HaFormElement extends HTMLElement {
  hass?: HomeAssistant;
  data?: Record<string, unknown>;
  schema?: ReadonlyArray<HaFormSchema>;
  computeLabel?: (field: { name: string }) => string;
  computeHelper?: (field: { name: string }) => string | undefined;
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-form": HaFormElement;
  }
}
