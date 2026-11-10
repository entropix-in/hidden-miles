import {
  Crown,
  Flower2,
  Heart,
  Mountain,
  Sparkles,
  Users,
} from "lucide-react";
import type { Experience } from "@/data/experiences";
import { cn } from "@/lib/utils";

const icons = {
  heart: Heart,
  sparkles: Sparkles,
  mountain: Mountain,
  users: Users,
  crown: Crown,
  flower: Flower2,
};

export function ExperienceIcon({
  icon,
  className,
}: {
  icon: Experience["icon"];
  className?: string;
}) {
  const Icon = icons[icon] ?? Sparkles;
  return <Icon className={cn("h-5 w-5", className)} />;
}
