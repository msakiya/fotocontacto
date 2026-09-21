# FotoContacto (Ficha)

**Página pública (para todos):**  
[Abrir Ficha](https://cdn.jsdelivr.net/gh/msakiya/fotocontacto@main/docs/index.html)

Fotografía una tarjeta o un flyer. La página lee la empresa y el teléfono, y guarda un contacto `.vcf` para Android.

GitHub Pages (`https://msakiya.github.io/fotocontacto/`) queda listo en `/docs`, pero GitHub no lo activa mientras la cuenta tenga un bloqueo de facturación. Mientras tanto la página pública es el enlace de arriba.

## Uso

1. Abre el enlace de la página.
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

La página pública está en `/docs`.
