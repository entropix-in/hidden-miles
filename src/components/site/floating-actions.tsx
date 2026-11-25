import { MessageCircle, Phone } from "lucide-react";
import { site } from "@/data/site";

export function FloatingActions() {
  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2.5">
      <a
        href={site.phoneHref}
        aria-label={`Call Hidden Miles on ${site.phone}`}
        className="grid h-11 w-11 place-items-center rounded-full border border-stone-200 bg-white text-navy-950 shadow-xl shadow-navy-950/10 transition hover:-translate-y-0.5 hover:text-blue-600"
      >
        <Phone className="h-5 w-5" />
      </a>
      <a
        href={site.whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-2 rounded-full bg-[#1faa59] py-2.5 pl-3.5 pr-4 text-white shadow-xl shadow-emerald-950/20 transition hover:-translate-y-0.5 hover:bg-[#188f4a]"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold transition-all duration-300 group-hover:max-w-[130px]">
          Chat with us
        </span>
      </a>
    </div>
  );
}
