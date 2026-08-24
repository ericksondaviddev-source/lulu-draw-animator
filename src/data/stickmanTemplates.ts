import type { StickmanTemplate, StickmanJoint, Point } from '../types/studio';

const BONES: [StickmanJoint, StickmanJoint][] = [
  ['head', 'neck'],
  ['neck', 'torso'],
  ['torso', 'hip'],
  ['lShoulder', 'lElbow'],
  ['lElbow', 'lHand'],
  ['rShoulder', 'rElbow'],
  ['rElbow', 'rHand'],
  ['hip', 'lKnee'],
  ['lKnee', 'lFoot'],
  ['hip', 'rKnee'],
  ['rKnee', 'rFoot'],
];

const j = (x: number, y: number): Point => ({ x, y });

export const STICKMAN_TEMPLATES: StickmanTemplate[] = [
  {
    id: 'basic',
    name: 'Amigo',
    emoji: '🧑',
    bones: BONES,
    poses: [
      {
        name: 'Parado',
        emoji: '🧍',
        joints: {
          head: j(0, -100),
          neck: j(0, -82),
          torso: j(0, -30),
          lShoulder: j(-25, -70),
          lElbow: j(-45, -40),
          lHand: j(-35, -12),
          rShoulder: j(25, -70),
          rElbow: j(45, -40),
          rHand: j(35, -12),
          hip: j(0, 0),
          lKnee: j(-12, 35),
          lFoot: j(-12, 72),
          rKnee: j(12, 35),
          rFoot: j(12, 72),
        },
      },
    ],
  },
];
