import { useState, useEffect, useCallback, useRef } from "react";

// ═══════════════════════════════════════════════════════
// RUNEVEIL CHRONICLES - Full Version by ÓCO
// ═══════════════════════════════════════════════════════

const TILE = 32;
const VIEW_W = 10;
const VIEW_H = 8;

// ── EVOLUTION TABLE ──
const EVOLUTIONS = {
  0: { level: 12, into: 8 },
  1: { level: 12, into: 9 },
  2: { level: 12, into: 10 },
  3: { level: 14, into: 11 },
  4: { level: 15, into: 12 },
  5: { level: 15, into: 13 },
  6: { level: 13, into: 14 },
};

// ── CREATURE DATABASE ──
const CREATURES = [
  { id: 0, name: "Pyrox", type: "fire", hp: 45, atk: 12, def: 8, spd: 10,
    color: "#e74c3c", accent: "#f39c12", moves: ["Llamarada","Garra Ígnea","Escudo Calor","Inferno"],
    desc: "Zorro ígneo nacido de las cenizas del primer cristal." },
  { id: 1, name: "Aqualis", type: "water", hp: 50, atk: 10, def: 12, spd: 8,
    color: "#3498db", accent: "#1abc9c", moves: ["Torrente","Burbuja Ácida","Marea Alta","Tsunami"],
    desc: "Serpiente marina que controla las corrientes del Velo." },
  { id: 2, name: "Thornex", type: "earth", hp: 55, atk: 11, def: 14, spd: 6,
    color: "#27ae60", accent: "#8B4513", moves: ["Latigazo","Raíz Trampa","Espina Venenosa","Terremoto"],
    desc: "Criatura vegetal con raíces interdimensionales." },
  { id: 3, name: "Zephyra", type: "wind", hp: 40, atk: 13, def: 7, spd: 14,
    color: "#9b59b6", accent: "#ecf0f1", moves: ["Ráfaga Cortante","Torbellino","Pluma Afilada","Ciclón"],
    desc: "Ave mística que surca las brechas entre mundos." },
  { id: 4, name: "Luxar", type: "light", hp: 48, atk: 14, def: 9, spd: 11,
    color: "#f1c40f", accent: "#ffffff", moves: ["Rayo Solar","Destello","Aura Sagrada","Nova"],
    desc: "Guardián de luz pura, fragmento del cristal original." },
  { id: 5, name: "Umbrix", type: "dark", hp: 52, atk: 15, def: 10, spd: 9,
    color: "#2c3e50", accent: "#8e44ad", moves: ["Garra Sombría","Niebla Oscura","Vacío","Eclipse"],
    desc: "Nacido de la sombra de Malachar, busca redención." },
  { id: 6, name: "Criomaw", type: "water", hp: 46, atk: 11, def: 11, spd: 9,
    color: "#85C1E9", accent: "#D6EAF8", moves: ["Aliento Gélido","Cristal de Hielo","Ventisca","Cero Absoluto"],
    desc: "Lobo de hielo del Velo Norte." },
  { id: 7, name: "Drakonil", type: "fire", hp: 60, atk: 16, def: 11, spd: 7,
    color: "#C0392B", accent: "#E74C3C", moves: ["Aliento Dragón","Cola Férrea","Rugido","Meteoro"],
    desc: "El dragón ancestral, primer Veilborn en cruzar el Velo." },
  // EVOLUTIONS
  { id: 8, name: "Pyrodrake", type: "fire", hp: 70, atk: 20, def: 13, spd: 13,
    color: "#c0392b", accent: "#e67e22", moves: ["Infierno Vivo","Garra Magma","Muro Ígneo","Erupción"],
    desc: "La forma evolucionada de Pyrox. Su fuego derrite la piedra." },
  { id: 9, name: "Aquarex", type: "water", hp: 75, atk: 17, def: 18, spd: 11,
    color: "#2171b5", accent: "#0e8a7d", moves: ["Maremoto","Hidrobomba","Escudo Coral","Abismo"],
    desc: "Aqualis evolucionado. Controla océanos enteros." },
  { id: 10, name: "Thornodon", type: "earth", hp: 82, atk: 18, def: 22, spd: 8,
    color: "#1e8449", accent: "#6d4c21", moves: ["Cataclismo","Raíz Titánica","Bosque Espina","Gaia"],
    desc: "Thornex evolucionado. Un coloso de roca y raíces." },
  { id: 11, name: "Zephyrion", type: "wind", hp: 60, atk: 22, def: 11, spd: 20,
    color: "#7d3c98", accent: "#d5d8dc", moves: ["Huracán","Corte Sónico","Pluma Divina","Tormenta"],
    desc: "Zephyra evolucionada. Más rápida que el sonido." },
  { id: 12, name: "Luxanova", type: "light", hp: 72, atk: 23, def: 14, spd: 14,
    color: "#d4ac0d", accent: "#fefefe", moves: ["Supernova","Juicio Solar","Barrera Sagrada","Génesis"],
    desc: "Luxar evolucionado. Encarna la luz del cristal primordial." },
  { id: 13, name: "Umbralord", type: "dark", hp: 78, atk: 24, def: 15, spd: 12,
    color: "#1a1a2e", accent: "#6c3483", moves: ["Noche Eterna","Desgarro Abisal","Manto Sombra","Ragnarök"],
    desc: "Umbrix evolucionado. La oscuridad absoluta encarnada." },
  { id: 14, name: "Criobane", type: "water", hp: 70, atk: 18, def: 17, spd: 12,
    color: "#5dade2", accent: "#aed6f1", moves: ["Tormenta Ártica","Colmillo Glaciar","Armadura Hielo","Extinción Gélida"],
    desc: "Criomaw evolucionado. Su aliento congela dimensiones." },
  // MALACHAR'S LEGENDARIES
  { id: 15, name: "Voidmaw", type: "dark", hp: 90, atk: 26, def: 18, spd: 14,
    color: "#0d0d1a", accent: "#4a0080", moves: ["Devorar Almas","Pulso Vacío","Grito del Abismo","Aniquilación"],
    desc: "Bestia creada por Malachar con fragmentos de cristales rotos." },
  { id: 16, name: "Ruindrake", type: "fire", hp: 85, atk: 25, def: 16, spd: 15,
    color: "#4a0000", accent: "#ff2200", moves: ["Llama Maldita","Devastación","Ceniza Negra","Apocalipsis"],
    desc: "Dragón corrompido por la magia oscura de Malachar." },
];

const TYPE_CHART = {
  fire: { fire: 0.5, water: 0.5, earth: 2, wind: 1, light: 1, dark: 1 },
  water: { fire: 2, water: 0.5, earth: 0.5, wind: 1, light: 1, dark: 1 },
  earth: { fire: 0.5, water: 2, earth: 0.5, wind: 2, light: 1, dark: 1 },
  wind: { fire: 1, water: 1, earth: 0.5, wind: 0.5, light: 2, dark: 0.5 },
  light: { fire: 1, water: 1, earth: 1, wind: 0.5, light: 0.5, dark: 2 },
  dark: { fire: 1, water: 1, earth: 1, wind: 2, light: 0.5, dark: 0.5 },
};

const TYPE_COLORS = { fire: "#e74c3c", water: "#3498db", earth: "#27ae60", wind: "#9b59b6", light: "#f1c40f", dark: "#2c3e50" };
const TYPE_NAMES = { fire: "Fuego", water: "Agua", earth: "Tierra", wind: "Viento", light: "Luz", dark: "Oscuridad" };

