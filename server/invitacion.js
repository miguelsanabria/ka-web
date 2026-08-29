import { createCanvas } from "@napi-rs/canvas";
import { readFileSync } from "node:fs";
import path from "node:path";
import QRCode from "qrcode";

const W = 1080;
const H = 1350; // taller to fit QR

const COLORS = {
  cream: "#f1ede3",
  creamDark: "#e8e1d3",
  charcoal: "#383a2d",
  charcoalSoft: "#54564a",
  gold: "#b8a97f",
  bronze: "#8a7a55",
  sage: "#797b63",
  white: "#fefdf8",
};

function drawTextCentered(ctx, text, y, font, color, maxWidth = W - 160) {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const words = text.split(" ");
  const lines = [];
  let currentLine = "";
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  const lineHeight = parseInt(font, 10) * 1.4 || 40;
  const totalHeight = lines.length * lineHeight;
  let startY = y - totalHeight / 2 + lineHeight / 2;
  for (const line of lines) {
    ctx.fillText(line, W / 2, startY);
    startY += lineHeight;
  }
  return lines.length;
}

function drawDivider(ctx, y, width = 400) {
  const x1 = (W - width) / 2;
  const x2 = (W + width) / 2;
  const grad = ctx.createLinearGradient(x1, y, x2, y);
  grad.addColorStop(0, "transparent");
  grad.addColorStop(0.2, COLORS.gold);
  grad.addColorStop(0.5, COLORS.bronze);
  grad.addColorStop(0.8, COLORS.gold);
  grad.addColorStop(1, "transparent");
  ctx.strokeStyle = grad;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x1, y);
  ctx.lineTo(x2, y);
  ctx.stroke();
  ctx.fillStyle = COLORS.gold;
  ctx.beginPath();
  ctx.arc(W / 2, y, 3, 0, Math.PI * 2);
  ctx.fill();
}

function drawQR(ctx, text, cx, cy, size) {
  try {
    const qr = QRCode.create(text, { errorCorrectionLevel: "M" });
    const count = qr.modules.size;
    const cell = size / count;
    // white bg
    ctx.fillStyle = "#ffffff";
    const pad = 12;
    ctx.fillRect(cx - size / 2 - pad, cy - size / 2 - pad, size + pad * 2, size + pad * 2);
    // subtle border
    ctx.strokeStyle = COLORS.gold + "55";
    ctx.lineWidth = 1;
    ctx.strokeRect(cx - size / 2 - pad, cy - size / 2 - pad, size + pad * 2, size + pad * 2);
    ctx.fillStyle = COLORS.charcoal;
    for (let r = 0; r < count; r++) {
      for (let c = 0; c < count; c++) {
        if (qr.modules.get(c, r)) {
          ctx.fillRect(cx - size / 2 + c * cell, cy - size / 2 + r * cell, Math.ceil(cell), Math.ceil(cell));
        }
      }
    }
  } catch {}
}

export function generateInvitation({ nombre, personas, token, siteUrl }) {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");
  const withQR = Boolean(token && siteUrl);
  drawBase(ctx, nombre, personas, token, siteUrl, withQR);
  return canvas.toBuffer("image/png");
}

export async function generateInvitationAsync(opts) {
  return generateInvitation(opts);
}

