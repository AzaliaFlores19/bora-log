import { Smile, Frown, Brain, Compass, Heart, Zap, Coffee, Lightbulb } from "lucide-react";
import type { Mood } from "@/types";

export const MOOD_ICONS: Record<Mood, typeof Smile> = {
  happy: Smile,
  sad: Frown,
  nerdy: Brain,
  adventurous: Compass,
  romantic: Heart,
  thrilled: Zap,
  cozy: Coffee,
  thoughtful: Lightbulb,
};