// ── MAPS ──
// 0=grass 1=tree 2=water 3=path 4=house 5=crystal 6=bridge 7=flower 8=rock 9=portal
const MAPS = {
  pueblo: {
    name: "Aldea Runeglow", w: 20, h: 15, bgColor: "#2d5016",
    encounterRate: 0.06, wildLevels: [3,7], wildPool: [0,1,2,3],
    data: [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,3,3,3,0,7,0,0,1,1,1,0,0,7,0,0,3,3,3,1],
      [1,3,4,3,0,0,7,0,0,1,1,0,0,0,7,0,3,4,3,1],
      [1,3,3,3,0,0,0,0,0,3,3,0,0,0,0,0,3,3,3,1],
      [1,0,7,0,0,0,0,3,3,3,3,3,3,0,0,0,0,7,0,1],
      [1,0,0,0,0,3,3,3,4,3,3,4,3,3,3,0,0,0,0,1],
      [1,7,0,0,0,3,0,0,3,3,3,3,0,0,3,0,0,0,7,1],
      [1,0,0,0,0,3,0,0,0,3,3,0,0,0,3,0,0,0,0,1],
      [1,0,0,8,0,3,3,3,3,3,3,3,3,3,3,0,8,0,0,1],
      [1,0,0,0,0,0,0,0,0,3,3,0,0,0,0,0,0,0,0,1],
      [1,0,7,0,0,0,0,0,0,9,9,0,0,0,0,0,0,7,0,1],
      [1,0,0,0,0,7,0,0,0,0,0,0,0,0,7,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,7,0,0,8,0,7,0,0,0,0,0,0,7,0,8,0,0,7,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    portals: [
      { x:9,y:10,to:"bosque",tx:10,ty:1 },
      { x:10,y:10,to:"bosque",tx:11,ty:1 },
    ],
    npcs: [
      { x:3,y:1,name:"Profesor Elm",color:"#ecf0f1",type:"talk",
        dialog:["¡Bienvenido, joven Guardián!","El mundo de Runeveil está en peligro...","Debes encontrar los 3 Cristales Dimensionales.","Están en el Bosque, la Cueva y la Torre.","Captura Veilborn y hazte fuerte.","¡El destino de Runeveil está en tus manos!"]},
      { x:17,y:1,name:"Guardiana Lyra",color:"#e74c3c",type:"talk",
        dialog:["Soy Lyra, Guardiana del Cristal Norte.","He oído que Malachar tiene una torre al norte.","Solo podrás entrar con los 3 cristales."]},
      { x:8,y:5,name:"Tienda Rúnica",color:"#f39c12",type:"shop",
        dialog:["¡Bienvenido a la Tienda Rúnica!"]},
      { x:11,y:5,name:"Centro Sanador",color:"#2ecc71",type:"heal",
        dialog:["¡Bienvenido al Centro Sanador!","Tus Veilborn han sido curados."]},
    ],
    trainers: [],
  },
  bosque: {
    name: "Bosque Velosombrío", w: 20, h: 18, bgColor: "#1a3d0c",
    encounterRate: 0.14, wildLevels: [5,11], wildPool: [2,3,6,4],
    data: [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,7,0,1,0,0,0,0,0,9,9,0,0,0,0,1,0,7,1],
      [1,0,0,0,1,0,7,0,0,0,3,3,0,0,7,0,1,0,0,1],
      [1,7,0,0,0,0,0,0,3,3,3,3,3,3,0,0,0,0,7,1],
      [1,0,0,0,0,1,0,3,3,1,1,1,3,3,0,1,0,0,0,1],
      [1,0,1,0,0,0,0,3,0,0,7,0,0,3,0,0,0,1,0,1],
      [1,0,0,0,7,0,0,3,0,0,0,0,0,3,0,0,7,0,0,1],
      [1,0,0,0,0,0,3,3,0,1,5,1,0,3,3,0,0,0,0,1],
      [1,1,0,0,0,0,3,0,0,0,3,0,0,0,3,0,0,0,1,1],
      [1,0,0,0,1,0,3,0,0,0,3,0,0,0,3,0,1,0,0,1],
      [1,0,7,0,0,0,3,3,3,3,3,3,3,3,3,0,0,0,7,1],
      [1,0,0,0,0,0,0,0,0,3,3,0,0,0,0,0,0,0,0,1],
      [1,0,0,1,0,7,0,0,0,3,3,0,0,0,7,0,1,0,0,1],
      [1,7,0,0,0,0,0,0,3,3,3,3,0,0,0,0,0,0,7,1],
      [1,0,0,0,0,0,0,3,3,0,0,3,3,0,0,0,0,0,0,1],
      [1,0,0,0,1,0,0,3,0,0,0,0,3,0,0,1,0,0,0,1],
      [1,0,7,0,0,0,0,9,0,0,0,0,9,0,0,0,0,7,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    portals: [
      { x:10,y:1,to:"pueblo",tx:9,ty:9 },{ x:11,y:1,to:"pueblo",tx:10,ty:9 },
      { x:7,y:16,to:"cueva",tx:10,ty:1 },{ x:12,y:16,to:"cueva",tx:11,ty:1 },
    ],
    npcs: [],
    trainers: [
      { x:9,y:3,name:"Explorador Kai",color:"#e67e22",id:"t1",
        dialog:["¡Alto! Para pasar, debes vencerme."],
        party:[{...CREATURES[3],level:8},{...CREATURES[2],level:7}]},
      { x:5,y:8,name:"Herbalista Noa",color:"#27ae60",id:"t2",
        dialog:["Las plantas del bosque me han enseñado a luchar."],
        party:[{...CREATURES[2],level:9},{...CREATURES[6],level:8}]},
      { x:14,y:5,name:"Cazador Dex",color:"#c0392b",id:"t3",
        dialog:["¡Nadie pasa por mi territorio sin combatir!"],
        party:[{...CREATURES[0],level:9},{...CREATURES[5],level:8}]},
    ],
    crystal: { x:10,y:7,id:"crystal_bosque",name:"Cristal del Bosque" },
  },
  cueva: {
    name: "Cueva de las Runas", w: 20, h: 18, bgColor: "#1a1a2e",
    encounterRate: 0.16, wildLevels: [8,14], wildPool: [5,6,7,4],
    data: [
      [8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8],
      [8,3,3,3,3,3,3,3,3,3,9,9,3,3,3,3,3,3,3,8],
      [8,3,8,8,3,3,8,3,3,3,3,3,3,3,8,3,3,8,3,8],
      [8,3,8,0,0,3,8,3,0,0,3,0,0,3,8,3,0,8,3,8],
      [8,3,3,0,0,3,3,3,0,0,3,0,0,3,3,3,0,3,3,8],
      [8,8,3,3,3,3,0,0,0,3,3,3,0,0,0,3,3,3,8,8],
      [8,3,3,0,0,0,0,8,3,3,3,3,3,8,0,0,0,3,3,8],
      [8,3,0,0,8,0,0,0,3,0,0,0,3,0,0,0,8,0,3,8],
      [8,3,0,0,0,0,8,3,3,0,5,0,3,3,8,0,0,0,3,8],
      [8,3,3,0,0,0,0,0,3,0,0,0,3,0,0,0,0,3,3,8],
      [8,8,3,3,0,0,0,8,3,3,3,3,3,8,0,0,0,3,8,8],
      [8,3,3,0,0,3,3,3,0,0,3,0,0,3,3,3,0,3,3,8],
      [8,3,0,0,8,3,0,0,0,0,3,0,0,0,0,3,8,0,3,8],
      [8,3,0,0,0,3,0,0,0,3,3,3,0,0,0,3,0,0,3,8],
      [8,3,3,3,3,3,3,0,3,3,3,3,3,0,3,3,3,3,3,8],
      [8,8,3,0,0,0,3,3,3,0,0,0,3,3,3,0,0,3,8,8],
      [8,3,3,0,0,0,0,0,9,0,0,0,9,0,0,0,0,3,3,8],
      [8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8],
    ],
    portals: [
      { x:10,y:1,to:"bosque",tx:10,ty:15 },{ x:11,y:1,to:"bosque",tx:11,ty:15 },
      { x:8,y:16,to:"torre",tx:10,ty:16 },{ x:12,y:16,to:"torre",tx:11,ty:16 },
    ],
    npcs: [],
    trainers: [
      { x:10,y:4,name:"Minero Grunk",color:"#95a5a6",id:"t4",
        dialog:["Llevo años atrapado aquí... ¡combatir me mantiene cuerdo!"],
        party:[{...CREATURES[5],level:11},{...CREATURES[7],level:10},{...CREATURES[6],level:11}]},
      { x:4,y:7,name:"Bruja Morwen",color:"#8e44ad",id:"t5",
        dialog:["Las sombras me susurran... ¡y dicen que perderás!"],
        party:[{...CREATURES[5],level:12},{...CREATURES[4],level:11}]},
      { x:15,y:12,name:"Guardián Roto",color:"#1abc9c",id:"t6",
        dialog:["Fui un Guardián... ahora pruebo a los dignos."],
        party:[{...CREATURES[4],level:13},{...CREATURES[7],level:12},{...CREATURES[3],level:12}]},
    ],
    crystal: { x:10,y:8,id:"crystal_cueva",name:"Cristal de la Cueva" },
  },
  torre: {
    name: "Torre de Malachar", w: 20, h: 18, bgColor: "#0d0d1a",
    encounterRate: 0.18, wildLevels: [12,18], wildPool: [5,7,15,16],
    data: [
      [8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8],
      [8,0,0,0,8,0,0,0,0,3,3,0,0,0,0,8,0,0,0,8],
      [8,0,0,0,0,0,0,0,3,3,3,3,0,0,0,0,0,0,0,8],
      [8,0,0,8,0,0,0,3,3,0,0,3,3,0,0,0,8,0,0,8],
      [8,0,0,0,0,0,3,3,0,0,0,0,3,3,0,0,0,0,0,8],
      [8,8,0,0,0,0,3,0,0,8,8,0,0,3,0,0,0,0,8,8],
      [8,0,0,0,0,3,3,0,0,0,0,0,0,3,3,0,0,0,0,8],
      [8,0,0,0,0,3,0,0,0,0,0,0,0,0,3,0,0,0,0,8],
      [8,0,0,8,0,3,0,0,5,0,0,5,0,0,3,0,8,0,0,8],
      [8,0,0,0,0,3,0,0,0,0,0,0,0,0,3,0,0,0,0,8],
      [8,0,0,0,0,3,3,0,0,0,0,0,0,3,3,0,0,0,0,8],
      [8,8,0,0,0,0,3,0,0,8,8,0,0,3,0,0,0,0,8,8],
      [8,0,0,0,0,0,3,3,0,0,0,0,3,3,0,0,0,0,0,8],
      [8,0,0,8,0,0,0,3,3,3,3,3,3,0,0,0,8,0,0,8],
      [8,0,0,0,0,0,0,0,3,3,3,3,0,0,0,0,0,0,0,8],
      [8,0,0,0,0,0,0,0,0,3,3,0,0,0,0,0,0,0,0,8],
      [8,0,0,0,8,0,0,0,0,3,9,0,0,0,0,8,0,0,0,8],
      [8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8],
    ],
    portals: [{ x:10,y:16,to:"cueva",tx:10,ty:15 }],
    npcs: [],
    trainers: [
      { x:10,y:11,name:"Acólito Sombra",color:"#4a0080",id:"t7",
        dialog:["¡El Maestro Malachar no será molestado!"],
        party:[{...CREATURES[5],level:15},{...CREATURES[15],level:14}]},
      { x:5,y:7,name:"General Vyx",color:"#ff2200",id:"t8",
        dialog:["Soy el general de Malachar. ¡No pasarás!"],
        party:[{...CREATURES[16],level:16},{...CREATURES[7],level:15},{...CREATURES[5],level:15}]},
    ],
    crystal: { x:8,y:8,id:"crystal_torre",name:"Cristal de la Torre" },
    boss: { x:11,y:8,name:"Malachar",color:"#4a0080",id:"boss_malachar",
      dialog:["Así que el último Guardián se atreve a venir...","¡Los cristales serán míos! ¡El Velo se romperá!","Prepárate para la OSCURIDAD ETERNA."],
      party:[{...CREATURES[15],level:20},{...CREATURES[16],level:19},{...CREATURES[13],level:18},{...CREATURES[7],level:20}]},
  },
};

function initTrainerParty(tp) {
  return tp.map(c => {
    const h = c.hp + Math.floor(c.level * 1.5);
    return { ...c, hp: h, currentHp: h };
  });
}

const WALKABLE = new Set([0,3,6,7,9]);
const ENCOUNTER_TILES = new Set([0,7]);

const MISSIONS_INIT = [
  { id:"m1",name:"El Cristal del Bosque",desc:"Encuentra el Cristal en el Bosque Velosombrío.",crystal:"crystal_bosque",reward:"5 Runesferas",done:false },
  { id:"m2",name:"El Cristal de la Cueva",desc:"Recupera el Cristal en la Cueva de las Runas.",crystal:"crystal_cueva",reward:"5 Pociones",done:false },
  { id:"m3",name:"El Cristal de la Torre",desc:"Obtén el último Cristal en la Torre de Malachar.",crystal:"crystal_torre",reward:"10 Runesferas",done:false },
  { id:"m4",name:"Derrotar a Malachar",desc:"Con los 3 cristales, enfrenta al Sabio Oscuro.",crystal:null,reward:"Victoria final",done:false },
];

const SHOP_ITEMS = [
  { name:"Runesfera",key:"spheres",price:100,desc:"Captura Veilborn" },
  { name:"Poción",key:"potions",price:50,desc:"+25 HP" },
  { name:"Super Poción",key:"superPotions",price:150,desc:"+60 HP" },
  { name:"Runesfera Pro",key:"proSpheres",price:300,desc:"Mayor captura" },
];

// ══ SPRITES ══
function CreatureSprite({ creature, size=64, flip=false, anim="" }) {
  const c = creature.color, a = creature.accent;
  const isEvo = creature.id >= 8;
  const t = creature.type;
  const st = anim === "shake" ? { animation:"shake 0.3s" } : {};
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ imageRendering:"pixelated", transform:flip?"scaleX(-1)":"none", ...st }}>
      {t==="fire" && <>
        <rect x="5" y={isEvo?2:3} width="6" height={isEvo?7:6} fill={c}/>
        <rect x="4" y="4" width="1" height="4" fill={c}/><rect x="11" y="4" width="1" height="4" fill={c}/>
        <rect x="6" y={isEvo?1:2} width="2" height="1" fill={a}/><rect x="9" y={isEvo?1:2} width="2" height="1" fill={a}/>
        <rect x="6" y="5" width="1" height="1" fill="#fff"/><rect x="9" y="5" width="1" height="1" fill="#fff"/>
        <rect x="7" y="7" width="2" height="1" fill={a}/>
        <rect x="5" y="9" width="2" height="3" fill={c}/><rect x="9" y="9" width="2" height="3" fill={c}/>
        {isEvo&&<><rect x="3" y="3" width="1" height="3" fill={a}/><rect x="12" y="3" width="1" height="3" fill={a}/><rect x="2" y="2" width="2" height="1" fill={a}/><rect x="12" y="2" width="2" height="1" fill={a}/></>}
      </>}
      {t==="water" && <>
        <rect x="5" y="2" width="6" height={isEvo?6:5} fill={c}/>
        <rect x="4" y="3" width="1" height="3" fill={c}/><rect x="11" y="3" width="1" height="3" fill={c}/>
        <rect x="6" y="4" width="1" height="1" fill="#fff"/><rect x="9" y="4" width="1" height="1" fill="#fff"/>
        <rect x="6" y="7" width="4" height="2" fill={c}/>
        <rect x="5" y="9" width="6" height="2" fill={a}/>
        <rect x="4" y="11" width="3" height="1" fill={a}/><rect x="9" y="11" width="3" height="1" fill={a}/>
        {isEvo&&<><rect x="3" y="2" width="2" height="1" fill={a}/><rect x="11" y="2" width="2" height="1" fill={a}/><rect x="2" y="3" width="2" height="3" fill={c}/><rect x="12" y="3" width="2" height="3" fill={c}/></>}
      </>}
      {t==="earth" && <>
        <rect x="4" y={isEvo?2:3} width="8" height={isEvo?8:7} fill={c}/>
        <rect x="3" y="4" width="1" height="5" fill={c}/><rect x="12" y="4" width="1" height="5" fill={c}/>
        <rect x="5" y="5" width="2" height="1" fill="#fff"/><rect x="9" y="5" width="2" height="1" fill="#fff"/>
        <rect x="6" y="8" width="4" height="1" fill={a}/>
        <rect x="5" y="10" width="2" height="3" fill={a}/><rect x="9" y="10" width="2" height="3" fill={a}/>
        {isEvo&&<><rect x="3" y="1" width="2" height="2" fill={c}/><rect x="11" y="1" width="2" height="2" fill={c}/></>}
      </>}
      {t==="wind" && <>
        <rect x="6" y={isEvo?3:4} width="4" height="4" fill={c}/>
        <rect x="5" y="5" width="1" height="2" fill={c}/><rect x="10" y="5" width="1" height="2" fill={c}/>
        <rect x="7" y="5" width="1" height="1" fill="#fff"/><rect x="9" y="5" width="1" height="1" fill="#fff"/>
        <rect x="3" y="4" width="3" height="3" fill={a}/><rect x="10" y="4" width="3" height="3" fill={a}/>
        <rect x="7" y="8" width="2" height="2" fill={c}/>
        <rect x="6" y="10" width="1" height="2" fill={c}/><rect x="9" y="10" width="1" height="2" fill={c}/>
        {isEvo&&<><rect x="6" y="2" width="4" height="1" fill={a}/><rect x="7" y="1" width="2" height="1" fill={c}/></>}
      </>}
      {t==="light" && <>
        <rect x="5" y="3" width="6" height="6" fill={c}/>
        <rect x="4" y="4" width="1" height="4" fill={c}/><rect x="11" y="4" width="1" height="4" fill={c}/>
        <rect x="6" y="5" width="1" height="1" fill="#fff"/><rect x="9" y="5" width="1" height="1" fill="#fff"/>
        <rect x="7" y="7" width="2" height="1" fill={a}/>
        <rect x="5" y="9" width="2" height="3" fill={c}/><rect x="9" y="9" width="2" height="3" fill={c}/>
        <rect x="3" y="2" width="2" height="2" fill={a}/><rect x="11" y="2" width="2" height="2" fill={a}/>
        <rect x="7" y="1" width="2" height="2" fill={a}/>
        {isEvo&&<><rect x="1" y="4" width="3" height="1" fill="#FFD700"/><rect x="12" y="4" width="3" height="1" fill="#FFD700"/></>}
      </>}
      {t==="dark" && <>
        <rect x="4" y={isEvo?2:3} width="8" height={isEvo?8:7} fill={c}/>
        <rect x="3" y="4" width="1" height="5" fill={c}/><rect x="12" y="4" width="1" height="5" fill={c}/>
        <rect x="5" y="5" width="2" height="1" fill={a}/><rect x="9" y="5" width="2" height="1" fill={a}/>
        <rect x="6" y="5" width="1" height="1" fill="#e74c3c"/><rect x="10" y="5" width="1" height="1" fill="#e74c3c"/>
        <rect x="6" y="8" width="4" height="1" fill={a}/>
        <rect x="5" y="10" width="2" height="3" fill={c}/><rect x="9" y="10" width="2" height="3" fill={c}/>
        {isEvo&&<><rect x="3" y="1" width="2" height="2" fill={a}/><rect x="11" y="1" width="2" height="2" fill={a}/></>}
      </>}
    </svg>
  );
}

