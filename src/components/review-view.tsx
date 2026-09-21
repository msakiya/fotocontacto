import type { ReactNode } from "react";
import { ArrowLeft, Building2, Phone, StickyNote, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ContactDraft } from "@/lib/types";

type ReviewViewProps = {
  photo: string | null;
  draft: ContactDraft;
  saving: boolean;
  onChange: (patch: Partial<ContactDraft>) => void;
  onBack: () => void;
  onSave: () => void;
};

export function ReviewView({
  photo,
  draft,
  saving,
  onChange,
  onBack,
  onSave,
}: ReviewViewProps) {
  const canSave = Boolean(draft.name.trim() && draft.phone.trim());

  return (
    <div className="flex min-h-dvh flex-col px-5 pb-8 pt-[max(1.25rem,env(safe-area-inset-top))]">
      <header className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          aria-label="Volver"
          className="shrink-0"
        >
          <ArrowLeft className="size-5" strokeWidth={1.75} />
        </Button>
        <div>
          <p className="text-sm font-medium text-fg">Revisar ficha</p>
          <p className="text-xs text-fg-subtle">Corrige antes de guardar</p>
        </div>
      </header>

      {photo ? (
        <img
          src={photo}
          alt="Foto escaneada"
          className="mt-5 h-36 w-full rounded-xl object-cover outline outline-1 -outline-offset-1 outline-fg/10"
        />
      ) : null}

      <form
        className="mt-6 flex flex-1 flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (canSave) onSave();
        }}
      >
        <Field
          id="name"
          label="Nombre del contacto"
          icon={<UserRound className="size-3.5" />}
        >
          <Input
            id="name"
            value={draft.name}
            autoComplete="organization"
            placeholder="Empresa"
            onChange={(event) => onChange({ name: event.target.value })}
          />
        </Field>

        <Field
          id="phone"
          label="Teléfono"
          icon={<Phone className="size-3.5" />}
        >
          <Input
            id="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={draft.phone}
            placeholder="+51 1 000 0000"
            onChange={(event) => onChange({ phone: event.target.value })}
          />
        </Field>

        <Field
          id="company"
          label="Empresa"
          icon={<Building2 className="size-3.5" />}
        >
          <Input
            id="company"
            value={draft.company}
            autoComplete="organization"
            placeholder="Opcional si ya está en el nombre"
            onChange={(event) => onChange({ company: event.target.value })}
          />
        </Field>

        <Field
          id="notes"
          label="Notas"
          icon={<StickyNote className="size-3.5" />}
        >
          <Textarea
            id="notes"
            value={draft.notes}
            placeholder="Cargo, correo, web, dirección…"
            onChange={(event) => onChange({ notes: event.target.value })}
          />
        </Field>

        <p className="text-xs leading-[var(--leading-normal)] text-fg-subtle">
          En Android, Ficha abre un archivo .vcf para que Contactos lo importe.
          Lo extra (correo, web, cargo) va en las notas.
        </p>

        <div className="mt-auto pt-4">
          <Button
            type="submit"
            size="xl"
            className="w-full"
            disabled={!canSave || saving}
          >
            {saving ? "Preparando…" : "Guardar en contactos"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function Field({
  id,
  label,
  icon,
  children,
}: {
  id: string;
  label: string;
  icon: ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className="flex items-center gap-1.5">
        <span className="text-fg-subtle">{icon}</span>
        {label}
      </Label>
      {children}
    </div>
  );
}
