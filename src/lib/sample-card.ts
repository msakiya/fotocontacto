export function renderSampleCard(): Promise<Blob> {
  const width = 1400;
  const height = 820;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return Promise.reject(new Error("No se pudo crear el ejemplo."));

  ctx.fillStyle = "#1a1714";
  ctx.fillRect(0, 0, width, height);

  const x = 90;
  const y = 70;
  const cardW = 1220;
  const cardH = 680;
  roundRect(ctx, x + 10, y + 14, cardW, cardH, 18);
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.fill();

  roundRect(ctx, x, y, cardW, cardH, 18);
  ctx.fillStyle = "#f4efe4";
  ctx.fill();

  ctx.fillStyle = "#2b241c";
  ctx.fillRect(x, y, 18, cardH);

  ctx.fillStyle = "#1d1914";
  ctx.font = "600 64px 'Times New Roman', serif";
  ctx.fillText("CAFÉ ANDINO", x + 72, y + 140);

  ctx.fillStyle = "#6a5f52";
  ctx.font = "500 28px 'Segoe UI', sans-serif";
  ctx.fillText("Cafetería de especialidad  ·  Lima", x + 74, y + 188);

  ctx.beginPath();
  ctx.moveTo(x + 74, y + 230);
  ctx.lineTo(x + 420, y + 230);
  ctx.strokeStyle = "#c4b8a6";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = "#1d1914";
  ctx.font = "600 36px 'Segoe UI', sans-serif";
  ctx.fillText("Mariana Quispe", x + 74, y + 300);
  ctx.fillStyle = "#6a5f52";
  ctx.font = "500 26px 'Segoe UI', sans-serif";
  ctx.fillText("Gerente Comercial", x + 74, y + 342);

  const details = [
    "+51 1 445 8821",
    "m.quispe@cafeandino.pe",
    "www.cafeandino.pe",
    "Av. La Mar 1280, Miraflores, Lima",
  ];
  ctx.fillStyle = "#2a241c";
  ctx.font = "500 28px 'Segoe UI', sans-serif";
  details.forEach((line, index) => {
    ctx.fillText(line, x + 74, y + 430 + index * 48);
  });

  ctx.fillStyle = "#8a7b68";
  ctx.font = "500 18px 'Segoe UI', sans-serif";
  ctx.fillText("ESPECIALIDAD  ·  DESDE 2014", x + 860, y + 620);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error("No se pudo crear el ejemplo."));
        else resolve(blob);
      },
      "image/jpeg",
      0.92,
    );
  });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}
