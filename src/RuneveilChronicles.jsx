import { useState, useEffect, useCallback, useRef, useMemo } from "react";

// ═══════════════════════════════════════════════════════
// 🎮 RUNEVEIL CHRONICLES - A Pixel Art Monster RPG
// ═══════════════════════════════════════════════════════
// LORE:
// En el mundo de Runeveil, cinco cristales ancestrales
// mantienen el equilibrio entre las fuerzas elementales.
// Hace mil años, el Sabio Oscuro Malachar intentó
// fusionar los cristales para obtener poder absoluto,
// pero fue derrotado por los Guardianes Rúnicos.
// Ahora, las runas se debilitan y criaturas salvajes
// llamadas "Veilborn" emergen de las grietas dimensionales.
// Tú eres el último descendiente de los Guardianes,
// y debes capturar y entrenar Veilborn para restaurar
// los cristales antes de que Malachar regrese.
// ═══════════════════════════════════════════════════════

const TILE = 32;
const MAP_W = 20;
const MAP_H = 15;
const VIEW_W = 10;
const VIEW_H = 8;

// Creature database
const CREATURES = [
  { id: 0, name: "Pyrox", type: "fire", hp: 45, atk: 12, def: 8, spd: 10,
    color: "#e74c3c", accent: "#f39c12", moves: ["Llamarada", "Garra Ígnea", "Escudo Calor", "Inferno"],
    desc: "Un zorro de fuego nacido de las cenizas del primer cristal." },
  { id: 1, name: "Aqualis", type: "water", hp: 50, atk: 10, def: 12, spd: 8,
    color: "#3498db", accent: "#1abc9c", moves: ["Torrente", "Burbuja Ácida", "Marea Alta", "Tsunami"],
    desc: "Serpiente marina que controla las corrientes del Velo." },
  { id: 2, name: "Thornex", type: "earth", hp: 55, atk: 11, def: 14, spd: 6,
    color: "#27ae60", accent: "#8B4513", moves: ["Latigazo", "Raíz Trampa", "Espina Venenosa", "Terremoto"],
    desc: "Criatura vegetal con raíces que penetran dimensiones." },
  { id: 3, name: "Zephyra", type: "wind", hp: 40, atk: 13, def: 7, spd: 14,
    color: "#9b59b6", accent: "#ecf0f1", moves: ["Ráfaga Cortante", "Torbellino", "Pluma Afilada", "Ciclón"],
    desc: "Ave mística que surca las brechas entre mundos." },
  { id: 4, name: "Luxar", type: "light", hp: 48, atk: 14, def: 9, spd: 11,
    color: "#f1c40f", accent: "#ffffff", moves: ["Rayo Solar", "Destello", "Aura Sagrada", "Nova"],
    desc: "Guardián de luz pura, fragmento del cristal original." },
  { id: 5, name: "Umbrix", type: "dark", hp: 52, atk: 15, def: 10, spd: 9,
    color: "#2c3e50", accent: "#8e44ad", moves: ["Garra Sombría", "Niebla Oscura", "Vacío", "Eclipse"],
    desc: "Nacido de la sombra de Malachar, busca redención." },
  { id: 6, name: "Criomaw", type: "water", hp: 46, atk: 11, def: 11, spd: 9,
    color: "#85C1E9", accent: "#D6EAF8", moves: ["Aliento Gélido", "Cristal de Hielo", "Ventisca", "Cero Absoluto"],
    desc: "Lobo de hielo que habita las cumbres del Velo Norte." },
  { id: 7, name: "Drakonil", type: "fire", hp: 60, atk: 16, def: 11, spd: 7,
    color: "#C0392B", accent: "#E74C3C", moves: ["Aliento Dragón", "Cola Férrea", "Rugido", "Meteoro"],
    desc: "El dragón ancestral, primer Veilborn en cruzar el Velo." },
];

const TYPE_CHART = {
  fire: { fire: 0.5, water: 0.5, earth: 2, wind: 1, light: 1, dark: 1 },
  water: { fire: 2, water: 0.5, earth: 0.5, wind: 1, light: 1, dark: 1 },
  earth: { fire: 0.5, water: 2, earth: 0.5, wind: 2, light: 1, dark: 1 },
  wind: { fire: 1, water: 1, earth: 0.5, wind: 0.5, light: 2, dark: 0.5 },
  light: { fire: 1, water: 1, earth: 1, wind: 0.5, light: 0.5, dark: 2 },
  dark: { fire: 1, water: 1, earth: 1, wind: 2, light: 0.5, dark: 0.5 },
};

const TYPE_COLORS = {
  fire: "#e74c3c", water: "#3498db", earth: "#27ae60",
  wind: "#9b59b6", light: "#f1c40f", dark: "#2c3e50",
};

