import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { ExtractedCard } from "./types";

const ScanInput = z.object({
  imageDataUrl: z
    .string()
    .min(80)
    .max(2_500_000)
    .refine((value) => value.startsWith("data:image/"), "Imagen inválida"),
});

export type ScanResult =
  | { ok: true; card: ExtractedCard }
  | { ok: false; error: string };

const SYSTEM_PROMPT = `Eres un extractor preciso de tarjetas de presentación y flyers.
Devuelve solo JSON con estas claves:
isCard (boolean), company, personName, jobTitle, phone, email, website, address, other.
Reglas:
- isCard es true solo si la foto es una tarjeta, flyer, afiche o pieza impresa con datos de contacto.
- company es el nombre de la empresa u organización (el más prominente).
- phone es el teléfono principal, con código de país si se puede inferir (Perú = +51).
- other reúne el resto de información útil que no encaje en los otros campos.
- Si un dato no está, usa cadena vacía.
- No inventes datos que no se vean en la imagen.
- Transcribe el texto tal cual, corrigiendo solo errores obvios de OCR.`;

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "isCard",
    "company",
    "personName",
    "jobTitle",
    "phone",
    "email",
    "website",
    "address",
    "other",
  ],
  properties: {
    isCard: { type: "boolean" },
    company: { type: "string" },
    personName: { type: "string" },
    jobTitle: { type: "string" },
    phone: { type: "string" },
    email: { type: "string" },
    website: { type: "string" },
    address: { type: "string" },
    other: { type: "string" },
  },
} as const;

type ModelCard = ExtractedCard & { isCard: boolean };

function emptyCard(): ExtractedCard {
  return {
    company: "",
    personName: "",
    jobTitle: "",
    phone: "",
    email: "",
    website: "",
    address: "",
    other: "",
  };
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function parseCard(raw: string): ModelCard {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "");
  const parsed = JSON.parse(cleaned) as Record<string, unknown>;
  return {
    isCard: Boolean(parsed.isCard),
    company: asString(parsed.company),
    personName: asString(parsed.personName),
    jobTitle: asString(parsed.jobTitle),
    phone: asString(parsed.phone),
    email: asString(parsed.email),
    website: asString(parsed.website),
    address: asString(parsed.address),
    other: asString(parsed.other),
  };
}

async function complete(apiKey: string, imageDataUrl: string, structured: boolean) {
  const body: Record<string, unknown> = {
    model: "grok-4.5",
    max_tokens: 700,
    temperature: 0,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: { url: imageDataUrl, detail: "high" },
          },
          {
            type: "text",
            text: "Extrae los datos de contacto de esta tarjeta o flyer.",
          },
        ],
      },
    ],
  };

  if (structured) {
    body.response_format = {
      type: "json_schema",
      json_schema: {
        name: "business_card",
        strict: true,
        schema: SCHEMA,
      },
    };
  } else {
    body.response_format = { type: "json_object" };
  }

  const response = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  return response;
}

export const scanCard = createServerFn({ method: "POST" })
  .validator((input) => ScanInput.parse(input))
  .handler(async ({ data }): Promise<ScanResult> => {
    const apiKey = process.env.XAI_API_KEY?.trim();
    if (!apiKey) {
      return {
        ok: false,
        error: "El lector inteligente no está disponible ahora. Inténtalo más tarde.",
      };
    }

    let response = await complete(apiKey, data.imageDataUrl, true);
    if (!response.ok && response.status === 400) {
      response = await complete(apiKey, data.imageDataUrl, false);
    }

    if (!response.ok) {
      return {
        ok: false,
        error: "No pude leer la foto. Prueba con más luz y el texto bien enfocado.",
      };
    }

    const payload = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = payload.choices?.[0]?.message?.content ?? "";

    try {
      const card = parseCard(content);
      if (!card.isCard) {
        return {
          ok: false,
          error: "No parece una tarjeta o flyer. Enfoca el texto e inténtalo de nuevo.",
        };
      }
      const { isCard: _ignored, ...fields } = card;
      void _ignored;
      if (!fields.company && !fields.personName && !fields.phone) {
        return {
          ok: false,
          error: "Encontré poco texto útil. Acércate a la tarjeta y vuelve a fotografiar.",
        };
      }
      return { ok: true, card: { ...emptyCard(), ...fields } };
    } catch {
      return {
        ok: false,
        error: "No pude interpretar los datos. Prueba otra foto más nítida.",
      };
    }
  });
