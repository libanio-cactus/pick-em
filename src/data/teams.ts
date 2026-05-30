import type { Team } from "./types";

// Seleções do protótipo (Copa 2026). `code` é a sigla FIFA.
export const TEAMS: Record<string, Team> = {
  // Grupo A
  MEX: { code: "MEX", name: "México", flag: "🇲🇽" },
  KOR: { code: "KOR", name: "Coreia do Sul", flag: "🇰🇷" },
  RSA: { code: "RSA", name: "África do Sul", flag: "🇿🇦" },
  CZE: { code: "CZE", name: "Tchéquia", flag: "🇨🇿" },
  // Grupo B
  CAN: { code: "CAN", name: "Canadá", flag: "🇨🇦" },
  SUI: { code: "SUI", name: "Suíça", flag: "🇨🇭" },
  BIH: { code: "BIH", name: "Bósnia", flag: "🇧🇦" },
  QAT: { code: "QAT", name: "Catar", flag: "🇶🇦" },
  // Grupo C
  BRA: { code: "BRA", name: "Brasil", flag: "🇧🇷" },
  MAR: { code: "MAR", name: "Marrocos", flag: "🇲🇦" },
  SCO: { code: "SCO", name: "Escócia", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
  HAI: { code: "HAI", name: "Haiti", flag: "🇭🇹" },
  // Grupo D
  ARG: { code: "ARG", name: "Argentina", flag: "🇦🇷" },
  NOR: { code: "NOR", name: "Noruega", flag: "🇳🇴" },
  NGA: { code: "NGA", name: "Nigéria", flag: "🇳🇬" },
  AUS: { code: "AUS", name: "Austrália", flag: "🇦🇺" },
};

export function team(code: string): Team {
  return TEAMS[code];
}