// Map legend: 0=grass, 1=tree, 2=water, 3=path, 4=house, 5=crystal, 6=bridge, 7=flower, 8=rock
const WORLD_MAP = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,3,3,3,0,0,7,0,1,1,1,0,0,7,0,0,3,3,3,1],
  [1,3,4,3,0,7,0,0,0,1,1,0,0,0,7,0,3,4,3,1],
  [1,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,3,3,3,1],
  [1,0,0,0,0,0,8,0,0,3,3,0,0,8,0,0,0,0,0,1],
  [1,0,7,0,0,3,3,3,3,3,3,3,3,3,3,0,0,7,0,1],
  [1,0,0,0,0,3,0,0,0,0,0,0,0,0,3,0,0,0,0,1],
  [1,0,0,8,0,3,0,0,5,0,0,5,0,0,3,0,8,0,0,1],
  [1,0,0,0,0,3,0,0,0,0,0,0,0,0,3,0,0,0,0,1],
  [1,2,2,0,0,3,3,3,3,6,6,3,3,3,3,0,0,2,2,1],
  [1,2,2,2,0,0,0,0,0,2,2,0,0,0,0,0,2,2,2,1],
  [1,0,2,0,0,7,0,0,2,2,2,2,0,0,7,0,0,2,0,1],
  [1,0,0,0,0,0,0,0,0,2,2,0,0,0,0,0,0,0,0,1],
  [1,7,0,0,8,0,7,0,0,0,0,0,0,7,0,8,0,0,7,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

const WALKABLE = new Set([0, 3, 6, 7]);
const ENCOUNTER_TILES = new Set([0, 7]);

const NPC_DATA = [
  { x: 3, y: 1, name: "Profesor Elm", color: "#ecf0f1",
    dialog: [
      "¡Bienvenido, joven Guardián!",
      "El mundo de Runeveil está en peligro...",
      "Los cristales dimensionales se debilitan.",
      "Malachar, el Sabio Oscuro, intenta regresar.",
      "Debes capturar Veilborn y restaurar los cristales.",
      "Usa las Runesferas para atrapar criaturas debilitadas.",
      "¡El destino de Runeveil está en tus manos!",
    ]},
  { x: 17, y: 1, name: "Guardiana Lyra", color: "#e74c3c",
    dialog: [
      "Soy Lyra, Guardiana del Cristal Norte.",
      "He sentido perturbaciones en el Velo...",
      "Los Veilborn se vuelven más agresivos.",
      "Ten cuidado en la hierba alta.",
      "Si debilitas un Veilborn, podrás capturarlo.",
    ]},
  { x: 10, y: 5, name: "Mercader Rook", color: "#f39c12",
    dialog: [
      "¡Saludos, viajero! Soy Rook.",
      "Vendo Runesferas y pociones... bueno, las regalo.",
      "Toma, +3 Runesferas y +2 Pociones. ¡Gratis!",
      "(Tu inventario ha sido actualizado)",
    ]},
];

// ── Pixel Art Renderers ──
function CreatureSprite({ creature, size = 64, flip = false, anim = "" }) {
  const s = size;
  const c = creature.color;
  const a = creature.accent;
  const animStyle = anim === "shake" 
    ? { animation: "shake 0.3s ease-in-out" }
    : anim === "flash"
    ? { animation: "flash 0.5s ease-in-out" }
    : {};

  return (
    <svg width={s} height={s} viewBox="0 0 16 16" 
      style={{ imageRendering: "pixelated", transform: flip ? "scaleX(-1)" : "none", ...animStyle }}>
      {creature.type === "fire" && <>
        <rect x="5" y="3" width="6" height="6" fill={c} />
        <rect x="4" y="4" width="1" height="4" fill={c} />
        <rect x="11" y="4" width="1" height="4" fill={c} />
        <rect x="6" y="2" width="2" height="1" fill={a} />
        <rect x="9" y="2" width="2" height="1" fill={a} />
        <rect x="6" y="5" width="1" height="1" fill="#fff" />
        <rect x="9" y="5" width="1" height="1" fill="#fff" />
        <rect x="7" y="7" width="2" height="1" fill={a} />
        <rect x="5" y="9" width="2" height="3" fill={c} />
        <rect x="9" y="9" width="2" height="3" fill={c} />
        <rect x="3" y="4" width="1" height="2" fill={a} />
        <rect x="12" y="4" width="1" height="2" fill={a} />
        <rect x="7" y="1" width="2" height="1" fill={a} />
      </>}
      {creature.type === "water" && <>
        <rect x="5" y="2" width="6" height="5" fill={c} />
        <rect x="4" y="3" width="1" height="3" fill={c} />
        <rect x="11" y="3" width="1" height="3" fill={c} />
        <rect x="6" y="4" width="1" height="1" fill="#fff" />
        <rect x="9" y="4" width="1" height="1" fill="#fff" />
        <rect x="6" y="7" width="4" height="2" fill={c} />
        <rect x="5" y="9" width="6" height="2" fill={a} />
        <rect x="4" y="11" width="3" height="1" fill={a} />
        <rect x="9" y="11" width="3" height="1" fill={a} />
        <rect x="7" y="6" width="2" height="1" fill={a} />
        <rect x="3" y="5" width="2" height="1" fill={c} />
        <rect x="11" y="5" width="2" height="1" fill={c} />
      </>}
      {creature.type === "earth" && <>
        <rect x="4" y="3" width="8" height="7" fill={c} />
        <rect x="3" y="4" width="1" height="5" fill={c} />
        <rect x="12" y="4" width="1" height="5" fill={c} />
        <rect x="5" y="5" width="2" height="1" fill="#fff" />
        <rect x="9" y="5" width="2" height="1" fill="#fff" />
        <rect x="6" y="8" width="4" height="1" fill={a} />
        <rect x="5" y="10" width="2" height="3" fill={a} />
        <rect x="9" y="10" width="2" height="3" fill={a} />
        <rect x="5" y="2" width="2" height="1" fill={c} />
        <rect x="9" y="2" width="2" height="1" fill={c} />
        <rect x="4" y="1" width="1" height="2" fill="#228B22" />
        <rect x="11" y="1" width="1" height="2" fill="#228B22" />
      </>}
      {creature.type === "wind" && <>
        <rect x="6" y="4" width="4" height="4" fill={c} />
        <rect x="5" y="5" width="1" height="2" fill={c} />
        <rect x="10" y="5" width="1" height="2" fill={c} />
        <rect x="7" y="5" width="1" height="1" fill="#fff" />
        <rect x="9" y="5" width="1" height="1" fill="#fff" />
        <rect x="3" y="4" width="3" height="3" fill={a} rx="0" />
        <rect x="10" y="4" width="3" height="3" fill={a} rx="0" />
        <rect x="2" y="5" width="2" height="1" fill={c} />
        <rect x="12" y="5" width="2" height="1" fill={c} />
        <rect x="7" y="8" width="2" height="2" fill={c} />
        <rect x="6" y="10" width="1" height="2" fill={c} />
        <rect x="9" y="10" width="1" height="2" fill={c} />
        <rect x="7" y="3" width="2" height="1" fill={a} />
      </>}
      {creature.type === "light" && <>
        <rect x="5" y="3" width="6" height="6" fill={c} />
        <rect x="4" y="4" width="1" height="4" fill={c} />
        <rect x="11" y="4" width="1" height="4" fill={c} />
        <rect x="6" y="5" width="1" height="1" fill="#fff" />
        <rect x="9" y="5" width="1" height="1" fill="#fff" />
        <rect x="7" y="7" width="2" height="1" fill={a} />
        <rect x="5" y="9" width="2" height="3" fill={c} />
        <rect x="9" y="9" width="2" height="3" fill={c} />
        <rect x="3" y="2" width="2" height="2" fill={a} />
        <rect x="11" y="2" width="2" height="2" fill={a} />
        <rect x="7" y="1" width="2" height="2" fill={a} />
        <rect x="2" y="5" width="2" height="1" fill="#FFD700" />
        <rect x="12" y="5" width="2" height="1" fill="#FFD700" />
      </>}
      {creature.type === "dark" && <>
        <rect x="4" y="3" width="8" height="7" fill={c} />
        <rect x="3" y="4" width="1" height="5" fill={c} />
        <rect x="12" y="4" width="1" height="5" fill={c} />
        <rect x="5" y="5" width="2" height="1" fill={a} />
        <rect x="9" y="5" width="2" height="1" fill={a} />
        <rect x="6" y="5" width="1" height="1" fill="#e74c3c" />
        <rect x="10" y="5" width="1" height="1" fill="#e74c3c" />
        <rect x="6" y="8" width="4" height="1" fill={a} />
        <rect x="5" y="10" width="2" height="3" fill={c} />
        <rect x="9" y="10" width="2" height="3" fill={c} />
        <rect x="4" y="2" width="2" height="1" fill={a} />
        <rect x="10" y="2" width="2" height="1" fill={a} />
        <rect x="3" y="1" width="1" height="2" fill={a} />
        <rect x="12" y="1" width="1" height="2" fill={a} />
      </>}
    </svg>
  );
}

function PlayerSprite({ dir, frame }) {
  return (
    <svg width={TILE} height={TILE} viewBox="0 0 16 16" style={{ imageRendering: "pixelated" }}>
      <rect x="6" y="1" width="4" height="4" fill="#f5cba7" />
      <rect x="6" y="0" width="4" height="2" fill="#5D4E37" />
      <rect x="5" y="1" width="1" height="1" fill="#5D4E37" />
      <rect x="10" y="1" width="1" height="1" fill="#5D4E37" />
      <rect x="7" y="3" width="1" height="1" fill="#2c3e50" />
      <rect x="9" y="3" width="1" height="1" fill="#2c3e50" />
      <rect x="5" y="5" width="6" height="5" fill="#2980b9" />
      <rect x="4" y="5" width="1" height="4" fill="#2980b9" />
      <rect x="11" y="5" width="1" height="4" fill="#2980b9" />
      <rect x="3" y="6" width="1" height="3" fill="#f5cba7" />
      <rect x="12" y="6" width="1" height="3" fill="#f5cba7" />
      <rect x="6" y="10" width="2" height="3" fill="#2c3e50" />
      <rect x="9" y="10" width="2" height="3" fill="#2c3e50" />
      {frame % 2 === 1 && dir === "left" && <rect x="5" y="11" width="2" height="2" fill="#2c3e50" />}
      {frame % 2 === 1 && dir === "right" && <rect x="9" y="11" width="2" height="2" fill="#2c3e50" />}
      <rect x="7" y="5" width="2" height="1" fill="#e74c3c" />
    </svg>
  );
}

function NPCSprite({ color }) {
  return (
    <svg width={TILE} height={TILE} viewBox="0 0 16 16" style={{ imageRendering: "pixelated" }}>
      <rect x="6" y="1" width="4" height="4" fill="#f5cba7" />
      <rect x="6" y="0" width="4" height="2" fill={color} />
      <rect x="5" y="1" width="1" height="1" fill={color} />
      <rect x="10" y="1" width="1" height="1" fill={color} />
      <rect x="7" y="3" width="1" height="1" fill="#2c3e50" />
      <rect x="9" y="3" width="1" height="1" fill="#2c3e50" />
      <rect x="5" y="5" width="6" height="5" fill={color} />
      <rect x="4" y="5" width="1" height="4" fill={color} />
      <rect x="11" y="5" width="1" height="4" fill={color} />
      <rect x="6" y="10" width="2" height="3" fill="#34495e" />
      <rect x="9" y="10" width="2" height="3" fill="#34495e" />
    </svg>
  );
}

function Tile({ type }) {
  const colors = {
    0: ["#4a7c3f", "#5a8c4f", "#4a7c3f"], // grass
    1: ["#2d5016", "#3d6a1e", "#228B22"], // tree
    2: ["#2471a3", "#2e86c1", "#3498db"], // water
    3: ["#c2a06e", "#d4b87c", "#c2a06e"], // path
    4: ["#8B4513", "#A0522D", "#cd853f"], // house
    5: ["#9b59b6", "#bb77dd", "#e8d5f5"], // crystal
    6: ["#8B7355", "#a08060", "#8B7355"], // bridge
    7: ["#4a7c3f", "#e74c3c", "#f39c12"], // flower
    8: ["#7f8c8d", "#95a5a6", "#7f8c8d"], // rock
  };
  const [c1, c2, c3] = colors[type] || colors[0];

  return (
    <svg width={TILE} height={TILE} viewBox="0 0 16 16" style={{ imageRendering: "pixelated" }}>
      <rect width="16" height="16" fill={c1} />
      {type === 0 && <>
        <rect x="3" y="5" width="1" height="2" fill={c2} />
        <rect x="10" y="9" width="1" height="2" fill={c2} />
        <rect x="7" y="13" width="1" height="2" fill={c2} />
      </>}
      {type === 1 && <>
        <rect x="6" y="0" width="4" height="6" fill={c3} />
        <rect x="4" y="2" width="8" height="4" fill={c2} />
        <rect x="3" y="4" width="10" height="3" fill={c3} />
        <rect x="7" y="7" width="2" height="5" fill="#5D4037" />
        <rect x="7" y="12" width="2" height="4" fill="#4E342E" />
      </>}
      {type === 2 && <>
        <rect width="16" height="16" fill={c1} />
        <rect x="2" y="4" width="4" height="1" fill={c2} />
        <rect x="8" y="10" width="5" height="1" fill={c3} />
      </>}
      {type === 3 && <>
        <rect width="16" height="16" fill={c1} />
        <rect x="1" y="3" width="2" height="1" fill={c2} />
        <rect x="8" y="8" width="2" height="1" fill={c2} />
        <rect x="12" y="13" width="2" height="1" fill={c2} />
      </>}
      {type === 4 && <>
        <rect x="2" y="4" width="12" height="10" fill={c1} />
        <rect x="1" y="3" width="14" height="2" fill={c2} />
        <rect x="0" y="2" width="16" height="2" fill={c3} />
        <rect x="6" y="8" width="4" height="6" fill="#5D4037" />
        <rect x="4" y="6" width="3" height="3" fill="#AED6F1" />
        <rect x="10" y="6" width="3" height="3" fill="#AED6F1" />
      </>}
      {type === 5 && <>
        <rect width="16" height="16" fill="#4a7c3f" />
        <rect x="6" y="2" width="4" height="8" fill={c1} />
        <rect x="5" y="3" width="6" height="6" fill={c2} />
        <rect x="7" y="4" width="2" height="3" fill={c3} />
        <rect x="6" y="10" width="4" height="3" fill="#7f8c8d" />
      </>}
      {type === 6 && <>
        <rect width="16" height="16" fill="#2471a3" />
        <rect x="0" y="3" width="16" height="10" fill={c1} />
        <rect x="0" y="3" width="16" height="2" fill={c2} />
        <rect x="0" y="11" width="16" height="2" fill={c2} />
        <rect x="3" y="5" width="2" height="6" fill={c2} />
        <rect x="11" y="5" width="2" height="6" fill={c2} />
      </>}
      {type === 7 && <>
        <rect x="4" y="6" width="2" height="2" fill={c2} />
        <rect x="5" y="5" width="1" height="1" fill={c3} />
        <rect x="10" y="9" width="2" height="2" fill={c3} />
        <rect x="11" y="8" width="1" height="1" fill={c2} />
        <rect x="3" y="10" width="1" height="3" fill={c2} />
      </>}
      {type === 8 && <>
        <rect width="16" height="16" fill="#4a7c3f" />
        <rect x="3" y="5" width="10" height="8" fill={c1} />
        <rect x="4" y="4" width="8" height="2" fill={c2} />
        <rect x="5" y="6" width="3" height="2" fill={c3} />
      </>}
    </svg>
  );
}

// HP Bar Component
function HPBar({ current, max, height = 6 }) {
  const pct = Math.max(0, current / max);
  const color = pct > 0.5 ? "#2ecc71" : pct > 0.2 ? "#f39c12" : "#e74c3c";
  return (
    <div style={{ width: "100%", height, background: "#1a1a2e", borderRadius: 3, overflow: "hidden", border: "1px solid #333" }}>
      <div style={{ width: `${pct * 100}%`, height: "100%", background: color, transition: "width 0.5s ease" }} />
    </div>
  );
}

// ── Main Game Component ──
export default function RuneveilChronicles() {
  const [screen, setScreen] = useState("title");
  const [player, setPlayer] = useState({ x: 5, y: 5, dir: "down", frame: 0 });
  const [party, setParty] = useState([]);
  const [bag, setBag] = useState({ spheres: 5, potions: 3 });
  const [battleState, setBattleState] = useState(null);
  const [dialogState, setDialogState] = useState(null);
  const [msgLog, setMsgLog] = useState([]);
  const [starterPicked, setStarterPicked] = useState(false);
  const [steps, setSteps] = useState(0);
  const [showParty, setShowParty] = useState(false);
  const [rookGave, setRookGave] = useState(false);
  const [battleAnim, setBattleAnim] = useState({ player: "", enemy: "" });
  const [caughtLog, setCaughtLog] = useState([]);
  const gameRef = useRef(null);

  const addMsg = useCallback((m) => setMsgLog(p => [...p.slice(-4), m]), []);

  // ── Start game ──
  const startGame = () => {
    setScreen("starter");
  };

  const pickStarter = (id) => {
    const c = { ...CREATURES[id], currentHp: CREATURES[id].hp, level: 5, xp: 0 };
    setParty([c]);
    setStarterPicked(true);
    setScreen("world");
    addMsg(`¡${c.name} se unió a tu equipo!`);
    setTimeout(() => gameRef.current?.focus(), 100);
  };

  // ── Movement ──
  const movePlayer = useCallback((dx, dy) => {
    if (screen !== "world" || dialogState || showParty) return;
    setPlayer(p => {
      const nx = p.x + dx;
      const ny = p.y + dy;
      const dir = dx < 0 ? "left" : dx > 0 ? "right" : dy < 0 ? "up" : "down";
      if (nx < 0 || nx >= MAP_W || ny < 0 || ny >= MAP_H) return { ...p, dir };
      const tile = WORLD_MAP[ny][nx];
      
      // Check NPC collision
      const npc = NPC_DATA.find(n => n.x === nx && n.y === ny);
      if (npc) {
        setDialogState({ npc, line: 0 });
        return { ...p, dir };
      }
      
      if (!WALKABLE.has(tile)) return { ...p, dir };
      
      setSteps(s => s + 1);
      
      // Random encounter
      if (ENCOUNTER_TILES.has(tile) && Math.random() < 0.12) {
        const available = CREATURES.filter(c => !party.some(pc => pc.id === c.id) || true);
        const wild = available[Math.floor(Math.random() * available.length)];
        const lvl = 3 + Math.floor(Math.random() * 8);
        const hpBonus = Math.floor(lvl * 1.5);
        setTimeout(() => {
          setBattleState({
            wild: { ...wild, level: lvl, currentHp: wild.hp + hpBonus, hp: wild.hp + hpBonus },
            turn: "player",
            menu: "main",
            msg: `¡Un ${wild.name} salvaje (Nv.${lvl}) apareció!`,
          });
          setScreen("battle");
        }, 100);
      }
      
      return { x: nx, y: ny, dir, frame: p.frame + 1 };
    });
  }, [screen, dialogState, showParty, party]);

  // ── Key handling ──
  useEffect(() => {
    const handler = (e) => {
      if (screen === "world" && !dialogState && !showParty) {
        switch (e.key) {
          case "ArrowUp": case "w": case "W": movePlayer(0, -1); break;
          case "ArrowDown": case "s": case "S": movePlayer(0, 1); break;
          case "ArrowLeft": case "a": case "A": movePlayer(-1, 0); break;
          case "ArrowRight": case "d": case "D": movePlayer(1, 0); break;
          case "p": case "P": setShowParty(sp => !sp); break;
        }
      }
      if (dialogState && (e.key === "Enter" || e.key === " ")) {
        advanceDialog();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [screen, dialogState, showParty, movePlayer]);

  // Dialog handler
  const advanceDialog = () => {
    if (!dialogState) return;
    const { npc, line } = dialogState;
    // Rook gives items
    if (npc.name === "Mercader Rook" && line === 2 && !rookGave) {
      setBag(b => ({ spheres: b.spheres + 3, potions: b.potions + 2 }));
      setRookGave(true);
      addMsg("¡Recibiste 3 Runesferas y 2 Pociones!");
    }
    if (line + 1 >= npc.dialog.length) {
      setDialogState(null);
    } else {
      setDialogState({ npc, line: line + 1 });
    }
  };

  // ── Battle System ──
  const calcDamage = (attacker, defender, moveIdx) => {
    const baseDmg = attacker.atk + attacker.level;
    const typeMul = TYPE_CHART[attacker.type]?.[defender.type] || 1;
    const movePower = 8 + moveIdx * 4;
    const rand = 0.85 + Math.random() * 0.3;
    return Math.max(1, Math.floor((baseDmg * movePower * typeMul * rand) / (defender.def + 10)));
  };

  const doBattleAttack = (moveIdx) => {
    if (!battleState || battleState.turn !== "player") return;
    const active = party[0];
    const wild = battleState.wild;
    const dmg = calcDamage(active, wild, moveIdx);
    const typeMul = TYPE_CHART[active.type]?.[wild.type] || 1;
    let effText = typeMul > 1 ? " ¡Súper efectivo!" : typeMul < 1 ? " No muy efectivo..." : "";
    
    setBattleAnim({ player: "", enemy: "shake" });
    setTimeout(() => setBattleAnim({ player: "", enemy: "" }), 400);
    
    const newWildHp = Math.max(0, wild.currentHp - dmg);
    
    if (newWildHp <= 0) {
      const xpGain = wild.level * 8;
      setBattleState(s => ({ ...s, wild: { ...s.wild, currentHp: 0 }, turn: "none",
        msg: `${active.moves[moveIdx]} hizo ${dmg} de daño.${effText} ¡${wild.name} derrotado! +${xpGain} XP` }));
      
      setTimeout(() => {
        setParty(p => {
          const np = [...p];
          np[0] = { ...np[0], xp: np[0].xp + xpGain };
          if (np[0].xp >= np[0].level * 20) {
            np[0] = { ...np[0], level: np[0].level + 1, xp: 0,
              hp: np[0].hp + 3, currentHp: np[0].currentHp + 3,
              atk: np[0].atk + 1, def: np[0].def + 1, spd: np[0].spd + 1 };
            addMsg(`¡${np[0].name} subió al Nv.${np[0].level}!`);
          }
          return np;
        });
        setScreen("world");
        setBattleState(null);
        setTimeout(() => gameRef.current?.focus(), 100);
      }, 1800);
      return;
    }

    // Enemy turn
    setBattleState(s => ({ ...s, wild: { ...s.wild, currentHp: newWildHp }, turn: "enemy",
      msg: `${active.moves[moveIdx]} hizo ${dmg} de daño.${effText}` }));
    
    setTimeout(() => {
      const eMoveIdx = Math.floor(Math.random() * 4);
      const eDmg = calcDamage(wild, active, eMoveIdx);
      setBattleAnim({ player: "shake", enemy: "" });
      setTimeout(() => setBattleAnim({ player: "", enemy: "" }), 400);
      
      const newPlayerHp = Math.max(0, active.currentHp - eDmg);
      setParty(p => { const np = [...p]; np[0] = { ...np[0], currentHp: newPlayerHp }; return np; });
      
      if (newPlayerHp <= 0) {
        setBattleState(s => ({ ...s, turn: "none",
          msg: `${wild.name} usó ${wild.moves[eMoveIdx]} (${eDmg} dmg). ¡${active.name} cayó! Regresando al pueblo...` }));
        setTimeout(() => {
          setParty(p => p.map(c => ({ ...c, currentHp: Math.max(1, Math.floor(c.hp * 0.5)) })));
          setPlayer({ x: 5, y: 5, dir: "down", frame: 0 });
          setScreen("world");
          setBattleState(null);
          addMsg("Tus Veilborn fueron curados parcialmente.");
          setTimeout(() => gameRef.current?.focus(), 100);
        }, 2000);
      } else {
        setBattleState(s => ({ ...s, turn: "player",
          msg: `${wild.name} usó ${wild.moves[eMoveIdx]} (${eDmg} dmg).` }));
      }
    }, 1000);
  };

  const tryCapture = () => {
    if (!battleState || battleState.turn !== "player") return;
    if (bag.spheres <= 0) {
      setBattleState(s => ({ ...s, msg: "¡No tienes Runesferas!" }));
      return;
    }
    setBag(b => ({ ...b, spheres: b.spheres - 1 }));
    const wild = battleState.wild;
    const hpPct = wild.currentHp / wild.hp;
    const catchRate = Math.max(0.1, (1 - hpPct) * 0.7 + 0.15);
    
    if (Math.random() < catchRate) {
      const caught = { ...wild, currentHp: wild.currentHp, xp: 0 };
      setBattleState(s => ({ ...s, turn: "none", msg: `¡Capturaste a ${wild.name}! ¡Se unió a tu equipo!` }));
      setCaughtLog(cl => [...cl, wild.name]);
      setTimeout(() => {
        setParty(p => [...p, caught]);
        setScreen("world");
        setBattleState(null);
        addMsg(`¡${wild.name} (Nv.${wild.level}) fue capturado!`);
        setTimeout(() => gameRef.current?.focus(), 100);
      }, 1800);
    } else {
      setBattleState(s => ({ ...s, turn: "enemy", msg: `¡${wild.name} escapó de la Runesfera!` }));
      setTimeout(() => {
        const eMoveIdx = Math.floor(Math.random() * 4);
        const eDmg = calcDamage(wild, party[0], eMoveIdx);
        setBattleAnim({ player: "shake", enemy: "" });
        setTimeout(() => setBattleAnim({ player: "", enemy: "" }), 400);
        const newHp = Math.max(0, party[0].currentHp - eDmg);
        setParty(p => { const np = [...p]; np[0] = { ...np[0], currentHp: newHp }; return np; });
        setBattleState(s => ({ ...s, turn: "player", msg: `${wild.name} usó ${wild.moves[eMoveIdx]} (${eDmg} dmg).` }));
      }, 1000);
    }
  };

  const usePotion = () => {
    if (bag.potions <= 0) { setBattleState(s => ({ ...s, msg: "¡No tienes Pociones!" })); return; }
    setBag(b => ({ ...b, potions: b.potions - 1 }));
    const heal = 20;
    setParty(p => { const np = [...p]; np[0] = { ...np[0], currentHp: Math.min(np[0].hp, np[0].currentHp + heal) }; return np; });
    setBattleState(s => ({ ...s, msg: `¡${party[0].name} recuperó ${heal} HP!`, turn: "enemy" }));
    setTimeout(() => {
      const wild = battleState.wild;
      const eMoveIdx = Math.floor(Math.random() * 4);
      const eDmg = calcDamage(wild, party[0], eMoveIdx);
      setBattleAnim({ player: "shake", enemy: "" });
      setTimeout(() => setBattleAnim({ player: "", enemy: "" }), 400);
      const newHp = Math.max(0, party[0].currentHp - eDmg + 20);
      setParty(p => { const np = [...p]; np[0] = { ...np[0], currentHp: Math.max(0, newHp) }; return np; });
      setBattleState(s => ({ ...s, turn: "player", msg: `${wild.name} usó ${wild.moves[eMoveIdx]} (${eDmg} dmg).` }));
    }, 1000);
  };

  const tryRun = () => {
    if (Math.random() < 0.6) {
      setScreen("world");
      setBattleState(null);
      addMsg("¡Escapaste con éxito!");
      setTimeout(() => gameRef.current?.focus(), 100);
    } else {
      setBattleState(s => ({ ...s, msg: "¡No pudiste escapar!", turn: "enemy" }));
      setTimeout(() => {
        const wild = battleState.wild;
        const eMoveIdx = Math.floor(Math.random() * 4);
        const eDmg = calcDamage(wild, party[0], eMoveIdx);
        const newHp = Math.max(0, party[0].currentHp - eDmg);
        setParty(p => { const np = [...p]; np[0] = { ...np[0], currentHp: newHp }; return np; });
        setBattleState(s => ({ ...s, turn: "player", msg: `${wild.name} usó ${wild.moves[eMoveIdx]} (${eDmg} dmg).` }));
      }, 800);
    }
  };

  // ── Camera ──
  const camX = Math.max(0, Math.min(MAP_W - VIEW_W, player.x - Math.floor(VIEW_W / 2)));
  const camY = Math.max(0, Math.min(MAP_H - VIEW_H, player.y - Math.floor(VIEW_H / 2)));

  // ── RENDER ──
  const containerStyle = {
    width: "100%", maxWidth: 480, margin: "0 auto", fontFamily: "'Courier New', monospace",
    background: "#0a0a1a", color: "#ecf0f1", borderRadius: 8, overflow: "hidden",
    userSelect: "none", position: "relative",
  };

  // TITLE SCREEN
  if (screen === "title") {
    return (
      <div style={containerStyle}>
        <style>{`
          @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
          @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
          @keyframes shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
          @keyframes flash { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }
          @keyframes glow { 0%,100% { text-shadow: 0 0 10px #9b59b6; } 50% { text-shadow: 0 0 25px #e74c3c, 0 0 40px #9b59b6; } }
        `}</style>
        <div style={{ padding: "40px 20px", textAlign: "center", background: "linear-gradient(180deg, #1a0a2e 0%, #0a0a1a 50%, #0a1a0a 100%)", minHeight: 400 }}>
          <div style={{ fontSize: 12, color: "#9b59b6", letterSpacing: 4, marginBottom: 8 }}>⚔ ANTHROPIC GAMES PRESENTA ⚔</div>
          <h1 style={{ fontSize: 28, margin: "20px 0", animation: "glow 3s infinite", color: "#f1c40f", letterSpacing: 2 }}>
            ✦ RUNEVEIL ✦
          </h1>
          <div style={{ fontSize: 16, color: "#e74c3c", letterSpacing: 3, marginBottom: 30 }}>CHRONICLES</div>
          
          <div style={{ animation: "float 3s ease-in-out infinite", margin: "20px 0" }}>
            <svg width={80} height={80} viewBox="0 0 16 16" style={{ imageRendering: "pixelated" }}>
              <rect x="6" y="2" width="4" height="8" fill="#9b59b6" />
              <rect x="5" y="3" width="6" height="6" fill="#bb77dd" />
              <rect x="7" y="4" width="2" height="3" fill="#e8d5f5" />
              <rect x="6" y="10" width="4" height="3" fill="#7f8c8d" />
            </svg>
          </div>
          
          <div style={{ fontSize: 11, color: "#7f8c8d", margin: "15px 0", lineHeight: 1.6, maxWidth: 350, marginLeft: "auto", marginRight: "auto" }}>
            "Los cristales dimensionales se debilitan...<br/>
            El Sabio Oscuro Malachar se agita en su prisión...<br/>
            Solo un Guardián Rúnico puede salvar Runeveil."
          </div>
          
          <button onClick={startGame} style={{
            padding: "12px 40px", fontSize: 16, background: "linear-gradient(135deg, #9b59b6, #e74c3c)",
            color: "#fff", border: "2px solid #f1c40f", borderRadius: 4, cursor: "pointer",
            animation: "pulse 2s infinite", letterSpacing: 2, fontFamily: "inherit",
            marginTop: 20,
          }}>
            ▶ NUEVA PARTIDA
          </button>
          
          <div style={{ marginTop: 30, fontSize: 10, color: "#555" }}>
            Controles: WASD/Flechas = Mover | P = Equipo | Enter = Interactuar
          </div>
        </div>
      </div>
    );
  }

  // STARTER SELECTION
  if (screen === "starter") {
    const starters = [CREATURES[0], CREATURES[1], CREATURES[2]];
    return (
      <div style={containerStyle}>
        <div style={{ padding: "30px 15px", textAlign: "center", background: "linear-gradient(180deg, #1a0a2e, #0a0a1a)" }}>
          <h2 style={{ color: "#f1c40f", fontSize: 18, marginBottom: 5 }}>Profesor Elm</h2>
          <p style={{ color: "#bbb", fontSize: 12, marginBottom: 20 }}>
            "Joven Guardián, elige tu primer Veilborn compañero. Cada uno porta el poder de un cristal ancestral."
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            {starters.map(c => (
              <button key={c.id} onClick={() => pickStarter(c.id)} style={{
                padding: 15, background: "#1a1a2e", border: `2px solid ${c.color}`,
                borderRadius: 8, cursor: "pointer", width: 130, textAlign: "center",
                transition: "all 0.2s",
              }}
              onMouseOver={e => e.currentTarget.style.background = "#2a2a3e"}
              onMouseOut={e => e.currentTarget.style.background = "#1a1a2e"}>
                <CreatureSprite creature={c} size={56} />
                <div style={{ color: c.color, fontWeight: "bold", fontSize: 14, marginTop: 5 }}>{c.name}</div>
                <div style={{ color: TYPE_COLORS[c.type], fontSize: 11, textTransform: "uppercase" }}>{c.type}</div>
                <div style={{ color: "#888", fontSize: 10, marginTop: 4 }}>{c.desc.slice(0, 50)}...</div>
                <div style={{ color: "#aaa", fontSize: 10, marginTop: 4 }}>
                  HP:{c.hp} ATK:{c.atk} DEF:{c.def} SPD:{c.spd}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // BATTLE SCREEN
  if (screen === "battle" && battleState) {
    const active = party[0];
    const wild = battleState.wild;
    return (
      <div style={containerStyle}>
        <style>{`
          @keyframes shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
          @keyframes flash { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }
        `}</style>
        <div style={{ background: "linear-gradient(180deg, #1a2a1a 0%, #0a1a0a 40%, #1a0a1a 100%)", padding: 15, minHeight: 420 }}>
          {/* Enemy */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <span style={{ color: wild.color, fontWeight: "bold", fontSize: 13 }}>{wild.name}</span>
                <span style={{ color: "#888", fontSize: 10 }}>Nv.{wild.level}</span>
                <span style={{ color: TYPE_COLORS[wild.type], fontSize: 9, padding: "1px 5px", background: "#1a1a2e", borderRadius: 3 }}>{wild.type}</span>
              </div>
              <HPBar current={wild.currentHp} max={wild.hp} />
              <div style={{ color: "#888", fontSize: 10, marginTop: 2 }}>{wild.currentHp}/{wild.hp} HP</div>
            </div>
            <div style={{ marginLeft: 10 }}>
              <div style={battleAnim.enemy === "shake" ? { animation: "shake 0.3s" } : {}}>
                <CreatureSprite creature={wild} size={72} />
              </div>
            </div>
          </div>

          {/* Player creature */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", margin: "15px 0" }}>
            <div style={battleAnim.player === "shake" ? { animation: "shake 0.3s" } : {}}>
              <CreatureSprite creature={active} size={72} flip />
            </div>
            <div style={{ flex: 1, marginLeft: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <span style={{ color: active.color, fontWeight: "bold", fontSize: 13 }}>{active.name}</span>
                <span style={{ color: "#888", fontSize: 10 }}>Nv.{active.level}</span>
                <span style={{ color: TYPE_COLORS[active.type], fontSize: 9, padding: "1px 5px", background: "#1a1a2e", borderRadius: 3 }}>{active.type}</span>
              </div>
              <HPBar current={active.currentHp} max={active.hp} />
              <div style={{ color: "#888", fontSize: 10, marginTop: 2 }}>{active.currentHp}/{active.hp} HP | XP: {active.xp}/{active.level * 20}</div>
            </div>
          </div>

          {/* Message */}
          <div style={{
            background: "#1a1a2e", border: "1px solid #333", borderRadius: 6, padding: "8px 12px",
            fontSize: 12, color: "#ecf0f1", marginBottom: 10, minHeight: 36
          }}>
            {battleState.msg}
          </div>

          {/* Battle menu */}
          {battleState.turn === "player" && battleState.menu === "main" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              <button onClick={() => setBattleState(s => ({ ...s, menu: "moves" }))}
                style={btnStyle("#e74c3c")}>⚔ Atacar</button>
              <button onClick={tryCapture}
                style={btnStyle("#3498db")}>◉ Capturar ({bag.spheres})</button>
              <button onClick={usePotion}
                style={btnStyle("#2ecc71")}>♥ Poción ({bag.potions})</button>
              <button onClick={tryRun}
                style={btnStyle("#95a5a6")}>↩ Huir</button>
            </div>
          )}

          {battleState.turn === "player" && battleState.menu === "moves" && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {active.moves.map((m, i) => (
                  <button key={i} onClick={() => { doBattleAttack(i); setBattleState(s => ({ ...s, menu: "main" })); }}
                    style={btnStyle(active.color)}>
                    {m}
                  </button>
                ))}
              </div>
              <button onClick={() => setBattleState(s => ({ ...s, menu: "main" }))}
                style={{ ...btnStyle("#555"), marginTop: 6, width: "100%" }}>← Volver</button>
            </div>
          )}

          {battleState.turn === "enemy" && (
            <div style={{ textAlign: "center", color: "#f39c12", fontSize: 12, padding: 10 }}>
              Turno del enemigo...
            </div>
          )}
        </div>
      </div>
    );
  }

  // WORLD SCREEN
  return (
    <div style={containerStyle} ref={gameRef} tabIndex={0}>
      <style>{`
        @keyframes shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
      `}</style>
      {/* HUD */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "6px 12px", background: "#111", borderBottom: "2px solid #333", fontSize: 11 }}>
        <div style={{ display: "flex", gap: 12 }}>
          <span>◉ {bag.spheres}</span>
          <span style={{ color: "#2ecc71" }}>♥ {bag.potions}</span>
          <span style={{ color: "#f39c12" }}>👣 {steps}</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {party[0] && <span style={{ color: party[0].color }}>{party[0].name} Nv.{party[0].level} ({party[0].currentHp}/{party[0].hp})</span>}
        </div>
        <button onClick={() => setShowParty(s => !s)}
          style={{ background: "none", border: "1px solid #555", color: "#aaa", padding: "2px 8px", borderRadius: 3, cursor: "pointer", fontSize: 10 }}>
          Equipo ({party.length})
        </button>
      </div>

      {/* Map viewport */}
      <div style={{ position: "relative", width: VIEW_W * TILE, height: VIEW_H * TILE, margin: "0 auto", overflow: "hidden", background: "#2d5016" }}>
        <div style={{ position: "absolute", left: -camX * TILE, top: -camY * TILE }}>
          {WORLD_MAP.map((row, y) => row.map((tile, x) => (
            <div key={`${x}-${y}`} style={{ position: "absolute", left: x * TILE, top: y * TILE }}>
              <Tile type={tile} />
            </div>
          )))}
          
          {/* NPCs */}
          {NPC_DATA.map((npc, i) => (
            <div key={`npc-${i}`} style={{ position: "absolute", left: npc.x * TILE, top: npc.y * TILE, zIndex: 5 }}>
              <NPCSprite color={npc.color} />
            </div>
          ))}
          
          {/* Player */}
          <div style={{ position: "absolute", left: player.x * TILE, top: player.y * TILE, zIndex: 10 }}>
            <PlayerSprite dir={player.dir} frame={player.frame} />
          </div>
        </div>
      </div>

      {/* D-Pad for mobile */}
      <div style={{ display: "flex", justifyContent: "center", padding: "8px 0", background: "#111" }}>
        <div style={{ display: "grid", gridTemplateColumns: "40px 40px 40px", gridTemplateRows: "40px 40px 40px", gap: 2 }}>
          <div />
          <button onClick={() => movePlayer(0, -1)} style={dpadBtn}>▲</button>
          <div />
          <button onClick={() => movePlayer(-1, 0)} style={dpadBtn}>◄</button>
          <button onClick={() => setShowParty(s => !s)} style={{ ...dpadBtn, fontSize: 9, background: "#2c3e50" }}>P</button>
          <button onClick={() => movePlayer(1, 0)} style={dpadBtn}>►</button>
          <div />
          <button onClick={() => movePlayer(0, 1)} style={dpadBtn}>▼</button>
          <div />
        </div>
      </div>

      {/* Message log */}
      <div style={{ padding: "6px 10px", background: "#0a0a15", borderTop: "1px solid #222", fontSize: 10, color: "#7f8c8d", maxHeight: 50, overflow: "hidden" }}>
        {msgLog.slice(-2).map((m, i) => <div key={i}>› {m}</div>)}
      </div>

      {/* Dialog overlay */}
      {dialogState && (
        <div style={{ position: "absolute", bottom: 90, left: 10, right: 10, background: "#1a1a2eee",
          border: "2px solid #f1c40f", borderRadius: 8, padding: 15, zIndex: 20 }}>
          <div style={{ color: "#f1c40f", fontWeight: "bold", fontSize: 13, marginBottom: 6 }}>
            {dialogState.npc.name}
          </div>
          <div style={{ color: "#ecf0f1", fontSize: 12, lineHeight: 1.5, marginBottom: 8 }}>
            {dialogState.npc.dialog[dialogState.line]}
          </div>
          <button onClick={advanceDialog}
            style={{ ...btnStyle("#f1c40f"), padding: "4px 16px", fontSize: 11 }}>
            {dialogState.line + 1 >= dialogState.npc.dialog.length ? "Cerrar" : "Siguiente ▶"}
          </button>
        </div>
      )}

      {/* Party overlay */}
      {showParty && (
        <div style={{ position: "absolute", top: 30, left: 5, right: 5, bottom: 5, background: "#0a0a1aee",
          border: "2px solid #9b59b6", borderRadius: 8, padding: 15, zIndex: 20, overflowY: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <h3 style={{ color: "#f1c40f", margin: 0, fontSize: 16 }}>✦ Tu Equipo ✦</h3>
            <button onClick={() => setShowParty(false)}
              style={{ background: "#e74c3c", border: "none", color: "#fff", padding: "3px 10px", borderRadius: 4, cursor: "pointer", fontSize: 11 }}>✕</button>
          </div>
          <div style={{ fontSize: 10, color: "#888", marginBottom: 8 }}>
            Runesferas: {bag.spheres} | Pociones: {bag.potions} | Veilborn capturados: {caughtLog.length}
          </div>
          {party.map((c, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px",
              background: "#1a1a2e", borderRadius: 6, marginBottom: 6, border: `1px solid ${c.color}33` }}>
              <CreatureSprite creature={c} size={48} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ color: c.color, fontWeight: "bold", fontSize: 13 }}>{c.name}</span>
                  <span style={{ color: "#888", fontSize: 10 }}>Nv.{c.level}</span>
                  <span style={{ color: TYPE_COLORS[c.type], fontSize: 9, padding: "1px 4px", background: "#0a0a1a", borderRadius: 2 }}>{c.type}</span>
                </div>
                <HPBar current={c.currentHp} max={c.hp} height={4} />
                <div style={{ color: "#777", fontSize: 9, marginTop: 2 }}>
                  HP:{c.currentHp}/{c.hp} ATK:{c.atk} DEF:{c.def} SPD:{c.spd} | XP:{c.xp}/{c.level * 20}
                </div>
                <div style={{ color: "#555", fontSize: 9 }}>
                  {c.moves.join(" • ")}
                </div>
              </div>
            </div>
          ))}
          {party.length === 0 && <div style={{ color: "#555", textAlign: "center", padding: 20 }}>Equipo vacío</div>}
        </div>
      )}
    </div>
  );
}

// ── Shared styles ──
const btnStyle = (color) => ({
  padding: "8px 12px", fontSize: 12, fontFamily: "'Courier New', monospace",
  background: `${color}22`, border: `1px solid ${color}`, color: "#ecf0f1",
  borderRadius: 4, cursor: "pointer", transition: "all 0.15s",
});

const dpadBtn = {
  width: 40, height: 40, fontSize: 16, background: "#1a1a2e", border: "1px solid #444",
  color: "#ecf0f1", borderRadius: 6, cursor: "pointer", display: "flex",
  alignItems: "center", justifyContent: "center", padding: 0,
};
