import type { StickmanTemplate, StickmanJoint, Point } from '../types/studio';

const j = (x: number, y: number): Point => ({ x, y });

const BONES: [StickmanJoint, StickmanJoint][] = [
  ['head', 'neck'], ['neck', 'torso'], ['torso', 'hip'],
  ['neck', 'lShoulder'], ['lShoulder', 'lElbow'], ['lElbow', 'lHand'],
  ['neck', 'rShoulder'], ['rShoulder', 'rElbow'], ['rElbow', 'rHand'],
  ['hip', 'lKnee'], ['lKnee', 'lFoot'],
  ['hip', 'rKnee'], ['rKnee', 'rFoot'],
];

export const STICKMAN_TEMPLATES: StickmanTemplate[] = [
  // ── HUMANOIDES ──
  {
    id: 'stand',
    name: 'Parado',
    emoji: '🧍',
    bones: BONES,
    poses: [{
      name: 'Parado', emoji: '🧍',
      joints: {
        head: j(0, -150), neck: j(0, -130), torso: j(0, -50),
        lShoulder: j(-35, -120), lElbow: j(-45, -80), lHand: j(-35, -40),
        rShoulder: j(35, -120), rElbow: j(45, -80), rHand: j(35, -40),
        hip: j(0, 0), lKnee: j(-20, 55), lFoot: j(-25, 110),
        rKnee: j(20, 55), rFoot: j(25, 110),
      },
    }],
  },
  {
    id: 'walk',
    name: 'Caminar',
    emoji: '🚶',
    bones: BONES,
    poses: [{
      name: 'Caminar', emoji: '🚶',
      joints: {
        head: j(15, -155), neck: j(12, -135), torso: j(8, -55),
        lShoulder: j(-22, -125), lElbow: j(-60, -90), lHand: j(-45, -50),
        rShoulder: j(45, -125), rElbow: j(75, -100), rHand: j(65, -55),
        hip: j(8, 0), lKnee: j(-40, 50), lFoot: j(-60, 108),
        rKnee: j(45, 40), rFoot: j(55, 105),
      },
    }],
  },
  {
    id: 'run',
    name: 'Correr',
    emoji: '🏃',
    bones: BONES,
    poses: [{
      name: 'Correr', emoji: '🏃',
      joints: {
        head: j(30, -155), neck: j(25, -135), torso: j(15, -55),
        lShoulder: j(-10, -125), lElbow: j(-70, -110), lHand: j(-50, -70),
        rShoulder: j(55, -125), rElbow: j(90, -140), rHand: j(110, -110),
        hip: j(15, 0), lKnee: j(-50, 40), lFoot: j(-75, 95),
        rKnee: j(60, 55), rFoot: j(85, 100),
      },
    }],
  },
  {
    id: 'jump',
    name: 'Saltar',
    emoji: '🤸',
    bones: BONES,
    poses: [{
      name: 'Saltar', emoji: '🤸',
      joints: {
        head: j(0, -180), neck: j(0, -160), torso: j(0, -80),
        lShoulder: j(-35, -150), lElbow: j(-80, -170), lHand: j(-100, -150),
        rShoulder: j(35, -150), rElbow: j(80, -170), rHand: j(100, -150),
        hip: j(0, -30), lKnee: j(-40, 15), lFoot: j(-50, 55),
        rKnee: j(40, 15), rFoot: j(50, 55),
      },
    }],
  },
  {
    id: 'sit',
    name: 'Sentado',
    emoji: '🪑',
    bones: BONES,
    poses: [{
      name: 'Sentado', emoji: '🪑',
      joints: {
        head: j(0, -135), neck: j(0, -115), torso: j(0, -45),
        lShoulder: j(-35, -105), lElbow: j(-60, -70), lHand: j(-45, -35),
        rShoulder: j(35, -105), rElbow: j(60, -70), rHand: j(45, -35),
        hip: j(0, 5), lKnee: j(-50, 5), lFoot: j(-55, 55),
        rKnee: j(50, 5), rFoot: j(55, 55),
      },
    }],
  },
  {
    id: 'dance',
    name: 'Bailar',
    emoji: '💃',
    bones: BONES,
    poses: [{
      name: 'Bailar', emoji: '💃',
      joints: {
        head: j(-15, -155), neck: j(-10, -135), torso: j(-8, -55),
        lShoulder: j(-40, -125), lElbow: j(-85, -150), lHand: j(-100, -120),
        rShoulder: j(30, -125), rElbow: j(75, -110), rHand: j(95, -80),
        hip: j(-8, 0), lKnee: j(-55, 45), lFoot: j(-75, 100),
        rKnee: j(35, 50), rFoot: j(60, 100),
      },
    }],
  },
  {
    id: 'fight',
    name: 'Luchar',
    emoji: '🥊',
    bones: BONES,
    poses: [{
      name: 'Luchar', emoji: '🥊',
      joints: {
        head: j(20, -145), neck: j(15, -125), torso: j(8, -50),
        lShoulder: j(-20, -115), lElbow: j(-15, -85), lHand: j(5, -60),
        rShoulder: j(45, -115), rElbow: j(80, -105), rHand: j(120, -100),
        hip: j(8, 0), lKnee: j(-30, 50), lFoot: j(-40, 105),
        rKnee: j(40, 45), rFoot: j(50, 100),
      },
    }],
  },
  {
    id: 'fly',
    name: 'Volar',
    emoji: '🦸',
    bones: BONES,
    poses: [{
      name: 'Volar', emoji: '🦸',
      joints: {
        head: j(0, -70), neck: j(0, -55), torso: j(0, 20),
        lShoulder: j(-30, -45), lElbow: j(-75, -25), lHand: j(-105, -35),
        rShoulder: j(30, -45), rElbow: j(75, -25), rHand: j(105, -35),
        hip: j(0, 55), lKnee: j(-25, 90), lFoot: j(-30, 120),
        rKnee: j(25, 90), rFoot: j(30, 120),
      },
    }],
  },
  {
    id: 'wave',
    name: 'Saludar',
    emoji: '👋',
    bones: BONES,
    poses: [{
      name: 'Saludar', emoji: '👋',
      joints: {
        head: j(5, -150), neck: j(3, -130), torso: j(0, -50),
        lShoulder: j(-35, -120), lElbow: j(-50, -85), lHand: j(-40, -45),
        rShoulder: j(35, -120), rElbow: j(65, -155), rHand: j(80, -130),
        hip: j(0, 0), lKnee: j(-20, 55), lFoot: j(-25, 110),
        rKnee: j(20, 55), rFoot: j(25, 110),
      },
    }],
  },

  // ── ANIMALES ──
  {
    id: 'dog-stand',
    name: 'Perro',
    emoji: '🐕',
    bones: BONES,
    poses: [{
      name: 'De pie', emoji: '🐕',
      joints: {
        head: j(70, -55), neck: j(40, -40), torso: j(-15, -35),
        lShoulder: j(-35, -30), lElbow: j(-40, 10), lHand: j(-45, 55),
        rShoulder: j(10, -30), rElbow: j(5, 10), rHand: j(0, 55),
        hip: j(-65, -35), lKnee: j(-70, 10), lFoot: j(-75, 55),
        rKnee: j(-50, 10), rFoot: j(-55, 55),
      },
    }],
  },
  {
    id: 'dog-run',
    name: 'Perro Correr',
    emoji: '🏇',
    bones: BONES,
    poses: [{
      name: 'Correr', emoji: '🏇',
      joints: {
        head: j(90, -65), neck: j(60, -50), torso: j(-5, -45),
        lShoulder: j(-20, -40), lElbow: j(-65, -15), lHand: j(-80, 25),
        rShoulder: j(25, -40), rElbow: j(50, -10), rHand: j(65, 25),
        hip: j(-55, -40), lKnee: j(-90, -10), lFoot: j(-100, 30),
        rKnee: j(-35, 5), rFoot: j(-20, 35),
      },
    }],
  },
  {
    id: 'bird',
    name: 'Pájaro',
    emoji: '🐦',
    bones: BONES,
    poses: [{
      name: 'Volar', emoji: '🐦',
      joints: {
        head: j(50, -60), neck: j(25, -45), torso: j(-10, -40),
        lShoulder: j(-10, -50), lElbow: j(-50, -80), lHand: j(-90, -70),
        rShoulder: j(-5, -50), rElbow: j(-30, -85), rHand: j(-50, -110),
        hip: j(-35, -35), lKnee: j(-50, -10), lFoot: j(-60, 15),
        rKnee: j(-25, -5), rFoot: j(-15, 15),
      },
    }],
  },
  {
    id: 'cat',
    name: 'Gato',
    emoji: '🐱',
    bones: BONES,
    poses: [{
      name: 'Sentado', emoji: '🐱',
      joints: {
        head: j(50, -65), neck: j(25, -50), torso: j(-10, -45),
        lShoulder: j(-25, -40), lElbow: j(-30, -5), lHand: j(-35, 35),
        rShoulder: j(15, -40), rElbow: j(10, -5), rHand: j(5, 35),
        hip: j(-45, -40), lKnee: j(-55, -5), lFoot: j(-60, 30),
        rKnee: j(-35, 0), rFoot: j(-25, 30),
      },
    }],
  },

  // ── CICLOS DE ANIMACIÓN (multiposes) ──
  {
    id: 'walk-cycle',
    name: 'Ciclo Caminar',
    emoji: '🚶',
    bones: BONES,
    poses: [
      {
        name: 'Contacto', emoji: '🚶',
        joints: {
          head: j(10, -150), neck: j(8, -130), torso: j(5, -50),
          lShoulder: j(-25, -120), lElbow: j(-55, -85), lHand: j(-40, -45),
          rShoulder: j(38, -120), rElbow: j(65, -95), rHand: j(55, -55),
          hip: j(5, 0), lKnee: j(-35, 50), lFoot: j(-55, 105),
          rKnee: j(40, 45), rFoot: j(55, 105),
        },
      },
      {
        name: 'Down', emoji: '🚶',
        joints: {
          head: j(5, -148), neck: j(4, -128), torso: j(2, -48),
          lShoulder: j(-28, -118), lElbow: j(-50, -80), lHand: j(-35, -40),
          rShoulder: j(35, -118), rElbow: j(55, -85), rHand: j(45, -45),
          hip: j(2, 0), lKnee: j(-20, 52), lFoot: j(-25, 108),
          rKnee: j(25, 48), rFoot: j(35, 106),
        },
      },
      {
        name: 'Passing', emoji: '🚶',
        joints: {
          head: j(0, -152), neck: j(0, -132), torso: j(0, -52),
          lShoulder: j(-30, -122), lElbow: j(-40, -90), lHand: j(-30, -55),
          rShoulder: j(30, -122), rElbow: j(35, -88), rHand: j(25, -50),
          hip: j(0, 0), lKnee: j(-10, 55), lFoot: j(-15, 108),
          rKnee: j(10, 40), rFoot: j(15, 105),
        },
      },
      {
        name: 'Up', emoji: '🚶',
        joints: {
          head: j(-5, -155), neck: j(-4, -135), torso: j(-2, -55),
          lShoulder: j(-32, -125), lElbow: j(-30, -95), lHand: j(-20, -60),
          rShoulder: j(28, -125), rElbow: j(40, -92), rHand: j(30, -55),
          hip: j(-2, 0), lKnee: j(20, 45), lFoot: j(30, 105),
          rKnee: j(-30, 50), rFoot: j(-45, 108),
        },
      },
    ],
  },
  {
    id: 'run-cycle',
    name: 'Ciclo Correr',
    emoji: '🏃',
    bones: BONES,
    poses: [
      {
        name: 'Push', emoji: '🏃',
        joints: {
          head: j(25, -150), neck: j(20, -130), torso: j(12, -50),
          lShoulder: j(-8, -120), lElbow: j(-65, -105), lHand: j(-45, -65),
          rShoulder: j(48, -120), rElbow: j(85, -135), rHand: j(105, -105),
          hip: j(12, 0), lKnee: j(-55, 35), lFoot: j(-75, 90),
          rKnee: j(55, 55), rFoot: j(80, 100),
        },
      },
      {
        name: 'Float', emoji: '🏃',
        joints: {
          head: j(30, -155), neck: j(25, -135), torso: j(15, -55),
          lShoulder: j(-5, -125), lElbow: j(-50, -115), lHand: j(-35, -80),
          rShoulder: j(50, -125), rElbow: j(80, -145), rHand: j(100, -120),
          hip: j(15, 0), lKnee: j(-40, 30), lFoot: j(-55, 85),
          rKnee: j(45, 45), rFoot: j(60, 95),
        },
      },
      {
        name: 'Contact', emoji: '🏃',
        joints: {
          head: j(20, -148), neck: j(18, -128), torso: j(10, -48),
          lShoulder: j(-12, -118), lElbow: j(-70, -100), lHand: j(-55, -60),
          rShoulder: j(45, -118), rElbow: j(75, -130), rHand: j(95, -100),
          hip: j(10, 0), lKnee: j(-50, 40), lFoot: j(-70, 95),
          rKnee: j(50, 50), rFoot: j(70, 100),
        },
      },
    ],
  },
  {
    id: 'jump-cycle',
    name: 'Ciclo Saltar',
    emoji: '🤸',
    bones: BONES,
    poses: [
      {
        name: 'Preparar', emoji: '🤸',
        joints: {
          head: j(0, -135), neck: j(0, -115), torso: j(0, -40),
          lShoulder: j(-30, -105), lElbow: j(-45, -70), lHand: j(-35, -35),
          rShoulder: j(30, -105), rElbow: j(45, -70), rHand: j(35, -35),
          hip: j(0, 0), lKnee: j(-30, 60), lFoot: j(-35, 115),
          rKnee: j(30, 60), rFoot: j(35, 115),
        },
      },
      {
        name: 'Despegue', emoji: '🤸',
        joints: {
          head: j(0, -165), neck: j(0, -145), torso: j(0, -65),
          lShoulder: j(-32, -135), lElbow: j(-60, -155), lHand: j(-75, -135),
          rShoulder: j(32, -135), rElbow: j(60, -155), rHand: j(75, -135),
          hip: j(0, -25), lKnee: j(-30, 15), lFoot: j(-35, 55),
          rKnee: j(30, 15), rFoot: j(35, 55),
        },
      },
      {
        name: 'Aire', emoji: '🤸',
        joints: {
          head: j(0, -175), neck: j(0, -155), torso: j(0, -75),
          lShoulder: j(-35, -145), lElbow: j(-75, -165), lHand: j(-95, -145),
          rShoulder: j(35, -145), rElbow: j(75, -165), rHand: j(95, -145),
          hip: j(0, -35), lKnee: j(-35, 5), lFoot: j(-40, 45),
          rKnee: j(35, 5), rFoot: j(40, 45),
        },
      },
      {
        name: 'Caer', emoji: '🤸',
        joints: {
          head: j(0, -145), neck: j(0, -125), torso: j(0, -45),
          lShoulder: j(-30, -115), lElbow: j(-55, -100), lHand: j(-45, -65),
          rShoulder: j(30, -115), rElbow: j(55, -100), rHand: j(45, -65),
          hip: j(0, 0), lKnee: j(-35, 55), lFoot: j(-40, 110),
          rKnee: j(35, 55), rFoot: j(40, 110),
        },
      },
    ],
  },
  {
    id: 'dance-cycle',
    name: 'Ciclo Bailar',
    emoji: '💃',
    bones: BONES,
    poses: [
      {
        name: 'Base', emoji: '💃',
        joints: {
          head: j(-5, -150), neck: j(-3, -130), torso: j(-3, -50),
          lShoulder: j(-33, -120), lElbow: j(-70, -135), lHand: j(-85, -110),
          rShoulder: j(28, -120), rElbow: j(60, -105), rHand: j(80, -75),
          hip: j(-3, 0), lKnee: j(-40, 48), lFoot: j(-60, 100),
          rKnee: j(30, 48), rFoot: j(50, 100),
        },
      },
      {
        name: 'Izq', emoji: '💃',
        joints: {
          head: j(-15, -148), neck: j(-12, -128), torso: j(-10, -48),
          lShoulder: j(-40, -118), lElbow: j(-80, -145), lHand: j(-100, -120),
          rShoulder: j(22, -118), rElbow: j(50, -100), rHand: j(65, -70),
          hip: j(-10, 0), lKnee: j(-50, 45), lFoot: j(-70, 98),
          rKnee: j(25, 50), rFoot: j(45, 102),
        },
      },
      {
        name: 'Der', emoji: '💃',
        joints: {
          head: j(10, -152), neck: j(8, -132), torso: j(5, -52),
          lShoulder: j(-25, -122), lElbow: j(-55, -110), lHand: j(-70, -80),
          rShoulder: j(35, -122), rElbow: j(75, -150), rHand: j(95, -125),
          hip: j(5, 0), lKnee: j(-35, 50), lFoot: j(-55, 102),
          rKnee: j(35, 45), rFoot: j(55, 98),
        },
      },
    ],
  },
];
