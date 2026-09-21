# FotoContacto (Ficha)

**Página pública (para todos):** [https://msakiya.github.io/fotocontacto/](https://msakiya.github.io/fotocontacto/)

Fotografía una tarjeta o un flyer. La página lee la empresa y el teléfono, y guarda un contacto `.vcf` para Android.

Este repositorio también tiene el código. GitHub Pages es la app que se abre en el navegador.

## Uso

1. Abre [msakiya.github.io/fotocontacto](https://msakiya.github.io/fotocontacto/).
2. **Tomar foto** o elegir de la galería.
3. Revisa empresa, teléfono y notas.
4. **Guardar en contactos** — Android abre el archivo `.vcf`.

En el teléfono: Chrome → menú → **Añadir a la pantalla de inicio**.

## Desarrollo

La app completa (con lector Grok) corre en este repo:

```bash
npm install
npm run dev
```

La página pública en `/docs` usa lectura de texto en el navegador, para que funcione en GitHub Pages sin servidor.

## Stack

- React 19 + TanStack Start (app Grok)
- Página estática en GitHub Pages (`/docs`)
- vCard 3.0 para Contactos de Android
