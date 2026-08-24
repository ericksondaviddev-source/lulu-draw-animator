import type { PixelTemplate, PixelPartId, StickmanJoint, Point } from '../types/studio';

const BONES: [StickmanJoint, StickmanJoint][] = [
  ['head', 'neck'], ['neck', 'torso'], ['torso', 'hip'],
  ['lShoulder', 'lElbow'], ['lElbow', 'lHand'],
  ['rShoulder', 'rElbow'], ['rElbow', 'rHand'],
  ['hip', 'lKnee'], ['lKnee', 'lFoot'],
  ['hip', 'rKnee'], ['rKnee', 'rFoot'],
];

const j = (x: number, y: number): Point => ({ x, y });

const HEAD: PixelPartId = 'head';
const BODY: PixelPartId = 'body';
const L_ARM_U: PixelPartId = 'lArmUpper';
const L_ARM_L: PixelPartId = 'lArmLower';
const R_ARM_U: PixelPartId = 'rArmUpper';
const R_ARM_L: PixelPartId = 'rArmLower';
const L_LEG_U: PixelPartId = 'lLegUpper';
const L_LEG_L: PixelPartId = 'lLegLower';
const R_LEG_U: PixelPartId = 'rLegUpper';
const R_LEG_L: PixelPartId = 'rLegLower';
const HAT: PixelPartId = 'hat';
const ACC: PixelPartId = 'accessory';

