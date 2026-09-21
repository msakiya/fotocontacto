export type ExtractedCard = {
  company: string;
  personName: string;
  jobTitle: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  other: string;
};

export type ContactDraft = {
  name: string;
  company: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  notes: string;
};

export type SavedContact = ContactDraft & {
  id: string;
  savedAt: number;
  thumbnail: string;
};

export function toDraft(card: ExtractedCard): ContactDraft {
  const name = card.company.trim() || card.personName.trim() || "Contacto";
  const notes = buildNotes(card);
  return {
    name,
    company: card.company.trim(),
    phone: card.phone.trim(),
    email: card.email.trim(),
    website: card.website.trim(),
    address: card.address.trim(),
    notes,
  };
}

export function buildNotes(card: ExtractedCard): string {
  const lines: string[] = [];
  if (card.personName.trim()) lines.push(`Contacto: ${card.personName.trim()}`);
  if (card.jobTitle.trim()) lines.push(`Cargo: ${card.jobTitle.trim()}`);
  if (card.email.trim()) lines.push(`Email: ${card.email.trim()}`);
  if (card.website.trim()) lines.push(`Web: ${card.website.trim()}`);
  if (card.address.trim()) lines.push(`Dirección: ${card.address.trim()}`);
  if (card.other.trim()) lines.push(card.other.trim());
  return lines.join("\n");
}

export function emptyDraft(): ContactDraft {
  return {
    name: "",
    company: "",
    phone: "",
    email: "",
    website: "",
    address: "",
    notes: "",
  };
}
