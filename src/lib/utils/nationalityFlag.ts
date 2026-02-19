// Source: Jolpica API live scan — all 40 unique nationality adjective strings
// verified across 874+ drivers as of 2026-02-19
// Flag emojis: Unicode regional indicator symbols (ISO 3166-1 alpha-2)
// "East German" → 🇩🇪 (historical, no modern ISO code — mapped to Germany)
// "Rhodesian"   → 🇿🇼 (historical, mapped to Zimbabwe)

export const NATIONALITY_FLAGS: Record<string, string> = {
  American:        "🇺🇸",
  Argentine:       "🇦🇷",
  Australian:      "🇦🇺",
  Austrian:        "🇦🇹",
  Belgian:         "🇧🇪",
  Brazilian:       "🇧🇷",
  British:         "🇬🇧",
  Canadian:        "🇨🇦",
  Chilean:         "🇨🇱",
  Chinese:         "🇨🇳",
  Colombian:       "🇨🇴",
  Czech:           "🇨🇿",
  Danish:          "🇩🇰",
  Dutch:           "🇳🇱",
  "East German":   "🇩🇪",
  Finnish:         "🇫🇮",
  French:          "🇫🇷",
  German:          "🇩🇪",
  Hungarian:       "🇭🇺",
  Indian:          "🇮🇳",
  Indonesian:      "🇮🇩",
  Irish:           "🇮🇪",
  Italian:         "🇮🇹",
  Japanese:        "🇯🇵",
  Liechtensteiner: "🇱🇮",
  Malaysian:       "🇲🇾",
  Mexican:         "🇲🇽",
  Monegasque:      "🇲🇨",
  "New Zealander": "🇳🇿",
  Polish:          "🇵🇱",
  Portuguese:      "🇵🇹",
  Rhodesian:       "🇿🇼",
  Russian:         "🇷🇺",
  "South African": "🇿🇦",
  Spanish:         "🇪🇸",
  Swedish:         "🇸🇪",
  Swiss:           "🇨🇭",
  Thai:            "🇹🇭",
  Uruguayan:       "🇺🇾",
  Venezuelan:      "🇻🇪",
};

/**
 * Returns the flag emoji for a Jolpica nationality adjective string.
 * Returns "🏁" (racing flag) for undefined or unknown nationalities.
 *
 * @example
 * getNationalityFlag("British")   // "🇬🇧"
 * getNationalityFlag(undefined)   // "🏁"
 * getNationalityFlag("Martian")   // "🏁"
 */
export function getNationalityFlag(nationality: string | undefined): string {
  if (!nationality) return "🏁";
  return NATIONALITY_FLAGS[nationality] ?? "🏁";
}
