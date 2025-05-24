import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';

// Ensure icons directory exists
const iconsDir = './public/icons';
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate icons
const sizes = [192, 512];
const color = '#10b981'; // emerald-500

sizes.forEach(size => {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, size, size);

  // Shopping cart icon (simplified)
  ctx.fillStyle = 'white';
  ctx.strokeStyle = 'white';
  ctx.lineWidth = size * 0.02;

  // Cart body
  const cartSize = size * 0.6;
  const cartX = (size - cartSize) / 2;
  const cartY = (size - cartSize) / 2;

  // Cart outline
  ctx.beginPath();
  ctx.rect(cartX + cartSize * 0.2, cartY + cartSize * 0.3, cartSize * 0.6, cartSize * 0.4);
  ctx.stroke();

  // Cart handle
  ctx.beginPath();
  ctx.moveTo(cartX, cartY + cartSize * 0.3);
  ctx.lineTo(cartX + cartSize * 0.2, cartY + cartSize * 0.3);
  ctx.stroke();

  // Cart wheels
  ctx.beginPath();
  ctx.arc(cartX + cartSize * 0.35, cartY + cartSize * 0.8, cartSize * 0.05, 0, 2 * Math.PI);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(cartX + cartSize * 0.65, cartY + cartSize * 0.8, cartSize * 0.05, 0, 2 * Math.PI);
  ctx.fill();

  // Save the icon
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(iconsDir, `pwa-${size}x${size}.png`), buffer);
  console.log(`✅ Generated ${size}x${size} icon`);
});

console.log('🎨 Icon generation complete!');
