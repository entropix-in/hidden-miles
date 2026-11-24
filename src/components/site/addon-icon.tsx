import { BedDouble, Camera, Car, Mountain, Plane, Sailboat, ShieldCheck, Sparkles, Ticket, Utensils } from "lucide-react";
import type { AddonIcon } from "@/lib/addons";
import { cn } from "@/lib/utils";

const icons = {
  shield: ShieldCheck,
  mountain: Mountain,
  sailboat: Sailboat,
  bed: BedDouble,
  utensils: Utensils,
  car: Car,
  plane: Plane,
  camera: Camera,
  ticket: Ticket,
  sparkles: Sparkles,
};

export function AddonIconView({ icon, className }: { icon: AddonIcon; className?: string }) {
  const Icon = icons[icon] ?? Sparkles;
  return <Icon className={cn("h-5 w-5", className)} aria-hidden />;
}
