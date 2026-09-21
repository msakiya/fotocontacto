import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { HomeView } from "@/components/home-view";
import { ReviewView } from "@/components/review-view";
import { SavedView } from "@/components/saved-view";
import { ScanningView } from "@/components/scanning-view";
import { compressImage, makeThumbnail } from "@/lib/image";
import { renderSampleCard } from "@/lib/sample-card";
import { scanCard } from "@/lib/scan";
import { useContacts } from "@/lib/store";
import { emptyDraft, toDraft, type ContactDraft, type SavedContact } from "@/lib/types";
import { saveToDeviceContacts } from "@/lib/vcard";

type Step = "home" | "scanning" | "review" | "saved";

export function ScanApp() {
  const scanFn = useServerFn(scanCard);
  const contacts = useContacts((state) => state.contacts);
  const addContact = useContacts((state) => state.add);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("home");
  const [photo, setPhoto] = useState<string | null>(null);
  const [draft, setDraft] = useState<ContactDraft>(emptyDraft());
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMethod, setSaveMethod] = useState<"shared" | "downloaded">("downloaded");
  const [editingId, setEditingId] = useState<string | null>(null);

  async function handleFile(file: File | Blob) {
    if (busy) return;
    setBusy(true);
    setError(null);
    setStep("scanning");
    try {
      const dataUrl = await compressImage(file);
      setPhoto(dataUrl);
      const result = await scanFn({ data: { imageDataUrl: dataUrl } });
      if (!result.ok) {
        setError(result.error);
        setStep("home");
        toast.error(result.error);
        return;
      }
      setEditingId(null);
      setDraft(toDraft(result.card));
      setStep("review");
    } catch (caught) {
      const message =
        caught instanceof Error
          ? caught.message
          : "No se pudo leer la foto. Inténtalo de nuevo.";
      setError(message);
      setStep("home");
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  function onInputChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) void handleFile(file);
  }

  async function onSample() {
    try {
      const blob = await renderSampleCard();
      await handleFile(blob);
    } catch {
      toast.error("No se pudo crear el ejemplo.");
    }
  }

  function openSaved(contact: SavedContact) {
    setEditingId(contact.id);
    setDraft({
      name: contact.name,
      company: contact.company,
      phone: contact.phone,
      email: contact.email,
      website: contact.website,
      address: contact.address,
      notes: contact.notes,
    });
    setPhoto(contact.thumbnail || null);
    setStep("review");
  }

  async function persistLocal(current: ContactDraft) {
    const thumbnail = photo ? await makeThumbnail(photo) : "";
    const record: SavedContact = {
      ...current,
      id: editingId ?? crypto.randomUUID(),
      savedAt: Date.now(),
      thumbnail,
    };
    addContact(record);
    setEditingId(record.id);
  }

  async function onSave() {
    if (saving) return;
    if (!draft.name.trim() || !draft.phone.trim()) {
      toast.error("Necesitas un nombre y un teléfono.");
      return;
    }
    setSaving(true);
    try {
      await persistLocal(draft);
      const method = await saveToDeviceContacts(draft);
      if (method === "cancelled") {
        toast.message("Ficha guardada aquí. Puedes enviarla a Contactos cuando quieras.");
        setSaveMethod("downloaded");
        setStep("saved");
        return;
      }
      setSaveMethod(method);
      setStep("saved");
      toast.success(
        method === "shared"
          ? "Elige Contactos para confirmar"
          : "Archivo listo para abrir en Contactos",
      );
    } catch {
      toast.error("No se pudo preparar el contacto. Revisa los datos e inténtalo otra vez.");
    } finally {
      setSaving(false);
    }
  }

  async function onResave() {
    try {
      const method = await saveToDeviceContacts(draft);
      if (method !== "cancelled") {
        setSaveMethod(method);
        toast.success("Listo para Contactos");
      }
    } catch {
      toast.error("No se pudo compartir el contacto.");
    }
  }

  function resetHome() {
    setStep("home");
    setError(null);
    setPhoto(null);
    setDraft(emptyDraft());
    setEditingId(null);
  }

  return (
    <div className="relative flex min-h-dvh justify-center bg-bg">
      <div className="w-full max-w-md min-h-dvh bg-bg md:bg-bg-elevated md:shadow-[var(--shadow-phone)]">
        {step === "home" ? (
          <HomeView
            contacts={hydrated ? contacts : []}
            error={error}
            busy={busy}
            onCamera={() => cameraRef.current?.click()}
            onGallery={() => galleryRef.current?.click()}
            onSample={() => void onSample()}
            onOpen={openSaved}
          />
        ) : null}
        {step === "scanning" ? <ScanningView photo={photo} /> : null}
        {step === "review" ? (
          <ReviewView
            photo={photo}
            draft={draft}
            saving={saving}
            onChange={(patch) => setDraft((current) => ({ ...current, ...patch }))}
            onBack={resetHome}
            onSave={() => void onSave()}
          />
        ) : null}
        {step === "saved" ? (
          <SavedView
            draft={draft}
            method={saveMethod}
            onAgain={resetHome}
            onResave={() => void onResave()}
          />
        ) : null}
      </div>

        {hydrated ? (
          <>
            <input
              ref={cameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              tabIndex={-1}
              aria-hidden="true"
              className="pointer-events-none absolute size-px overflow-hidden opacity-0"
              onChange={onInputChange}
            />
            <input
              ref={galleryRef}
              type="file"
              accept="image/*"
              tabIndex={-1}
              aria-hidden="true"
              className="pointer-events-none absolute size-px overflow-hidden opacity-0"
              onChange={onInputChange}
            />
          </>
        ) : null}
    </div>
  );
}
