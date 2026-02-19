// Source: teamcolorcodes.com + sportcolorcodes.com (cross-referenced)
// Constructor IDs verified against Jolpica API live calls (2026-02-19)
// Apply via inline style={{ color: getTeamColor(id) }} — NOT Tailwind dynamic classes
// Tailwind v4 purges dynamic arbitrary values at build time

export const TEAM_COLORS: Record<string, string> = {
  // 2025 grid
  mercedes:     "#00D2BE",
  red_bull:     "#3671C6",
  ferrari:      "#E8002D",
  mclaren:      "#FF8000",
  aston_martin: "#358C75",
  alpine:       "#FF87BC",
  williams:     "#64C4FF",
  haas:         "#B6BABD",
  rb:           "#6692FF",   // Visa Cash App RB (2024–2025)
  sauber:       "#52E252",   // Kick Sauber (2024–2025)

  // 2023 names
  alfa:         "#900000",   // Alfa Romeo
  alphatauri:   "#5E8FAA",

  // 2019–2022
  racing_point: "#F596C8",
  renault:      "#FFF500",

  // 2010–2018
  force_india:  "#F596C8",
  lotus_f1:     "#FFB800",
  toro_rosso:   "#469BFF",
  manor:        "#FF291E",
  hrt:          "#A0A0A0",
  caterham:     "#005030",
  marussia:     "#6E0000",
  lotus_racing: "#FFB800",
  virgin:       "#CC0000",

  // Pre-2010
  toyota:       "#CC1E4A",
  bmw_sauber:   "#6F6F6F",
  jordan:       "#FFC906",
  bar:          "#D2AB6F",
  jaguar:       "#006F3C",
  benetton:     "#00A350",
  super_aguri:  "#FFFFFF",
  spyker:       "#FF6600",
  midland:      "#C0392B",
  minardi:      "#333333",
  arrows:       "#FF8700",
  prost:        "#0055A4",
  stewart:      "#FFFFFF",
  tyrrell:      "#0055A4",
};

export const FALLBACK_TEAM_COLOR = "#64748b";

/**
 * Returns the hex color for a given Jolpica constructorId.
 * Falls back to slate-500 (#64748b) for unknown constructors.
 * Apply via inline style, not Tailwind dynamic classes.
 *
 * @example
 * <span style={{ color: getTeamColor("ferrari") }}>Ferrari</span>
 */
export function getTeamColor(constructorId: string): string {
  return TEAM_COLORS[constructorId] ?? FALLBACK_TEAM_COLOR;
}
