# FotoContacto (Ficha)

Fotografía una tarjeta de presentación o un flyer. La app lee el **nombre de la empresa** y el **teléfono**, y deja el resto (cargo, correo, web, dirección) en las **notas** del contacto.

En Android, **Guardar en contactos** genera un archivo `.vcf` que la app Contactos puede importar.

## Uso

1. **Tomar foto** o elegir una imagen de la galería.
2. Revisa empresa, teléfono y notas.
3. Guarda: Android abre Contactos con el archivo `.vcf`.

También puedes **instalarla en la pantalla de inicio** desde el navegador del teléfono.

## Desarrollo

```bash
npm install
```

Crea una variable de entorno `XAI_API_KEY` (clave de [xAI](https://x.ai)) para que el lector de tarjetas funcione. Sin ella, la cámara y el formulario siguen disponibles, pero no se extrae el texto.

```bash
npm run dev
```

Abre la app en el puerto que muestre Vite (por defecto `8080`).

```bash
npm run build
npm run typecheck
```

## Stack

- React 19 + TanStack Start
- Tailwind v4
- Grok (visión) para leer la tarjeta
- vCard 3.0 para Contactos de Android

## Privacidad

Las fotos se envían al API de xAI solo cuando tú pulsas escanear. Los contactos guardados en la app quedan en el navegador (`localStorage`); el `.vcf` es el que pasa a la agenda del teléfono.