export const PIXEL_TEMPLATES: PixelTemplate[] = [
  // ── PERSONAJE BÁSICO ──
  {
    id: 'pixel-hero',
    name: 'Héroe',
    emoji: '🎮',
    parts: [
      { id: HEAD, label: 'Cabeza', joint: 'head', width: 24, height: 24, color: '#fbbf24', details: '👁️' },
      { id: BODY, label: 'Cuerpo', joint: 'torso', width: 20, height: 28, color: '#3b82f6' },
      { id: L_ARM_U, label: 'Brazo Izq', joint: 'lShoulder', width: 10, height: 18, color: '#fbbf24' },
      { id: L_ARM_L, label: 'Ante. Izq', joint: 'lElbow', width: 10, height: 16, color: '#fbbf24' },
      { id: R_ARM_U, label: 'Brazo Der', joint: 'rShoulder', width: 10, height: 18, color: '#fbbf24' },
      { id: R_ARM_L, label: 'Ante. Der', joint: 'rElbow', width: 10, height: 16, color: '#fbbf24' },
      { id: L_LEG_U, label: 'Muslo Izq', joint: 'lKnee', width: 10, height: 18, color: '#1e40af' },
      { id: L_LEG_L, label: 'Pant. Izq', joint: 'lFoot', width: 10, height: 14, color: '#1e3a5f' },
      { id: R_LEG_U, label: 'Muslo Der', joint: 'rKnee', width: 10, height: 18, color: '#1e40af' },
      { id: R_LEG_L, label: 'Pant. Der', joint: 'rFoot', width: 10, height: 14, color: '#1e3a5f' },
    ],
    bones: BONES,
    poses: [
      {
        name: 'Parado', emoji: '🧍',
        joints: {
          head: j(0, -100), neck: j(0, -82), torso: j(0, -30),
          lShoulder: j(-18, -70), lElbow: j(-22, -42), lHand: j(-22, -16),
          rShoulder: j(18, -70), rElbow: j(22, -42), rHand: j(22, -16),
          hip: j(0, 0), lKnee: j(-10, 30), lFoot: j(-10, 62),
          rKnee: j(10, 30), rFoot: j(10, 62),
        },
      },
      {
        name: 'Caminar', emoji: '🚶',
        joints: {
          head: j(5, -100), neck: j(3, -82), torso: j(2, -30),
          lShoulder: j(-16, -70), lElbow: j(-35, -50), lHand: j(-30, -22),
          rShoulder: j(20, -70), rElbow: j(42, -55), rHand: j(38, -28),
          hip: j(2, 0), lKnee: j(-18, 30), lFoot: j(-28, 62),
          rKnee: j(22, 28), rFoot: j(30, 60),
        },
      },
      {
        name: 'Correr', emoji: '🏃',
        joints: {
          head: j(15, -98), neck: j(12, -80), torso: j(8, -28),
          lShoulder: j(-10, -68), lElbow: j(-45, -55), lHand: j(-38, -28),
          rShoulder: j(26, -68), rElbow: j(55, -75), rHand: j(50, -45),
          hip: j(8, 2), lKnee: j(-25, 32), lFoot: j(-40, 64),
          rKnee: j(35, 25), rFoot: j(48, 60),
        },
      },
      {
        name: 'Saltar', emoji: '🤸',
        joints: {
          head: j(0, -120), neck: j(0, -102), torso: j(0, -50),
          lShoulder: j(-20, -90), lElbow: j(-50, -105), lHand: j(-45, -75),
          rShoulder: j(20, -90), rElbow: j(50, -105), rHand: j(45, -75),
          hip: j(0, -18), lKnee: j(-25, 10), lFoot: j(-30, 45),
          rKnee: j(25, 10), rFoot: j(30, 45),
        },
      },
      {
        name: 'Sentado', emoji: '🪑',
        joints: {
          head: j(0, -80), neck: j(0, -62), torso: j(0, -12),
          lShoulder: j(-18, -50), lElbow: j(-28, -22), lHand: j(-22, 5),
          rShoulder: j(18, -50), rElbow: j(28, -22), rHand: j(22, 5),
          hip: j(0, 12), lKnee: j(-25, 20), lFoot: j(-35, 42),
          rKnee: j(25, 20), rFoot: j(35, 42),
        },
      },
      {
        name: 'Bailar', emoji: '💃',
        joints: {
          head: j(-8, -102), neck: j(-5, -84), torso: j(-3, -32),
          lShoulder: j(-22, -72), lElbow: j(-55, -95), lHand: j(-60, -68),
          rShoulder: j(15, -72), rElbow: j(45, -55), rHand: j(58, -30),
          hip: j(-3, 0), lKnee: j(-25, 32), lFoot: j(-40, 62),
          rKnee: j(18, 28), rFoot: j(30, 60),
        },
      },
    ],
  },

  // ── ROBOT ──
  {
    id: 'pixel-robot',
    name: 'Robot',
    emoji: '🤖',
    parts: [
      { id: HEAD, label: 'Cabeza', joint: 'head', width: 26, height: 22, color: '#9ca3af', details: '🔴' },
      { id: BODY, label: 'Cuerpo', joint: 'torso', width: 24, height: 30, color: '#6b7280' },
      { id: L_ARM_U, label: 'Brazo Izq', joint: 'lShoulder', width: 10, height: 20, color: '#9ca3af' },
      { id: L_ARM_L, label: 'Ante. Izq', joint: 'lElbow', width: 10, height: 18, color: '#9ca3af' },
      { id: R_ARM_U, label: 'Brazo Der', joint: 'rShoulder', width: 10, height: 20, color: '#9ca3af' },
      { id: R_ARM_L, label: 'Ante. Der', joint: 'rElbow', width: 10, height: 18, color: '#9ca3af' },
      { id: L_LEG_U, label: 'Pata Izq', joint: 'lKnee', width: 10, height: 20, color: '#6b7280' },
      { id: L_LEG_L, label: 'Pie Izq', joint: 'lFoot', width: 12, height: 10, color: '#4b5563' },
      { id: R_LEG_U, label: 'Pata Der', joint: 'rKnee', width: 10, height: 20, color: '#6b7280' },
      { id: R_LEG_L, label: 'Pie Der', joint: 'rFoot', width: 12, height: 10, color: '#4b5563' },
    ],
    bones: BONES,
    poses: [
      {
        name: 'Parado', emoji: '🤖',
        joints: {
          head: j(0, -102), neck: j(0, -84), torso: j(0, -30),
          lShoulder: j(-20, -72), lElbow: j(-24, -42), lHand: j(-24, -14),
          rShoulder: j(20, -72), rElbow: j(24, -42), rHand: j(24, -14),
          hip: j(0, 0), lKnee: j(-10, 32), lFoot: j(-10, 62),
          rKnee: j(10, 32), rFoot: j(10, 62),
        },
      },
      {
        name: 'Saludo', emoji: '👋',
        joints: {
          head: j(0, -102), neck: j(0, -84), torso: j(0, -30),
          lShoulder: j(-20, -72), lElbow: j(-28, -42), lHand: j(-28, -14),
          rShoulder: j(20, -72), rElbow: j(50, -90), rHand: j(58, -65),
          hip: j(0, 0), lKnee: j(-10, 32), lFoot: j(-10, 62),
          rKnee: j(10, 32), rFoot: j(10, 62),
        },
      },
    ],
  },

  // ── ZOMBIE ──
  {
    id: 'pixel-zombie',
    name: 'Zombie',
    emoji: '🧟',
    parts: [
      { id: HEAD, label: 'Cabeza', joint: 'head', width: 24, height: 24, color: '#4ade80', details: '💀' },
      { id: BODY, label: 'Cuerpo', joint: 'torso', width: 20, height: 28, color: '#22c55e' },
      { id: L_ARM_U, label: 'Brazo Izq', joint: 'lShoulder', width: 10, height: 18, color: '#4ade80' },
      { id: L_ARM_L, label: 'Ante. Izq', joint: 'lElbow', width: 10, height: 16, color: '#4ade80' },
      { id: R_ARM_U, label: 'Brazo Der', joint: 'rShoulder', width: 10, height: 18, color: '#4ade80' },
      { id: R_ARM_L, label: 'Ante. Der', joint: 'rElbow', width: 10, height: 16, color: '#4ade80' },
      { id: L_LEG_U, label: 'Muslo Izq', joint: 'lKnee', width: 10, height: 18, color: '#166534' },
      { id: L_LEG_L, label: 'Pant. Izq', joint: 'lFoot', width: 10, height: 14, color: '#14532d' },
      { id: R_LEG_U, label: 'Muslo Der', joint: 'rKnee', width: 10, height: 18, color: '#166534' },
      { id: R_LEG_L, label: 'Pant. Der', joint: 'rFoot', width: 10, height: 14, color: '#14532d' },
    ],
    bones: BONES,
    poses: [
      {
        name: 'Avanzar', emoji: '🧟',
        joints: {
          head: j(5, -98), neck: j(3, -80), torso: j(2, -28),
          lShoulder: j(-18, -68), lElbow: j(-55, -78), lHand: j(-65, -50),
          rShoulder: j(22, -68), rElbow: j(58, -82), rHand: j(68, -55),
          hip: j(2, 2), lKnee: j(-12, 32), lFoot: j(-18, 64),
          rKnee: j(18, 28), rFoot: j(22, 62),
        },
      },
    ],
  },

  // ── KNIGHT ──
  {
    id: 'pixel-knight',
    name: 'Caballero',
    emoji: '⚔️',
    parts: [
      { id: HEAD, label: 'Cabeza', joint: 'head', width: 24, height: 24, color: '#d1d5db', details: '⛑️' },
      { id: HAT, label: 'Casco', joint: 'head', width: 28, height: 10, color: '#9ca3af' },
      { id: BODY, label: 'Cuerpo', joint: 'torso', width: 22, height: 30, color: '#6b7280' },
      { id: L_ARM_U, label: 'Brazo Izq', joint: 'lShoulder', width: 12, height: 18, color: '#9ca3af' },
      { id: L_ARM_L, label: 'Ante. Izq', joint: 'lElbow', width: 10, height: 16, color: '#d1d5db' },
      { id: R_ARM_U, label: 'Brazo Der', joint: 'rShoulder', width: 12, height: 18, color: '#9ca3af' },
      { id: R_ARM_L, label: 'Ante. Der', joint: 'rElbow', width: 10, height: 16, color: '#d1d5db' },
      { id: L_LEG_U, label: 'Muslo Izq', joint: 'lKnee', width: 10, height: 18, color: '#6b7280' },
      { id: L_LEG_L, label: 'Bota Izq', joint: 'lFoot', width: 12, height: 14, color: '#4b5563' },
      { id: R_LEG_U, label: 'Muslo Der', joint: 'rKnee', width: 10, height: 18, color: '#6b7280' },
      { id: R_LEG_L, label: 'Bota Der', joint: 'rFoot', width: 12, height: 14, color: '#4b5563' },
    ],
    bones: BONES,
    poses: [
      {
        name: 'Batalla', emoji: '⚔️',
        joints: {
          head: j(0, -104), neck: j(0, -86), torso: j(0, -32),
          lShoulder: j(-20, -74), lElbow: j(-40, -55), lHand: j(-35, -28),
          rShoulder: j(20, -74), rElbow: j(50, -90), rHand: j(55, -60),
          hip: j(0, 0), lKnee: j(-15, 32), lFoot: j(-20, 64),
          rKnee: j(15, 30), rFoot: j(20, 62),
        },
      },
    ],
  },

  // ── ALIEN ──
  {
    id: 'pixel-alien',
    name: 'Alienígena',
    emoji: '👽',
    parts: [
      { id: HEAD, label: 'Cabeza', joint: 'head', width: 28, height: 22, color: '#86efac', details: '👁️👁️' },
      { id: BODY, label: 'Cuerpo', joint: 'torso', width: 18, height: 26, color: '#4ade80' },
      { id: L_ARM_U, label: 'Brazo Izq', joint: 'lShoulder', width: 8, height: 22, color: '#86efac' },
      { id: L_ARM_L, label: 'Ante. Izq', joint: 'lElbow', width: 8, height: 18, color: '#86efac' },
      { id: R_ARM_U, label: 'Brazo Der', joint: 'rShoulder', width: 8, height: 22, color: '#86efac' },
      { id: R_ARM_L, label: 'Ante. Der', joint: 'rElbow', width: 8, height: 18, color: '#86efac' },
      { id: L_LEG_U, label: 'Pata Izq', joint: 'lKnee', width: 8, height: 22, color: '#22c55e' },
      { id: L_LEG_L, label: 'Pie Izq', joint: 'lFoot', width: 10, height: 10, color: '#16a34a' },
      { id: R_LEG_U, label: 'Pata Der', joint: 'rKnee', width: 8, height: 22, color: '#22c55e' },
      { id: R_LEG_L, label: 'Pie Der', joint: 'rFoot', width: 10, height: 10, color: '#16a34a' },
    ],
    bones: BONES,
    poses: [
      {
        name: 'Flotar', emoji: '👽',
        joints: {
          head: j(0, -108), neck: j(0, -90), torso: j(0, -38),
          lShoulder: j(-16, -78), lElbow: j(-42, -95), lHand: j(-50, -70),
          rShoulder: j(16, -78), rElbow: j(42, -95), rHand: j(50, -70),
          hip: j(0, -8), lKnee: j(-14, 18), lFoot: j(-16, 48),
          rKnee: j(14, 18), rFoot: j(16, 48),
        },
      },
    ],
  },

  // ── NINJA ──
  {
    id: 'pixel-ninja',
    name: 'Ninja',
    emoji: '🥷',
    parts: [
      { id: HEAD, label: 'Cabeza', joint: 'head', width: 22, height: 22, color: '#1e293b', details: '🔴' },
      { id: BODY, label: 'Cuerpo', joint: 'torso', width: 20, height: 26, color: '#334155' },
      { id: L_ARM_U, label: 'Brazo Izq', joint: 'lShoulder', width: 10, height: 16, color: '#1e293b' },
      { id: L_ARM_L, label: 'Ante. Izq', joint: 'lElbow', width: 10, height: 14, color: '#1e293b' },
      { id: R_ARM_U, label: 'Brazo Der', joint: 'rShoulder', width: 10, height: 16, color: '#1e293b' },
      { id: R_ARM_L, label: 'Ante. Der', joint: 'rElbow', width: 10, height: 14, color: '#1e293b' },
      { id: L_LEG_U, label: 'Muslo Izq', joint: 'lKnee', width: 10, height: 16, color: '#0f172a' },
      { id: L_LEG_L, label: 'Bota Izq', joint: 'lFoot', width: 10, height: 12, color: '#1e293b' },
      { id: R_LEG_U, label: 'Muslo Der', joint: 'rKnee', width: 10, height: 16, color: '#0f172a' },
      { id: R_LEG_L, label: 'Bota Der', joint: 'rFoot', width: 10, height: 12, color: '#1e293b' },
    ],
    bones: BONES,
    poses: [
      {
        name: 'Lucha', emoji: '🥷',
        joints: {
          head: j(8, -100), neck: j(5, -82), torso: j(3, -30),
          lShoulder: j(-16, -70), lElbow: j(-45, -65), lHand: j(-40, -35),
          rShoulder: j(22, -70), rElbow: j(55, -80), rHand: j(62, -50),
          hip: j(3, 0), lKnee: j(-15, 30), lFoot: j(-22, 62),
          rKnee: j(25, 25), rFoot: j(35, 58),
        },
      },
      {
        name: 'Sigiloso', emoji: '🥷',
        joints: {
          head: j(0, -92), neck: j(0, -74), torso: j(0, -24),
          lShoulder: j(-16, -62), lElbow: j(-30, -38), lHand: j(-25, -14),
          rShoulder: j(16, -62), rElbow: j(30, -38), rHand: j(25, -14),
          hip: j(0, 4), lKnee: j(-20, 22), lFoot: j(-30, 52),
          rKnee: j(20, 22), rFoot: j(30, 52),
        },
      },
    ],
  },
];
