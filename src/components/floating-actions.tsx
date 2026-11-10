import { MessageCircle, Phone } from "lucide-react";
import { site } from "@/data/site";

export function FloatingActions() {
  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      <a
        href={site.phoneHref}
        aria-label={`Call Safarnest on ${site.phone}`}
        className="grid h-12 w-12 place-items-center rounded-full border border-stone-200 bg-white text-forest-950 shadow-xl shadow-forest-950/10 transition hover:-translate-y-0.5 hover:text-saffron-600"
      >
        <Phone className="h-5 w-5" />
      </a>
      <a
        href={site.whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-2 rounded-full bg-[#1faa59] py-3 pl-4 pr-4 text-white shadow-xl shadow-emerald-950/20 transition hover:-translate-y-0.5 hover:bg-[#188f4a]"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-bold transition-all duration-300 group-hover:max-w-[130px]">
          Chat with us
        </span>
      </a>
    </div>
  );
}
