import { genPredictions } from "./friends";
import { scorePickem } from "@/lib/scoring";

// Ranking GERAL (toda a base 7K) — a casa premia o topo. Tudo mockado.

export const HOUSE_PRIZES = [5000, 2000, 1000]; // Top 3 (R$ em bônus/prêmio)
export const PRIZE_POOL_LABEL = "Prêmio 7K · Top 3 do ranking geral";

const NICKS = [
  "ZéDoApito", "MestreDosPalpites", "Craque10", "FuriaFC", "GoleadorBR",
  "TáticaTotal", "RaioX", "BolaNaRede", "CapitãoAmérica", "DonaDaBola",
  "Maestro", "Pelézinho", "VarOnline", "CartolaPro", "ChuteiraDeOuro",
  "Zaga4", "MeioCampista", "ContraAtaque", "Libero", "ArteiroFC",
  "DriblaTudo", "Pênalti", "EscanteioBR", "TiroLivre", "ÚltimoHomem",
  "GoleiroNinja", "Camisa10", "Torcedor12", "FutebolArte", "PalpiteCerto",
  "R"+"eiDoBolão", "TabelaTática", "GoldenGoal", "OffsideKing", "MarcaçãoSob",
  "JogoAéreo", "BicicletaBR", "ChapéuFC", "CaneladaTop", "ZebraHunter",
  "Profeta", "OlhoClínico", "Estatístico", "FechaOGol", "ToqueDeBola",
];
const AVATARS = ["🦁", "🐯", "🐉", "🦈", "🐲", "🦅", "🐍", "🐺", "🦂", "🐊", "🦉", "🐗"];

export interface CommunityPlayer {
  id: string;
  name: string;
  avatar: string;
  skill: number;
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967296;
}

export const COMMUNITY: CommunityPlayer[] = NICKS.map((name, i) => ({
  id: `c_${i}`,
  name,
  avatar: AVATARS[i % AVATARS.length],
  // skill espalhado entre ~0.40 e ~0.92 (alguns craques no topo)
  skill: 0.4 + hash(name) * 0.52,
}));

// predições pré-computadas (deterministas)
const PREDICTIONS = new Map(
  COMMUNITY.map((p) => [p.id, genPredictions(p.id, p.skill)]),
);

export interface GlobalRow {
  id: string;
  name: string;
  avatar: string;
  points: number;
  position: number;
  isCurrentUser?: boolean;
}

/**
 * Ranking geral com o usuário inserido.
 * `userPoints` = total de pontos do pick'em do usuário (de scorePickem).
 */
export function globalStandings(
  userPoints: number,
  revealed: number,
): { rows: GlobalRow[]; you: GlobalRow; total: number } {
  const rows: GlobalRow[] = COMMUNITY.map((p) => ({
    id: p.id,
    name: p.name,
    avatar: p.avatar,
    points: scorePickem(PREDICTIONS.get(p.id)!, revealed).total,
    position: 0,
  }));
  rows.push({
    id: "you",
    name: "Você",
    avatar: "⭐",
    points: userPoints,
    position: 0,
    isCurrentUser: true,
  });

  rows.sort((a, b) => b.points - a.points);
  rows.forEach((r, i) => (r.position = i + 1));

  const you = rows.find((r) => r.isCurrentUser)!;
  return { rows, you, total: rows.length };
}
