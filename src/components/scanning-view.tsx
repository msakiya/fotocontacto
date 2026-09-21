import { Viewfinder } from "@/components/viewfinder";

export function ScanningView({ photo }: { photo: string | null }) {
  return (
    <div className="flex min-h-dvh flex-col px-5 pb-10 pt-[max(1.25rem,env(safe-area-inset-top))]">
      <p className="font-display text-xl tracking-[var(--tracking-tight)] text-fg">
        Ficha
      </p>
      <Viewfinder className="relative mt-8 aspect-[4/3] flex-1 min-h-72">
        {photo ? (
          <img
            src={photo}
            alt="Tarjeta en lectura"
            className="absolute inset-0 size-full object-cover outline outline-1 -outline-offset-1 outline-fg/10"
          />
        ) : (
          <div className="absolute inset-0 bg-bg-subtle" />
        )}
        <div className="absolute inset-0 bg-bg/35" />
        <div className="scan-line pointer-events-none absolute inset-x-0 top-0 h-px bg-accent shadow-[0_0_24px_6px_color-mix(in_oklab,var(--color-accent)_55%,transparent)]" />
      </Viewfinder>
      <div className="mt-8 text-center">
        <p className="pulse-soft font-display text-lg text-fg">Leyendo la pieza</p>
        <p className="mt-2 text-sm text-fg-muted">
          Empresa, teléfono y el resto a notas
        </p>
      </div>
    </div>
  );
}
