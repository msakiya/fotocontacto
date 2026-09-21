const STORAGE_KEY = "ficha-contacts";

const views = {
  home: document.getElementById("view-home"),
  scanning: document.getElementById("view-scanning"),
  review: document.getElementById("view-review"),
  saved: document.getElementById("view-saved"),
};

const els = {
  error: document.getElementById("error"),
  list: document.getElementById("list"),
  empty: document.getElementById("empty"),
  count: document.getElementById("count"),
  camera: document.getElementById("camera"),
  gallery: document.getElementById("gallery"),
  scanPhoto: document.getElementById("scan-photo"),
  reviewPhoto: document.getElementById("review-photo"),
  form: document.getElementById("form"),
  name: document.getElementById("f-name"),
  phone: document.getElementById("f-phone"),
  company: document.getElementById("f-company"),
  notes: document.getElementById("f-notes"),
  savedSummary: document.getElementById("saved-summary"),
  savedHow: document.getElementById("saved-how"),
};

let photo = "";
let lastMethod = "downloaded";
let busy = false;

function show(name) {
  Object.values(views).forEach((view) => view.classList.remove("active"));
  views[name].classList.add("active");
  window.scrollTo(0, 0);
}

function loadContacts() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveContacts(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function renderList() {
  const contacts = loadContacts();
  els.count.textContent = String(contacts.length);
  if (!contacts.length) {
    els.empty.hidden = false;
    els.list.hidden = true;
    els.list.innerHTML = "";
    return;
  }
  els.empty.hidden = true;
  els.list.hidden = false;
  els.list.innerHTML = contacts
    .map(
      (c) => `
      <li>
        <button class="row" type="button" data-id="${c.id}">
          ${
            c.thumbnail
              ? `<img class="thumb" src="${c.thumbnail}" alt="" />`
              : `<span class="thumb"></span>`
          }
          <span>
            <strong>${escapeHtml(c.name)}</strong>
            <span>${escapeHtml(c.phone || "Sin teléfono")}</span>
          </span>
        </button>
      </li>`,
    )
    .join("");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&")
    .replaceAll("<", "<")
    .replaceAll(">", ">")
    .replaceAll('"', """);
}

function setError(message) {
  if (!message) {
    els.error.classList.add("hidden");
    els.error.textContent = "";
    return;
  }
  els.error.textContent = message;
  els.error.classList.remove("hidden");
}

async function compress(blob) {
  const bitmap = await createImageBitmap(blob);
  const max = 1400;
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.82);
}

function extractPhone(text) {
  const matches = text.match(
    /(?:\+\s?51[\s.-]*)?(?:\(?\d{1,4}\)?[\s.-]*){2,5}\d{2,}/g,
  );
  if (!matches) return "";
  const scored = matches
    .map((raw) => raw.trim())
    .filter((raw) => raw.replace(/\D/g, "").length >= 7)
    .sort((a, b) => b.replace(/\D/g, "").length - a.replace(/\D/g, "").length);
  return scored[0] || "";
}

function parseCard(text) {
  const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || "";
  const website =
    text.match(/(?:https?:\/\/)?(?:www\.)[a-z0-9.-]+\.[a-z]{2,}(?:\/\S*)?/i)?.[0] ||
    text.match(/\b[a-z0-9-]+\.(?:pe|com|net|org|io)\b/i)?.[0] ||
    "";
  const phone = extractPhone(text);
  const lines = text
    .split(/\n+/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter((line) => line.length > 1);

  const isNoise = (line) => {
    const lower = line.toLowerCase();
    if (email && lower.includes(email.toLowerCase())) return true;
    if (website && lower.includes(website.toLowerCase())) return true;
    if (/\d{5,}/.test(line.replace(/\s/g, ""))) return true;
    if (/@/.test(line) || /^www\./i.test(line)) return true;
    return false;
  };

  const useful = lines.filter((line) => !isNoise(line));
  const company = useful[0] || "";
  const person = useful[1] || "";
  const title = useful[2] || "";
  const address = useful.find((line) => /av\.|calle|jr\.|lima|miraflores|n°|mz/i.test(line)) || "";

  const notes = [];
  if (person) notes.push(`Contacto: ${person}`);
  if (title && title !== person) notes.push(`Cargo: ${title}`);
  if (email) notes.push(`Email: ${email}`);
  if (website) notes.push(`Web: ${website}`);
  if (address) notes.push(`Dirección: ${address}`);
  const extra = useful.slice(3).filter((line) => line !== address);
  if (extra.length) notes.push(extra.join(" · "));

  return {
    name: company || person || "Contacto",
    company,
    phone,
    email,
    website,
    notes: notes.join("\n"),
  };
}

async function readImage(dataUrl) {
  if (typeof Tesseract === "undefined") {
    throw new Error("No se pudo cargar el lector. Recarga la página.");
  }
  const worker = await Tesseract.createWorker("spa+eng");
  try {
    const { data } = await worker.recognize(dataUrl);
    const text = (data && data.text ? data.text : "").trim();
    if (!text) {
      throw new Error("No encontré texto. Acércate a la tarjeta y vuelve a fotografiar.");
    }
    const draft = parseCard(text);
    if (!draft.company && !draft.phone) {
      throw new Error("Encontré poco texto útil. Prueba con más luz y el texto bien enfocado.");
    }
    return draft;
  } finally {
    await worker.terminate();
  }
}

async function handleBlob(blob) {
  if (busy) return;
  busy = true;
  setError("");
  show("scanning");
  try {
    photo = await compress(blob);
    els.scanPhoto.src = photo;
    const draft = await readImage(photo);
    fillForm(draft);
    show("review");
  } catch (error) {
    show("home");
    setError(error instanceof Error ? error.message : "No se pudo leer la foto.");
  } finally {
    busy = false;
  }
}

function fillForm(draft) {
  els.name.value = draft.name || "";
  els.phone.value = draft.phone || "";
  els.company.value = draft.company || "";
  els.notes.value = draft.notes || "";
  if (photo) {
    els.reviewPhoto.src = photo;
    els.reviewPhoto.hidden = false;
  } else {
    els.reviewPhoto.hidden = true;
  }
}

function currentDraft() {
  return {
    name: els.name.value.trim(),
    company: els.company.value.trim(),
    phone: els.phone.value.trim(),
    notes: els.notes.value.trim(),
  };
}

function toVCard(draft) {
  const escape = (value) =>
    value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
  const line = (key, value) => (value ? `${key}:${escape(value)}` : null);
  return [
    "BEGIN:VCARD",
    "VERSION:3.0",
    line("FN", draft.name || draft.company || "Contacto"),
    line("ORG", draft.company),
    line("TEL;TYPE=WORK,VOICE", draft.phone),
    line("NOTE", draft.notes),
    "END:VCARD",
  ]
    .filter(Boolean)
    .join("\r\n") + "\r\n";
}

async function saveToDevice(draft) {
  const filename = `${(draft.name || "contacto")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase()
    .slice(0, 40) || "contacto"}.vcf`;
  const vcard = toVCard(draft);
  const file = new File([vcard], filename, { type: "text/vcard;charset=utf-8" });
  if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: draft.name, text: "Guardar en contactos" });
      return "shared";
    } catch (error) {
      if (error && error.name === "AbortError") return "cancelled";
    }
  }
  const url = URL.createObjectURL(new Blob([vcard], { type: "text/vcard;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2500);
  return "downloaded";
}

function persist(draft) {
  const contacts = loadContacts().filter((item) => item.id !== draft.id);
  contacts.unshift({
    ...draft,
    id: draft.id || crypto.randomUUID(),
    savedAt: Date.now(),
    thumbnail: photo,
  });
  saveContacts(contacts);
  renderList();
}

function renderSampleCard() {
  const width = 1400;
  const height = 820;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#1a1714";
  ctx.fillRect(0, 0, width, height);
  const x = 90;
  const y = 70;
  ctx.fillStyle = "#f4efe4";
  ctx.fillRect(x, y, 1220, 680);
  ctx.fillStyle = "#2b241c";
  ctx.fillRect(x, y, 18, 680);
  ctx.fillStyle = "#1d1914";
  ctx.font = "600 64px Times New Roman, serif";
  ctx.fillText("CAFÉ ANDINO", x + 72, y + 140);
  ctx.fillStyle = "#6a5f52";
  ctx.font = "500 28px Segoe UI, sans-serif";
  ctx.fillText("Cafetería de especialidad  ·  Lima", x + 74, y + 188);
  ctx.fillStyle = "#1d1914";
  ctx.font = "600 36px Segoe UI, sans-serif";
  ctx.fillText("Mariana Quispe", x + 74, y + 300);
  ctx.fillStyle = "#6a5f52";
  ctx.font = "500 26px Segoe UI, sans-serif";
  ctx.fillText("Gerente Comercial", x + 74, y + 342);
  ctx.fillStyle = "#2a241c";
  ctx.font = "500 28px Segoe UI, sans-serif";
  ["+51 1 445 8821", "m.quispe@cafeandino.pe", "www.cafeandino.pe", "Av. La Mar 1280, Miraflores, Lima"].forEach(
    (line, i) => ctx.fillText(line, x + 74, y + 430 + i * 48),
  );
  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.92));
}

document.getElementById("btn-camera").addEventListener("click", () => els.camera.click());
document.getElementById("btn-gallery").addEventListener("click", () => els.gallery.click());
document.getElementById("btn-sample").addEventListener("click", async () => {
  const blob = await renderSampleCard();
  handleBlob(blob);
});
document.getElementById("btn-back").addEventListener("click", () => {
  show("home");
  setError("");
});
document.getElementById("btn-again").addEventListener("click", () => {
  photo = "";
  show("home");
});
document.getElementById("btn-resave").addEventListener("click", () => saveToDevice(currentDraft()));

els.camera.addEventListener("change", (event) => {
  const file = event.target.files && event.target.files[0];
  event.target.value = "";
  if (file) handleBlob(file);
});
els.gallery.addEventListener("change", (event) => {
  const file = event.target.files && event.target.files[0];
  event.target.value = "";
  if (file) handleBlob(file);
});

els.list.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-id]");
  if (!button) return;
  const contact = loadContacts().find((item) => item.id === button.dataset.id);
  if (!contact) return;
  photo = contact.thumbnail || "";
  fillForm(contact);
  show("review");
});

els.form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const draft = currentDraft();
  if (!draft.name || !draft.phone) return;
  persist(draft);
  lastMethod = await saveToDevice(draft);
  els.savedSummary.textContent = `${draft.name}${draft.phone ? " · " + draft.phone : ""}`;
  els.savedHow.textContent =
    lastMethod === "shared"
      ? "Elige Contactos en el menú para confirmar el guardado en Android."
      : "Se descargó un archivo .vcf. Ábrelo y Android te pedirá añadirlo a Contactos.";
  show("saved");
});

renderList();