function PlayerSprite({ dir, frame }) {
  return (
    <svg width={TILE} height={TILE} viewBox="0 0 16 16" style={{ imageRendering:"pixelated" }}>
      <rect x="6" y="1" width="4" height="4" fill="#f5cba7"/>
      <rect x="6" y="0" width="4" height="2" fill="#5D4E37"/><rect x="5" y="1" width="1" height="1" fill="#5D4E37"/><rect x="10" y="1" width="1" height="1" fill="#5D4E37"/>
      <rect x="7" y="3" width="1" height="1" fill="#2c3e50"/><rect x="9" y="3" width="1" height="1" fill="#2c3e50"/>
      <rect x="5" y="5" width="6" height="5" fill="#2980b9"/><rect x="4" y="5" width="1" height="4" fill="#2980b9"/><rect x="11" y="5" width="1" height="4" fill="#2980b9"/>
      <rect x="3" y="6" width="1" height="3" fill="#f5cba7"/><rect x="12" y="6" width="1" height="3" fill="#f5cba7"/>
      <rect x="6" y="10" width="2" height="3" fill="#2c3e50"/><rect x="9" y="10" width="2" height="3" fill="#2c3e50"/>
      {frame%2===1&&<rect x={dir==="left"?"5":"9"} y="11" width="2" height="2" fill="#2c3e50"/>}
      <rect x="7" y="5" width="2" height="1" fill="#e74c3c"/>
    </svg>
  );
}
function NPCSprite({ color }) {
  return (
    <svg width={TILE} height={TILE} viewBox="0 0 16 16" style={{ imageRendering:"pixelated" }}>
      <rect x="6" y="1" width="4" height="4" fill="#f5cba7"/>
      <rect x="6" y="0" width="4" height="2" fill={color}/><rect x="5" y="1" width="1" height="1" fill={color}/><rect x="10" y="1" width="1" height="1" fill={color}/>
      <rect x="7" y="3" width="1" height="1" fill="#2c3e50"/><rect x="9" y="3" width="1" height="1" fill="#2c3e50"/>
      <rect x="5" y="5" width="6" height="5" fill={color}/><rect x="4" y="5" width="1" height="4" fill={color}/><rect x="11" y="5" width="1" height="4" fill={color}/>
      <rect x="6" y="10" width="2" height="3" fill="#34495e"/><rect x="9" y="10" width="2" height="3" fill="#34495e"/>
    </svg>
  );
}
function BossSprite() {
  return (
    <svg width={TILE} height={TILE} viewBox="0 0 16 16" style={{ imageRendering:"pixelated" }}>
      <rect x="5" y="1" width="6" height="8" fill="#1a0033"/>
      <rect x="4" y="2" width="1" height="6" fill="#1a0033"/><rect x="11" y="2" width="1" height="6" fill="#1a0033"/>
      <rect x="3" y="0" width="2" height="3" fill="#4a0080"/><rect x="11" y="0" width="2" height="3" fill="#4a0080"/>
      <rect x="6" y="3" width="2" height="1" fill="#e74c3c"/><rect x="9" y="3" width="2" height="1" fill="#e74c3c"/>
      <rect x="7" y="5" width="2" height="1" fill="#8e44ad"/>
      <rect x="5" y="9" width="6" height="4" fill="#2c003e"/>
      <rect x="6" y="13" width="2" height="2" fill="#1a0033"/><rect x="9" y="13" width="2" height="2" fill="#1a0033"/>
    </svg>
  );
}
function Tile({ type, mapId }) {
  const dk = mapId==="cueva"||mapId==="torre";
  const C = {
    0:dk?["#2a2a3e","#333350"]:["#4a7c3f","#5a8c4f"],
    1:dk?["#1a2e1a","#2d4a1e","#1a3d0c"]:["#2d5016","#3d6a1e","#228B22"],
    2:["#2471a3","#2e86c1","#3498db"],3:dk?["#555566","#666677"]:["#c2a06e","#d4b87c"],
    4:["#8B4513","#A0522D","#cd853f"],5:["#9b59b6","#bb77dd","#e8d5f5"],
    7:dk?["#2a2a3e","#9b59b6","#bb77dd"]:["#4a7c3f","#e74c3c","#f39c12"],
    8:dk?["#333344","#444455"]:["#7f8c8d","#95a5a6"],
    9:["#4a0080","#7722aa","#aa44dd"],
  };
  const [c1,c2,c3]=C[type]||C[0];
  return (
    <svg width={TILE} height={TILE} viewBox="0 0 16 16" style={{ imageRendering:"pixelated" }}>
      <rect width="16" height="16" fill={c1}/>
      {type===0&&<><rect x="3" y="5" width="1" height="2" fill={c2}/><rect x="10" y="9" width="1" height="2" fill={c2}/></>}
      {type===1&&<><rect x="6" y="0" width="4" height="6" fill={c3||c2}/><rect x="4" y="2" width="8" height="4" fill={c2}/><rect x="3" y="4" width="10" height="3" fill={c3||c2}/><rect x="7" y="7" width="2" height="5" fill="#5D4037"/><rect x="7" y="12" width="2" height="4" fill="#4E342E"/></>}
      {type===2&&<><rect x="2" y="4" width="4" height="1" fill={c2}/><rect x="8" y="10" width="5" height="1" fill={c3}/></>}
      {type===3&&<><rect x="1" y="3" width="2" height="1" fill={c2}/><rect x="8" y="8" width="2" height="1" fill={c2}/></>}
      {type===4&&<><rect x="2" y="4" width="12" height="10" fill={c1}/><rect x="0" y="2" width="16" height="3" fill={c3}/><rect x="6" y="8" width="4" height="6" fill="#5D4037"/><rect x="4" y="6" width="3" height="3" fill="#AED6F1"/><rect x="10" y="6" width="3" height="3" fill="#AED6F1"/></>}
      {type===5&&<><rect width="16" height="16" fill={dk?"#2a2a3e":"#4a7c3f"}/><rect x="6" y="2" width="4" height="8" fill={c1}/><rect x="5" y="3" width="6" height="6" fill={c2}/><rect x="7" y="4" width="2" height="3" fill={c3}/><rect x="6" y="10" width="4" height="3" fill="#7f8c8d"/></>}
      {type===7&&<><rect x="4" y="6" width="2" height="2" fill={c2}/><rect x="5" y="5" width="1" height="1" fill={c3||c2}/><rect x="10" y="9" width="2" height="2" fill={c3||c2}/></>}
      {type===8&&<><rect x="3" y="5" width="10" height="8" fill={c1}/><rect x="4" y="4" width="8" height="2" fill={c2}/></>}
      {type===9&&<><rect width="16" height="16" fill={dk?"#1a1a2e":"#4a7c3f"}/><rect x="3" y="3" width="10" height="10" fill={c1}/><rect x="5" y="5" width="6" height="6" fill={c2}/><rect x="7" y="7" width="2" height="2" fill={c3}/></>}
    </svg>
  );
}
function HPBar({ current, max, height=6 }) {
  const p=Math.max(0,current/max);
  const cl=p>0.5?"#2ecc71":p>0.2?"#f39c12":"#e74c3c";
  return (<div style={{width:"100%",height,background:"#1a1a2e",borderRadius:3,overflow:"hidden",border:"1px solid #333"}}>
    <div style={{width:`${p*100}%`,height:"100%",background:cl,transition:"width 0.4s"}}/></div>);
}

