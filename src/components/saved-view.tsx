import { Check, Plus, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ContactDraft } from "@/lib/types";

type SavedViewProps = {
  draft: ContactDraft;
  method: "shared" | "downloaded";
  onAgain: () => void;
  onResave: () => void;
};

export function SavedView({ draft, method, onAgain, onResave }: SavedViewProps) {
  return (
    <div className="flex min-h-dvh flex-col px-5 pb-8 pt-[max(1.25rem,env(safe-area-inset-top))]">
      <div className="stagger-in flex flex-1 flex-col items-center justify-center text-center">
        <span className="flex size-16 items-center justify-center rounded-xl bg-bg-subtle shadow-[var(--shadow-border)]">
          <Check className="size-7 text-success" strokeWidth={1.75} />
        </span>
        <h1 className="mt-6 font-display text-2xl tracking-[var(--tracking-display)] text-fg">
          Lista para tu agenda
        </h1>
        <p className="mt-3 max-w-[34ch] text-sm leading-[var(--leading-normal)] text-fg-muted">
          {draft.name}
          {draft.phone ? ` · ${draft.phone}` : ""}
        </p>
        <p className="mt-4 max-w-[36ch] text-sm leading-[var(--leading-normal)] text-fg-subtle">
          {method === "shared"
            ? "Elige Contactos en el menú para confirmar el guardado en Android."
            : "Se descargó un archivo .vcf. Ábrelo y Android te pedirá añadirlo a Contactos."}
        </p>
      </div>
      <div className="flex flex-col gap-2.5">
        <Button size="xl" onClick={onAgain} className="w-full">
          <Plus className="size-4" strokeWidth={1.75} />
          Escanear otra
        </Button>
        <Button size="lg" variant="secondary" onClick={onResave} className="w-full">
          <Share2 className="size-4" strokeWidth={1.75} />
          Enviar de nuevo a Contactos
        </Button>
      </div>
    </div>
  );
}
