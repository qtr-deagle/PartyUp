import { Anchor, Bike, Camera, Car, Compass, Crown, Flame, Heart, Leaf, Mountain, Plane, Shield, Star, Sun, Tent, TreePalm, Trees, Utensils, Waves, Zap } from 'lucide-react';
import type { GuildEmblem as Emblem } from '@/lib/guilds';

const ICONS = {
  shield: Shield,
  flame: Flame,
  mountain: Mountain,
  compass: Compass,
  star: Star,
  wave: Waves,
  leaf: Leaf,
  crown: Crown,
  car: Car,
  bike: Bike,
  tent: Tent,
  trees: Trees,
  sun: Sun,
  palm: TreePalm,
  anchor: Anchor,
  plane: Plane,
  camera: Camera,
  utensils: Utensils,
  heart: Heart,
  bolt: Zap,
} as const;

// Round guild crest: the guild's color behind its emblem (same as the mobile app).
export default function GuildEmblem({ emblem, color, size = 40 }: { emblem: Emblem; color: string; size?: number }) {
  const Icon = ICONS[emblem] ?? Shield;
  return (
    <div className="flex shrink-0 items-center justify-center rounded-full" style={{ width: size, height: size, backgroundColor: color }}>
      <Icon className="text-white" style={{ width: size * 0.5, height: size * 0.5 }} />
    </div>
  );
}
