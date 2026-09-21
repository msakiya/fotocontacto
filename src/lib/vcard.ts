import type { ContactDraft } from "./types";

function escapeValue(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function foldLine(line: string): string {
  if (line.length <= 75) return line;
  const parts: string[] = [];
  let remaining = line;
  parts.push(remaining.slice(0, 75));
  remaining = remaining.slice(75);
  while (remaining.length) {
    parts.push(" " + remaining.slice(0, 74));
    remaining = remaining.slice(74);
  }
  return parts.join("\r\n");
}

function line(key: string, value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  return foldLine(`${key}:${escapeValue(trimmed)}`);
}

export function toVCard(draft: ContactDraft): string {
  const rows = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    line("FN", draft.name || draft.company || "Contacto"),
    line("ORG", draft.company),
    line("TEL;TYPE=WORK,VOICE", draft.phone),
    line("EMAIL;TYPE=INTERNET", draft.email),
    line("URL", draft.website),
    line("ADR;TYPE=WORK", draft.address ? `;;${draft.address}` : ""),
    line("NOTE", draft.notes),
    "END:VCARD",
  ].filter((row): row is string => Boolean(row));

  return rows.join("\r\n") + "\r\n";
}

export function vcardFilename(draft: ContactDraft): string {
  const base = (draft.name || draft.company || "contacto")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase()
    .slice(0, 40);
  return `${base || "contacto"}.vcf`;
}

export async function saveToDeviceContacts(
  draft: ContactDraft,
): Promise<"shared" | "downloaded" | "cancelled"> {
  const vcard = toVCard(draft);
  const filename = vcardFilename(draft);
  const file = new File([vcard], filename, { type: "text/vcard;charset=utf-8" });

  const nav = navigator as Navigator & {
    canShare?: (data: ShareData) => boolean;
  };
  if (typeof nav.share === "function" && nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({
        files: [file],
        title: draft.name || "Contacto",
        text: "Guardar en contactos",
      });
      return "shared";
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return "cancelled";
      }
    }
  }

  const blob = new Blob([vcard], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2500);
  return "downloaded";
}