// ══ MAIN GAME ══
export default function RuneveilChronicles() {
  const [screen,setScreen]=useState("title");
  const [player,setPlayer]=useState({x:9,y:7,dir:"down",frame:0});
  const [currentMap,setCurrentMap]=useState("pueblo");
  const [party,setParty]=useState([]);
  const [bag,setBag]=useState({spheres:5,potions:3,superPotions:0,proSpheres:0,gold:300});
  const [battleState,setBattleState]=useState(null);
  const [dialogState,setDialogState]=useState(null);
  const [shopOpen,setShopOpen]=useState(false);
  const [showParty,setShowParty]=useState(false);
  const [showMissions,setShowMissions]=useState(false);
  const [msgLog,setMsgLog]=useState(["Bienvenido a Runeveil."]);
  const [defeatedTrainers,setDefeatedTrainers]=useState(new Set());
  const [crystalsFound,setCrystalsFound]=useState(new Set());
  const [missions,setMissions]=useState(MISSIONS_INIT.map(m=>({...m})));
  const [battleAnim,setBattleAnim]=useState({player:"",enemy:""});
  const [evolvePopup,setEvolvePopup]=useState(null);
  const [trainerBattle,setTrainerBattle]=useState(null);
  const [activeIdx,setActiveIdx]=useState(0);
  const gameRef=useRef(null);
  const addMsg=useCallback((m)=>setMsgLog(p=>[...p.slice(-6),m]),[]);
  const map=MAPS[currentMap];

  const pickStarter=(id)=>{
    const c={...CREATURES[id],currentHp:CREATURES[id].hp,level:5,xp:0};
    setParty([c]);setScreen("world");addMsg(`¡${c.name} se unió a tu equipo!`);
    setTimeout(()=>gameRef.current?.focus(),100);
  };

  const checkEvolution=useCallback((arr)=>{
    for(let i=0;i<arr.length;i++){
      const c=arr[i],evo=EVOLUTIONS[c.id];
      if(evo&&c.level>=evo.level){
        const ev=CREATURES[evo.into],hb=c.level*2;
        const nc={...ev,level:c.level,xp:c.xp,hp:ev.hp+hb,currentHp:ev.hp+hb,
          atk:ev.atk+Math.floor(c.level*0.3),def:ev.def+Math.floor(c.level*0.3),spd:ev.spd+Math.floor(c.level*0.3)};
        arr[i]=nc;setEvolvePopup({from:c,to:nc});return arr;
      }
    }
    return arr;
  },[]);

  const movePlayer=useCallback((dx,dy)=>{
    if(screen!=="world"||dialogState||showParty||showMissions||shopOpen||evolvePopup) return;
    setPlayer(p=>{
      const nx=p.x+dx,ny=p.y+dy;
      const dir=dx<0?"left":dx>0?"right":dy<0?"up":"down";
      if(nx<0||nx>=map.w||ny<0||ny>=map.h) return {...p,dir};
      const tile=map.data[ny][nx];
      const npc=map.npcs?.find(n=>n.x===nx&&n.y===ny);
      if(npc){setDialogState({npc,line:0});return{...p,dir};}
      const trainer=map.trainers?.find(t=>t.x===nx&&t.y===ny&&!defeatedTrainers.has(t.id));
      if(trainer){setDialogState({npc:{...trainer,type:"trainer",trainerData:trainer},line:0});return{...p,dir};}
      if(map.boss&&map.boss.x===nx&&map.boss.y===ny&&!defeatedTrainers.has(map.boss.id)){
        if(crystalsFound.size<3){addMsg("Necesitas los 3 cristales para enfrentar a Malachar.");return{...p,dir};}
        setDialogState({npc:{...map.boss,type:"boss",trainerData:map.boss},line:0});return{...p,dir};
      }
      if(map.crystal&&map.crystal.x===nx&&map.crystal.y===ny&&!crystalsFound.has(map.crystal.id)){
        setCrystalsFound(prev=>new Set([...prev,map.crystal.id]));
        addMsg(`¡Encontraste el ${map.crystal.name}! (${crystalsFound.size+1}/3)`);
        setMissions(prev=>prev.map(m=>{
          if(m.crystal===map.crystal.id){
            if(m.crystal==="crystal_bosque") setBag(b=>({...b,spheres:b.spheres+5}));
            if(m.crystal==="crystal_cueva") setBag(b=>({...b,potions:b.potions+5}));
            if(m.crystal==="crystal_torre") setBag(b=>({...b,spheres:b.spheres+10}));
            return{...m,done:true};
          }return m;
        }));
        return{...p,dir};
      }
      if(!WALKABLE.has(tile)) return{...p,dir};
      const portal=map.portals?.find(pt=>pt.x===nx&&pt.y===ny);
      if(portal){
        setCurrentMap(portal.to);addMsg(`Entrando a ${MAPS[portal.to].name}...`);
        setTimeout(()=>gameRef.current?.focus(),100);
        return{x:portal.tx,y:portal.ty,dir,frame:p.frame+1};
      }
      if(ENCOUNTER_TILES.has(tile)&&Math.random()<map.encounterRate){
        const pool=map.wildPool;const wb=CREATURES[pool[Math.floor(Math.random()*pool.length)]];
        const[minL,maxL]=map.wildLevels;const lvl=minL+Math.floor(Math.random()*(maxL-minL+1));
        const hb=Math.floor(lvl*1.5);
        setTimeout(()=>{
          setBattleState({wild:{...wb,level:lvl,currentHp:wb.hp+hb,hp:wb.hp+hb},turn:"player",menu:"main",
            msg:`¡Un ${wb.name} salvaje (Nv.${lvl}) apareció!`});
          setActiveIdx(0);setTrainerBattle(null);setScreen("battle");
        },80);
      }
      return{x:nx,y:ny,dir,frame:p.frame+1};
    });
  },[screen,dialogState,showParty,showMissions,shopOpen,evolvePopup,map,defeatedTrainers,crystalsFound,addMsg]);

  useEffect(()=>{
    const h=(e)=>{
      if(evolvePopup){if(e.key==="Enter"||e.key===" ") setEvolvePopup(null);return;}
      if(screen==="world"&&!dialogState&&!showParty&&!showMissions&&!shopOpen){
        switch(e.key){
          case"ArrowUp":case"w":case"W":movePlayer(0,-1);break;
          case"ArrowDown":case"s":case"S":movePlayer(0,1);break;
          case"ArrowLeft":case"a":case"A":movePlayer(-1,0);break;
          case"ArrowRight":case"d":case"D":movePlayer(1,0);break;
          case"p":case"P":setShowParty(s=>!s);break;
          case"m":case"M":setShowMissions(s=>!s);break;
        }
      }
      if(dialogState&&(e.key==="Enter"||e.key===" ")) advanceDialog();
    };
    window.addEventListener("keydown",h);return()=>window.removeEventListener("keydown",h);
  },[screen,dialogState,showParty,showMissions,shopOpen,movePlayer,evolvePopup]);

  const advanceDialog=()=>{
    if(!dialogState) return;
    const{npc,line}=dialogState;
    if(line+1>=npc.dialog.length){
      setDialogState(null);
      if(npc.type==="shop") setShopOpen(true);
      if(npc.type==="heal"){setParty(p=>p.map(c=>({...c,currentHp:c.hp})));addMsg("¡Todos tus Veilborn fueron curados!");}
      if(npc.type==="trainer"||npc.type==="boss") startTrainerBattle(npc.trainerData);
    } else setDialogState({npc,line:line+1});
  };

  const startTrainerBattle=(trainer)=>{
    const ep=initTrainerParty(trainer.party);
    setTrainerBattle({trainer,enemyParty:ep,currentIdx:0});
    setActiveIdx(0);
    setBattleState({wild:ep[0],turn:"player",menu:"main",msg:`¡${trainer.name} te desafía! Envía a ${ep[0].name}!`});
    setScreen("battle");
  };

  const calcDmg=(atk,def,mi)=>{
    const bd=atk.atk+atk.level;const tm=TYPE_CHART[atk.type]?.[def.type]||1;
    const mp=8+mi*4;const rn=0.85+Math.random()*0.3;
    return Math.max(1,Math.floor((bd*mp*tm*rn)/(def.def+10)));
  };

  const gainXP=useCallback((xp)=>{
    setParty(p=>{
      const np=[...p];const i=activeIdx;
      np[i]={...np[i],xp:np[i].xp+xp};
      if(np[i].xp>=np[i].level*20){
        np[i]={...np[i],level:np[i].level+1,xp:0,hp:np[i].hp+3,
          currentHp:Math.min(np[i].hp+3,np[i].currentHp+3),
          atk:np[i].atk+1,def:np[i].def+1,spd:np[i].spd+1};
        addMsg(`¡${np[i].name} subió al Nv.${np[i].level}!`);
      }
      return checkEvolution(np);
    });
  },[activeIdx,addMsg,checkEvolution]);

  const endBattle=useCallback((won)=>{
    if(trainerBattle&&won){
      const tid=trainerBattle.trainer.id;
      setDefeatedTrainers(prev=>new Set([...prev,tid]));
      const gr=trainerBattle.trainer.party.length*80;
      setBag(b=>({...b,gold:b.gold+gr}));
      addMsg(`¡Derrotaste a ${trainerBattle.trainer.name}! +${gr} oro`);
      if(tid==="boss_malachar"){
        setMissions(prev=>prev.map(m=>m.id==="m4"?{...m,done:true}:m));
        setScreen("victory");return;
      }
    }
    setScreen("world");setBattleState(null);setTrainerBattle(null);
    setTimeout(()=>gameRef.current?.focus(),100);
  },[trainerBattle,addMsg]);

  const doBattleAttack=(mi)=>{
    if(!battleState||battleState.turn!=="player") return;
    const ac=party[activeIdx],wl=battleState.wild;
    const dmg=calcDmg(ac,wl,mi);const tm=TYPE_CHART[ac.type]?.[wl.type]||1;
    const eff=tm>1?" ¡Súper efectivo!":tm<1?" No muy efectivo...":"";
    setBattleAnim({player:"",enemy:"shake"});
    setTimeout(()=>setBattleAnim({player:"",enemy:""}),400);
    const nwh=Math.max(0,wl.currentHp-dmg);
    if(nwh<=0){
      const xpG=wl.level*8+(trainerBattle?20:0);
      setBattleState(s=>({...s,wild:{...s.wild,currentHp:0},turn:"none",
        msg:`${ac.moves[mi]}: ${dmg} dmg.${eff} ¡${wl.name} derrotado! +${xpG} XP`}));
      setTimeout(()=>{
        gainXP(xpG);
        if(trainerBattle){
          const ni=trainerBattle.currentIdx+1;
          if(ni<trainerBattle.enemyParty.length){
            const nx=trainerBattle.enemyParty[ni];
            setTrainerBattle(prev=>({...prev,currentIdx:ni}));
            setBattleState(s=>({...s,wild:nx,turn:"player",menu:"main",msg:`${trainerBattle.trainer.name} envía a ${nx.name}!`}));
          } else endBattle(true);
        } else endBattle(true);
      },1500);return;
    }
    setBattleState(s=>({...s,wild:{...s.wild,currentHp:nwh},turn:"enemy",msg:`${ac.moves[mi]}: ${dmg} dmg.${eff}`}));
    setTimeout(()=>{
      const emi=Math.floor(Math.random()*4);const ed=calcDmg(wl,ac,emi);
      setBattleAnim({player:"shake",enemy:""});setTimeout(()=>setBattleAnim({player:"",enemy:""}),400);
      const nph=Math.max(0,ac.currentHp-ed);
      setParty(p=>{const np=[...p];np[activeIdx]={...np[activeIdx],currentHp:nph};return np;});
      if(nph<=0){
        const na=party.findIndex((c,i)=>i!==activeIdx&&c.currentHp>0);
        if(na!==-1){setActiveIdx(na);setBattleState(s=>({...s,turn:"player",menu:"main",msg:`¡${ac.name} cayó! ¡Adelante, ${party[na].name}!`}));}
        else{
          setBattleState(s=>({...s,turn:"none",msg:"¡Todos cayeron! Regresando al pueblo..."}));
          setTimeout(()=>{
            setParty(p=>p.map(c=>({...c,currentHp:Math.max(1,Math.floor(c.hp*0.3))})));
            setCurrentMap("pueblo");setPlayer({x:9,y:7,dir:"down",frame:0});endBattle(false);
          },2000);
        }
      } else setBattleState(s=>({...s,turn:"player",menu:"main",msg:`${wl.name}: ${wl.moves[emi]} (${ed} dmg)`}));
    },900);
  };

  const tryCapture=()=>{
    if(!battleState||battleState.turn!=="player") return;
    if(trainerBattle){setBattleState(s=>({...s,msg:"¡No puedes capturar Veilborn de un entrenador!"}));return;}
    const usePro=bag.proSpheres>0;
    if(!usePro&&bag.spheres<=0){setBattleState(s=>({...s,msg:"¡No tienes Runesferas!"}));return;}
    if(usePro) setBag(b=>({...b,proSpheres:b.proSpheres-1}));
    else setBag(b=>({...b,spheres:b.spheres-1}));
    const wl=battleState.wild,hp=wl.currentHp/wl.hp;
    let cr=Math.max(0.1,(1-hp)*0.7+0.15);if(usePro) cr=Math.min(0.95,cr*1.5);
    if(Math.random()<cr){
      setBattleState(s=>({...s,turn:"none",msg:`¡Capturaste a ${wl.name}!`}));
      setTimeout(()=>{
        if(party.length<6) setParty(p=>[...p,{...wl,xp:0}]);
        else addMsg(`Equipo lleno. ${wl.name} fue liberado.`);
        endBattle(true);addMsg(`¡${wl.name} (Nv.${wl.level}) capturado!`);
      },1500);
    } else {
      setBattleState(s=>({...s,turn:"enemy",msg:`¡${wl.name} escapó de la Runesfera!`}));
      setTimeout(()=>{
        const ac=party[activeIdx],emi=Math.floor(Math.random()*4),ed=calcDmg(wl,ac,emi);
        const nh=Math.max(0,ac.currentHp-ed);
        setParty(p=>{const np=[...p];np[activeIdx]={...np[activeIdx],currentHp:nh};return np;});
        setBattleState(s=>({...s,turn:"player",menu:"main",msg:`${wl.name}: ${wl.moves[emi]} (${ed} dmg)`}));
      },800);
    }
  };

  const usePotion=(sup)=>{
    const k=sup?"superPotions":"potions",hl=sup?60:25;
    if(bag[k]<=0){setBattleState(s=>({...s,msg:`¡No tienes ${sup?"Super Pociones":"Pociones"}!`}));return;}
    setBag(b=>({...b,[k]:b[k]-1}));const ac=party[activeIdx];
    setParty(p=>{const np=[...p];np[activeIdx]={...np[activeIdx],currentHp:Math.min(np[activeIdx].hp,np[activeIdx].currentHp+hl)};return np;});
    setBattleState(s=>({...s,msg:`¡${ac.name} recuperó ${hl} HP!`,turn:"enemy"}));
    setTimeout(()=>{
      const wl=battleState.wild,emi=Math.floor(Math.random()*4),ed=calcDmg(wl,ac,emi);
      const nh=Math.max(0,Math.min(ac.hp,ac.currentHp+hl)-ed);
      setParty(p=>{const np=[...p];np[activeIdx]={...np[activeIdx],currentHp:Math.max(0,nh)};return np;});
      setBattleState(s=>({...s,turn:"player",menu:"main",msg:`${wl.name}: ${wl.moves[emi]} (${ed} dmg)`}));
    },900);
  };

  const tryRun=()=>{
    if(trainerBattle){setBattleState(s=>({...s,msg:"¡No puedes huir de un entrenador!"}));return;}
    if(Math.random()<0.6){endBattle(false);addMsg("¡Escapaste!");}
    else setBattleState(s=>({...s,msg:"¡No pudiste escapar!"}));
  };

  const camX=Math.max(0,Math.min(map.w-VIEW_W,player.x-Math.floor(VIEW_W/2)));
  const camY=Math.max(0,Math.min(map.h-VIEW_H,player.y-Math.floor(VIEW_H/2)));

  const cs={width:"100%",maxWidth:480,margin:"0 auto",fontFamily:"'Courier New',monospace",
    background:"#0a0a1a",color:"#ecf0f1",borderRadius:8,overflow:"hidden",userSelect:"none",position:"relative"};
  const bs=(cl)=>({padding:"7px 10px",fontSize:11,fontFamily:"'Courier New',monospace",
    background:`${cl}22`,border:`1px solid ${cl}`,color:"#ecf0f1",borderRadius:4,cursor:"pointer"});
  const dp={width:38,height:38,fontSize:15,background:"#1a1a2e",border:"1px solid #444",
    color:"#ecf0f1",borderRadius:6,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",padding:0};

  // TITLE
  if(screen==="title") return (
    <div style={cs}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}@keyframes glow{0%,100%{text-shadow:0 0 10px #9b59b6}50%{text-shadow:0 0 25px #e74c3c,0 0 40px #9b59b6}}@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}`}</style>
      <div style={{padding:"40px 20px",textAlign:"center",background:"linear-gradient(180deg,#1a0a2e 0%,#0a0a1a 50%,#0a1a0a 100%)",minHeight:420}}>
        <div style={{fontSize:11,color:"#9b59b6",letterSpacing:4,marginBottom:8}}>⚔ ÓCO PRESENTA ⚔</div>
        <h1 style={{fontSize:28,margin:"20px 0",animation:"glow 3s infinite",color:"#f1c40f",letterSpacing:2}}>✦ RUNEVEIL ✦</h1>
        <div style={{fontSize:16,color:"#e74c3c",letterSpacing:3,marginBottom:20}}>CHRONICLES</div>
        <div style={{animation:"float 3s ease-in-out infinite",margin:"15px 0"}}>
          <svg width={72} height={72} viewBox="0 0 16 16" style={{imageRendering:"pixelated"}}>
            <rect x="6" y="2" width="4" height="8" fill="#9b59b6"/><rect x="5" y="3" width="6" height="6" fill="#bb77dd"/>
            <rect x="7" y="4" width="2" height="3" fill="#e8d5f5"/><rect x="6" y="10" width="4" height="3" fill="#7f8c8d"/>
          </svg>
        </div>
        <div style={{fontSize:10,color:"#7f8c8d",margin:"10px auto",lineHeight:1.6,maxWidth:340}}>
          Los cristales dimensionales se debilitan...<br/>El Sabio Oscuro Malachar se agita en su prisión...<br/>
          4 regiones · 17 criaturas · 8 entrenadores · 1 jefe final
        </div>
        <button onClick={()=>setScreen("starter")} style={{
          padding:"12px 40px",fontSize:15,background:"linear-gradient(135deg,#9b59b6,#e74c3c)",
          color:"#fff",border:"2px solid #f1c40f",borderRadius:4,cursor:"pointer",
          animation:"pulse 2s infinite",letterSpacing:2,fontFamily:"inherit",marginTop:15}}>▶ NUEVA PARTIDA</button>
        <div style={{marginTop:20,fontSize:9,color:"#444"}}>WASD/Flechas · P=Equipo · M=Misiones · Enter=Hablar</div>
      </div>
    </div>);

  // STARTER
  if(screen==="starter") return (
    <div style={cs}>
      <div style={{padding:"25px 12px",textAlign:"center",background:"linear-gradient(180deg,#1a0a2e,#0a0a1a)"}}>
        <h2 style={{color:"#f1c40f",fontSize:16,marginBottom:5}}>Profesor Elm</h2>
        <p style={{color:"#aaa",fontSize:11,marginBottom:15}}>"Elige tu primer Veilborn compañero."</p>
        <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
          {[0,1,2].map(id=>{const c=CREATURES[id];return(
            <button key={id} onClick={()=>pickStarter(id)} style={{
              padding:12,background:"#1a1a2e",border:`2px solid ${c.color}`,borderRadius:8,cursor:"pointer",width:120,textAlign:"center"}}>
              <CreatureSprite creature={c} size={52}/>
              <div style={{color:c.color,fontWeight:"bold",fontSize:13,marginTop:4}}>{c.name}</div>
              <div style={{color:TYPE_COLORS[c.type],fontSize:10}}>{TYPE_NAMES[c.type]}</div>
              <div style={{color:"#666",fontSize:9,marginTop:3}}>HP:{c.hp} ATK:{c.atk} DEF:{c.def}</div>
              <div style={{color:"#555",fontSize:9}}>Evoluciona Nv.{EVOLUTIONS[id].level}</div>
            </button>);})}
        </div>
      </div>
    </div>);

  // VICTORY
  if(screen==="victory") return (
    <div style={cs}>
      <style>{`@keyframes glow{0%,100%{text-shadow:0 0 10px #f1c40f}50%{text-shadow:0 0 30px #e74c3c,0 0 50px #f1c40f}}`}</style>
      <div style={{padding:"40px 20px",textAlign:"center",background:"linear-gradient(180deg,#0a0a2e,#1a0a0a)",minHeight:420}}>
        <h1 style={{color:"#f1c40f",animation:"glow 2s infinite",fontSize:24}}>✦ VICTORIA ✦</h1>
        <div style={{margin:"20px 0",fontSize:13,color:"#ecf0f1",lineHeight:1.8}}>
          ¡Has derrotado a Malachar!<br/><br/>Los cristales brillan con renovado poder.<br/>
          El Velo se fortalece y las grietas se cierran.<br/><br/>Runeveil está a salvo.<br/><br/>
          <span style={{color:"#9b59b6"}}>Los Veilborn y tú habéis forjado un vínculo eterno.</span>
        </div>
        <div style={{display:"flex",gap:6,justifyContent:"center",flexWrap:"wrap",margin:"15px 0"}}>
          {party.map((c,i)=>(<div key={i} style={{textAlign:"center"}}><CreatureSprite creature={c} size={40}/>
            <div style={{color:c.color,fontSize:9}}>{c.name} Nv.{c.level}</div></div>))}
        </div>
        <div style={{color:"#555",fontSize:10,marginTop:10}}>Un juego de ÓCO</div>
        <button onClick={()=>setScreen("world")} style={{...bs("#9b59b6"),marginTop:15,padding:"10px 30px"}}>Seguir explorando</button>
      </div>
    </div>);

  // BATTLE
  if(screen==="battle"&&battleState){
    const ac=party[activeIdx],wl=battleState.wild,isTr=!!trainerBattle;
    return (
      <div style={cs}>
        <style>{`@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}`}</style>
        <div style={{background:currentMap==="torre"?"linear-gradient(180deg,#0d001a,#1a0033)":currentMap==="cueva"?"linear-gradient(180deg,#1a1a2e,#0d0d1a)":"linear-gradient(180deg,#1a2a1a,#0a1a0a 40%,#1a0a1a)",padding:12,minHeight:400}}>
          {isTr&&<div style={{textAlign:"center",color:"#f39c12",fontSize:10,marginBottom:5}}>VS {trainerBattle.trainer.name} ({trainerBattle.currentIdx+1}/{trainerBattle.enemyParty.length})</div>}
          {/* Enemy */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:2}}>
                <span style={{color:wl.color,fontWeight:"bold",fontSize:12}}>{wl.name}</span>
                <span style={{color:"#888",fontSize:9}}>Nv.{wl.level}</span>
                <span style={{color:TYPE_COLORS[wl.type],fontSize:8,padding:"0 4px",background:"#1a1a2e",borderRadius:2}}>{TYPE_NAMES[wl.type]}</span>
              </div>
              <HPBar current={wl.currentHp} max={wl.hp}/><div style={{color:"#666",fontSize:9}}>{wl.currentHp}/{wl.hp}</div>
            </div>
            <div style={battleAnim.enemy==="shake"?{animation:"shake 0.3s"}:{}}><CreatureSprite creature={wl} size={64}/></div>
          </div>
          {/* Player */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",margin:"10px 0"}}>
            <div style={battleAnim.player==="shake"?{animation:"shake 0.3s"}:{}}><CreatureSprite creature={ac} size={64} flip/></div>
            <div style={{flex:1,marginLeft:10}}>
              <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:2}}>
                <span style={{color:ac.color,fontWeight:"bold",fontSize:12}}>{ac.name}</span>
                <span style={{color:"#888",fontSize:9}}>Nv.{ac.level}</span>
                <span style={{color:TYPE_COLORS[ac.type],fontSize:8,padding:"0 4px",background:"#1a1a2e",borderRadius:2}}>{TYPE_NAMES[ac.type]}</span>
              </div>
              <HPBar current={ac.currentHp} max={ac.hp}/><div style={{color:"#666",fontSize:9}}>{ac.currentHp}/{ac.hp} | XP:{ac.xp}/{ac.level*20}</div>
            </div>
          </div>
          <div style={{background:"#1a1a2e",border:"1px solid #333",borderRadius:5,padding:"6px 10px",fontSize:11,marginBottom:8,minHeight:30}}>{battleState.msg}</div>
          {/* Menus */}
          {battleState.turn==="player"&&battleState.menu==="main"&&(
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5}}>
              <button onClick={()=>setBattleState(s=>({...s,menu:"moves"}))} style={bs("#e74c3c")}>⚔ Atacar</button>
              <button onClick={tryCapture} style={bs("#3498db")}>◉ Capturar ({bag.spheres}{bag.proSpheres>0?`+${bag.proSpheres}P`:""})</button>
              <button onClick={()=>setBattleState(s=>({...s,menu:"items"}))} style={bs("#2ecc71")}>♥ Objetos</button>
              <button onClick={()=>setBattleState(s=>({...s,menu:"switch"}))} style={bs("#f39c12")}>↔ Cambiar</button>
              <button onClick={tryRun} style={{...bs("#95a5a6"),gridColumn:"1/-1"}}>↩ Huir</button>
            </div>)}
          {battleState.turn==="player"&&battleState.menu==="moves"&&(<div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5}}>
              {ac.moves.map((m,i)=>(<button key={i} onClick={()=>{doBattleAttack(i);setBattleState(s=>({...s,menu:"main"}));}} style={bs(ac.color)}>{m}</button>))}
            </div>
            <button onClick={()=>setBattleState(s=>({...s,menu:"main"}))} style={{...bs("#555"),marginTop:5,width:"100%"}}>← Volver</button>
          </div>)}
          {battleState.turn==="player"&&battleState.menu==="items"&&(<div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5}}>
              <button onClick={()=>usePotion(false)} style={bs("#2ecc71")}>Poción x{bag.potions}</button>
              <button onClick={()=>usePotion(true)} style={bs("#27ae60")}>Super Poción x{bag.superPotions}</button>
            </div>
            <button onClick={()=>setBattleState(s=>({...s,menu:"main"}))} style={{...bs("#555"),marginTop:5,width:"100%"}}>← Volver</button>
          </div>)}
          {battleState.turn==="player"&&battleState.menu==="switch"&&(<div>
            {party.map((c,i)=>(<button key={i} disabled={c.currentHp<=0||i===activeIdx}
              onClick={()=>{setActiveIdx(i);setBattleState(s=>({...s,menu:"main",msg:`¡Adelante, ${c.name}!`}));}}
              style={{...bs(c.color),width:"100%",marginBottom:3,opacity:(c.currentHp<=0||i===activeIdx)?0.4:1}}>
              {c.name} Nv.{c.level} — {c.currentHp}/{c.hp} HP {i===activeIdx?"★":""}
            </button>))}
            <button onClick={()=>setBattleState(s=>({...s,menu:"main"}))} style={{...bs("#555"),marginTop:5,width:"100%"}}>← Volver</button>
          </div>)}
        </div>
      </div>);
  }

  // WORLD
  return (
    <div style={cs} ref={gameRef} tabIndex={0}>
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}`}</style>
      {/* HUD */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 8px",background:"#111",borderBottom:"2px solid #333",fontSize:10,flexWrap:"wrap",gap:2}}>
        <div style={{display:"flex",gap:8}}>
          <span style={{color:"#f1c40f"}}>💰{bag.gold}</span>
          <span>◉{bag.spheres}{bag.proSpheres>0?`+${bag.proSpheres}P`:""}</span>
          <span style={{color:"#2ecc71"}}>♥{bag.potions}{bag.superPotions>0?`+${bag.superPotions}S`:""}</span>
          <span style={{color:"#9b59b6"}}>💎{crystalsFound.size}/3</span>
        </div>
        <div style={{color:"#888",fontSize:9}}>{map.name}</div>
        <div style={{display:"flex",gap:3}}>
          <button onClick={()=>setShowParty(s=>!s)} style={{background:"none",border:"1px solid #555",color:"#aaa",padding:"1px 6px",borderRadius:3,cursor:"pointer",fontSize:9}}>P</button>
          <button onClick={()=>setShowMissions(s=>!s)} style={{background:"none",border:"1px solid #555",color:"#aaa",padding:"1px 6px",borderRadius:3,cursor:"pointer",fontSize:9}}>M</button>
        </div>
      </div>
      {/* Map */}
      <div style={{position:"relative",width:VIEW_W*TILE,height:VIEW_H*TILE,margin:"0 auto",overflow:"hidden",background:map.bgColor}}>
        <div style={{position:"absolute",left:-camX*TILE,top:-camY*TILE}}>
          {map.data.map((row,y)=>row.map((tile,x)=>(<div key={`${x}-${y}`} style={{position:"absolute",left:x*TILE,top:y*TILE}}><Tile type={tile} mapId={currentMap}/></div>)))}
          {map.npcs?.map((n,i)=>(<div key={`n${i}`} style={{position:"absolute",left:n.x*TILE,top:n.y*TILE,zIndex:5}}><NPCSprite color={n.color}/></div>))}
          {map.trainers?.filter(t=>!defeatedTrainers.has(t.id)).map((t,i)=>(<div key={`t${i}`} style={{position:"absolute",left:t.x*TILE,top:t.y*TILE,zIndex:5}}><NPCSprite color={t.color}/></div>))}
          {map.boss&&!defeatedTrainers.has(map.boss.id)&&(<div style={{position:"absolute",left:map.boss.x*TILE,top:map.boss.y*TILE,zIndex:5}}><BossSprite/></div>)}
          {map.crystal&&!crystalsFound.has(map.crystal.id)&&(<div style={{position:"absolute",left:map.crystal.x*TILE,top:map.crystal.y*TILE,zIndex:4}}><Tile type={5} mapId={currentMap}/></div>)}
          <div style={{position:"absolute",left:player.x*TILE,top:player.y*TILE,zIndex:10}}><PlayerSprite dir={player.dir} frame={player.frame}/></div>
        </div>
      </div>
      {/* D-Pad */}
      <div style={{display:"flex",justifyContent:"center",padding:"6px 0",background:"#111"}}>
        <div style={{display:"grid",gridTemplateColumns:"38px 38px 38px",gridTemplateRows:"38px 38px 38px",gap:2}}>
          <div/><button onClick={()=>movePlayer(0,-1)} style={dp}>▲</button><div/>
          <button onClick={()=>movePlayer(-1,0)} style={dp}>◄</button><div style={{...dp,background:"#2c3e50",fontSize:8}}/>
          <button onClick={()=>movePlayer(1,0)} style={dp}>►</button>
          <div/><button onClick={()=>movePlayer(0,1)} style={dp}>▼</button><div/>
        </div>
      </div>
      {/* Log */}
      <div style={{padding:"4px 8px",background:"#0a0a15",borderTop:"1px solid #222",fontSize:9,color:"#7f8c8d",maxHeight:42,overflow:"hidden"}}>
        {msgLog.slice(-2).map((m,i)=><div key={i}>› {m}</div>)}
      </div>
      {/* Dialog */}
      {dialogState&&(<div style={{position:"absolute",bottom:85,left:8,right:8,background:"#1a1a2eee",border:"2px solid #f1c40f",borderRadius:8,padding:12,zIndex:20}}>
        <div style={{color:"#f1c40f",fontWeight:"bold",fontSize:12,marginBottom:4}}>{dialogState.npc.name}</div>
        <div style={{color:"#ecf0f1",fontSize:11,lineHeight:1.5,marginBottom:6}}>{dialogState.npc.dialog[dialogState.line]}</div>
        <button onClick={advanceDialog} style={{...bs("#f1c40f"),padding:"3px 14px",fontSize:10}}>
          {dialogState.line+1>=dialogState.npc.dialog.length?"OK":"Siguiente ▶"}</button>
      </div>)}
      {/* Shop */}
      {shopOpen&&(<div style={{position:"absolute",top:25,left:5,right:5,bottom:5,background:"#0a0a1aee",border:"2px solid #f39c12",borderRadius:8,padding:12,zIndex:20,overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
          <h3 style={{color:"#f39c12",margin:0,fontSize:14}}>🏪 Tienda</h3>
          <button onClick={()=>setShopOpen(false)} style={{background:"#e74c3c",border:"none",color:"#fff",padding:"2px 8px",borderRadius:4,cursor:"pointer",fontSize:10}}>✕</button>
        </div>
        <div style={{color:"#f1c40f",fontSize:11,marginBottom:8}}>💰 {bag.gold} oro</div>
        {SHOP_ITEMS.map((it,i)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 8px",background:"#1a1a2e",borderRadius:4,marginBottom:4,border:"1px solid #333"}}>
          <div><div style={{color:"#ecf0f1",fontSize:11}}>{it.name} <span style={{color:"#888",fontSize:9}}>({it.desc})</span></div>
            <div style={{color:"#f39c12",fontSize:10}}>{it.price} oro · Tienes: {bag[it.key]}</div></div>
          <button onClick={()=>{if(bag.gold>=it.price){setBag(b=>({...b,gold:b.gold-it.price,[it.key]:b[it.key]+1}));addMsg(`Compraste ${it.name}.`);}else addMsg("Oro insuficiente.");}} style={bs("#f39c12")}>Comprar</button>
        </div>))}
      </div>)}
      {/* Party */}
      {showParty&&(<div style={{position:"absolute",top:25,left:5,right:5,bottom:5,background:"#0a0a1aee",border:"2px solid #9b59b6",borderRadius:8,padding:12,zIndex:20,overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
          <h3 style={{color:"#f1c40f",margin:0,fontSize:14}}>✦ Equipo ({party.length}/6)</h3>
          <button onClick={()=>setShowParty(false)} style={{background:"#e74c3c",border:"none",color:"#fff",padding:"2px 8px",borderRadius:4,cursor:"pointer",fontSize:10}}>✕</button>
        </div>
        {party.map((c,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:6,background:"#1a1a2e",borderRadius:5,marginBottom:4,border:`1px solid ${c.color}33`}}>
          <CreatureSprite creature={c} size={40}/>
          <div style={{flex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:4}}>
              <span style={{color:c.color,fontWeight:"bold",fontSize:12}}>{c.name}</span>
              <span style={{color:"#888",fontSize:9}}>Nv.{c.level}</span>
              <span style={{color:TYPE_COLORS[c.type],fontSize:8,padding:"0 3px",background:"#0a0a1a",borderRadius:2}}>{TYPE_NAMES[c.type]}</span>
              {EVOLUTIONS[c.id]&&<span style={{color:"#555",fontSize:8}}>→Nv.{EVOLUTIONS[c.id].level}</span>}
            </div>
            <HPBar current={c.currentHp} max={c.hp} height={4}/>
            <div style={{color:"#666",fontSize:8}}>HP:{c.currentHp}/{c.hp} ATK:{c.atk} DEF:{c.def} SPD:{c.spd} | XP:{c.xp}/{c.level*20}</div>
            <div style={{color:"#555",fontSize:8}}>{c.moves.join(" · ")}</div>
          </div>
        </div>))}
      </div>)}
      {/* Missions */}
      {showMissions&&(<div style={{position:"absolute",top:25,left:5,right:5,bottom:5,background:"#0a0a1aee",border:"2px solid #f1c40f",borderRadius:8,padding:12,zIndex:20,overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
          <h3 style={{color:"#f1c40f",margin:0,fontSize:14}}>📜 Misiones</h3>
          <button onClick={()=>setShowMissions(false)} style={{background:"#e74c3c",border:"none",color:"#fff",padding:"2px 8px",borderRadius:4,cursor:"pointer",fontSize:10}}>✕</button>
        </div>
        {missions.map((m,i)=>(<div key={i} style={{padding:8,background:"#1a1a2e",borderRadius:5,marginBottom:5,border:`1px solid ${m.done?"#2ecc71":"#555"}`,opacity:m.done?0.7:1}}>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <span style={{color:m.done?"#2ecc71":"#f1c40f",fontSize:12}}>{m.done?"✓":"○"}</span>
            <span style={{color:"#ecf0f1",fontSize:11,fontWeight:"bold"}}>{m.name}</span>
          </div>
          <div style={{color:"#999",fontSize:10,marginTop:2}}>{m.desc}</div>
          <div style={{color:"#f39c12",fontSize:9,marginTop:2}}>Recompensa: {m.reward}</div>
        </div>))}
      </div>)}
      {/* Evolution popup */}
      {evolvePopup&&(<div style={{position:"absolute",top:0,left:0,right:0,bottom:0,background:"#000000dd",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",zIndex:30}}>
        <div style={{color:"#f1c40f",fontSize:16,marginBottom:15}}>✦ ¡EVOLUCIÓN! ✦</div>
        <div style={{display:"flex",alignItems:"center",gap:20}}>
          <div style={{textAlign:"center"}}><CreatureSprite creature={evolvePopup.from} size={56}/>
            <div style={{color:evolvePopup.from.color,fontSize:12,marginTop:4}}>{evolvePopup.from.name}</div></div>
          <div style={{color:"#f1c40f",fontSize:24}}>→</div>
          <div style={{textAlign:"center"}}><CreatureSprite creature={evolvePopup.to} size={64}/>
            <div style={{color:evolvePopup.to.color,fontSize:14,fontWeight:"bold",marginTop:4}}>{evolvePopup.to.name}</div></div>
        </div>
        <div style={{color:"#aaa",fontSize:11,marginTop:12}}>¡{evolvePopup.from.name} evolucionó a {evolvePopup.to.name}!</div>
        <button onClick={()=>setEvolvePopup(null)} style={{...bs("#f1c40f"),marginTop:15,padding:"8px 25px"}}>¡Genial!</button>
      </div>)}
    </div>);
}