function drawBase(ctx, nombre, personas, token, siteUrl, withQR) {
  // Fondo
  const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
  bgGrad.addColorStop(0, COLORS.cream);
  bgGrad.addColorStop(0.5, COLORS.white);
  bgGrad.addColorStop(1, COLORS.cream);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  const borderGrad = ctx.createLinearGradient(60, 60, W - 60, H - 60);
  borderGrad.addColorStop(0, COLORS.gold);
  borderGrad.addColorStop(0.5, COLORS.bronze);
  borderGrad.addColorStop(1, COLORS.gold);
  ctx.strokeStyle = borderGrad;
  ctx.lineWidth = 2;
  ctx.strokeRect(60, 60, W - 120, H - 120);
  ctx.strokeStyle = COLORS.gold + "40";
  ctx.lineWidth = 1;
  ctx.strokeRect(72, 72, W - 144, H - 144);

  ctx.fillStyle = COLORS.gold;
  for (const [cx, cy] of [[72, 72], [W - 72, 72], [72, H - 72], [W - 72, H - 72]]) {
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.font = "14px sans-serif";
  ctx.fillStyle = COLORS.bronze;
  ctx.textAlign = "center";
  ctx.fillText("I N V I T A C I Ó N", W / 2, 135);
  drawDivider(ctx, 170, 300);

  ctx.font = "64px serif";
  ctx.fillStyle = COLORS.charcoal;
  ctx.textAlign = "center";
  ctx.fillText("Karen", W / 2, 250);
  ctx.font = "48px serif";
  ctx.fillStyle = COLORS.gold;
  ctx.fillText("&", W / 2, 315);
  ctx.font = "64px serif";
  ctx.fillStyle = COLORS.charcoal;
  ctx.fillText("Aldo", W / 2, 385);
  drawDivider(ctx, 435, 500);

  ctx.font = "16px sans-serif";
  ctx.fillStyle = COLORS.bronze;
  ctx.fillText("I N V I T A C I Ó N   P A R A", W / 2, 485);

  let fontSize = 36;
  if (nombre.length > 30) fontSize = 28;
  if (nombre.length > 40) fontSize = 24;
  ctx.font = `bold ${fontSize}px sans-serif`;
  const nameLines = drawTextCentered(ctx, nombre, 545, ctx.font, COLORS.charcoal);

  const ticketY = 545 + nameLines * (fontSize * 1.4) + 35;
  drawDivider(ctx, ticketY - 28, 350);
  ctx.font = "16px sans-serif";
  ctx.fillStyle = COLORS.bronze;
  ctx.fillText("B O L E T O S   A S I G N A D O S", W / 2, ticketY + 8);
  ctx.font = "bold 80px serif";
  ctx.fillStyle = COLORS.gold;
  ctx.fillText(String(personas), W / 2, ticketY + 90);
  ctx.font = "18px sans-serif";
  ctx.fillStyle = COLORS.charcoalSoft;
  ctx.fillText(personas === 1 ? "boleto" : "boletos", W / 2, ticketY + 125);
  drawDivider(ctx, ticketY + 160, 350);

  ctx.font = "20px sans-serif";
  ctx.fillStyle = COLORS.charcoal;
  ctx.fillText("0 7   d e   N o v i e m b r e   d e   2 0 2 6", W / 2, ticketY + 195);
  ctx.font = "16px sans-serif";
  ctx.fillStyle = COLORS.charcoalSoft;
  ctx.fillText("Tepatitlán de Morelos, Jalisco", W / 2, ticketY + 225);

  if (withQR && token && siteUrl) {
    const url = `${siteUrl.replace(/\/$/, "")}/rsvp?t=${token}`;
    const qrY = ticketY + 300;
    drawQR(ctx, url, W / 2, qrY, 180);
    ctx.font = "11px sans-serif";
    ctx.fillStyle = COLORS.bronze;
    ctx.letterSpacing = "2px";
    ctx.fillText("CONFIRMA TU ASISTENCIA", W / 2, qrY + 125);
    ctx.font = "10px sans-serif";
    ctx.fillStyle = COLORS.charcoalSoft;
    ctx.fillText("Escanea el código QR", W / 2, qrY + 145);
  }

  ctx.font = "13px sans-serif";
  ctx.fillStyle = COLORS.gold;
  ctx.letterSpacing = "1px";
  ctx.fillText("karen-y-aldo.com", W / 2, H - 95);
  if (withQR) {
    ctx.font = "10px sans-serif";
    ctx.fillStyle = COLORS.stone || "#8b8577";
    ctx.fillText("Invitación personal e intransferible", W / 2, H - 70);
  }
}
