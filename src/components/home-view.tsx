import {
  Camera,
  ImageIcon,
  Phone,
  ScanLine,
  IdCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Viewfinder } from "@/components/viewfinder";
import type { SavedContact } from "@/lib/types";
import { cn } from "@/lib/utils";

type HomeViewProps = {
  contacts: SavedContact[];
  error: string | null;
  busy: boolean;
  onCamera: () => void;
  onGallery: () => void;
  onSample: () => void;
  onOpen: (contact: SavedContact) => void;
};

export function HomeView({
  contacts,
  error,
  busy,
  onCamera,
  onGallery,
  onSample,
  onOpen,
}: HomeViewProps) {
  return (
    <div className="flex min-h-dvh flex-col px-5 pb-8 pt-[max(1.25rem,env(safe-area-inset-top))]">
      <header className="stagger-in flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-sm bg-bg-subtle shadow-[var(--shadow-border)]">
            <ScanLine className="size-4 text-accent" strokeWidth={1.75} />
          </span>
          <p className="font-display text-xl tracking-[var(--tracking-tight)] text-fg">
            Ficha
          </p>
        </div>
        <p className="text-xs text-fg-subtle">Android · contactos</p>
      </header>

      <section className="stagger-in mt-8">
        <h1 className="font-display text-2xl leading-[var(--leading-tight)] tracking-[var(--tracking-display)] text-fg">
          Una foto.
          <br />
          Un contacto.
        </h1>
        <p className="mt-3 max-w-[34ch] text-sm leading-[var(--leading-normal)] text-fg-muted">
          Fotografía una tarjeta o un flyer. Ficha lee la empresa y el teléfono
          y los deja listos para tu agenda de Android.
        </p>
      </section>

      <Viewfinder className="mt-8 aspect-[16/10] min-h-44">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
          <Camera className="size-7 text-accent" strokeWidth={1.5} />
          <p className="text-sm text-fg">Apunta al texto impreso</p>
          <p className="text-xs text-fg-subtle">
            Mejor luz de lado, sin sombras fuertes
          </p>
        </div>
      </Viewfinder>

      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-md bg-bg-subtle px-3.5 py-3 text-sm text-danger shadow-[var(--shadow-border)]"
        >
          {error}
        </p>
      ) : null}

      <div className="mt-5 flex flex-col gap-2.5">
        <Button size="xl" onClick={onCamera} disabled={busy} className="w-full">
          <Camera className="size-5" strokeWidth={1.75} />
          Tomar foto
        </Button>
        <Button
          size="lg"
          variant="secondary"
          onClick={onGallery}
          disabled={busy}
          className="w-full"
        >
          <ImageIcon className="size-4" strokeWidth={1.75} />
          Elegir de la galería
        </Button>
        <Button
          size="lg"
          variant="ghost"
          onClick={onSample}
          disabled={busy}
          className="w-full text-fg-muted"
        >
          <IdCard className="size-4" strokeWidth={1.75} />
          Probar con un ejemplo
        </Button>
      </div>

      <section className="mt-10 flex-1">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-medium text-fg">Guardados</h2>
          <p className="text-xs tabular-nums text-fg-subtle">{contacts.length}</p>
        </div>
        {contacts.length === 0 ? (
          <div className="rounded-xl bg-bg-subtle px-4 py-8 text-center shadow-[var(--shadow-border)]">
            <p className="text-sm text-fg-muted">Todavía no hay fichas</p>
            <p className="mt-1 text-xs text-fg-subtle">
              Las que guardes en contactos quedan también aquí
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {contacts.map((contact) => (
              <li key={contact.id}>
                <button
                  type="button"
                  onClick={() => onOpen(contact)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl bg-bg-subtle p-2.5 pr-4 text-left shadow-[var(--shadow-border)] transition-[box-shadow,transform] duration-[var(--motion-quick)] ease-[var(--ease-out)] hover:shadow-[var(--shadow-border-hover)] active:scale-[0.96]",
                  )}
                >
                  {contact.thumbnail ? (
                    <img
                      src={contact.thumbnail}
                      alt=""
                      className="size-12 rounded-md object-cover outline outline-1 -outline-offset-1 outline-fg/10"
                    />
                  ) : (
                    <span className="flex size-12 items-center justify-center rounded-md bg-bg">
                      <Phone className="size-4 text-fg-muted" />
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-fg">
                      {contact.name}
                    </span>
                    <span className="block truncate text-xs text-fg-muted">
                      {contact.phone || "Sin teléfono"}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="mt-8 text-center text-xs leading-[var(--leading-normal)] text-fg-subtle">
        En el teléfono, instálala en la pantalla de inicio y usa la cámara. El
        archivo .vcf se abre con la app Contactos de Android.
      </p>
    </div>
  );
}
