import { QRStyle, SocialPlatform, SOCIAL_LOGOS } from '../types/qr';
import QRCode from 'qrcode';

export async function generateCleanPNG(
  content: string, 
  style: QRStyle, 
  size: number = 400,
  platform?: SocialPlatform
): Promise<string> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  const margin = 40;
  const titleHeight = style.title ? 60 : 0;
  const totalWidth = size + margin * 2;
  const totalHeight = size + margin * 2 + titleHeight;
  
  canvas.width = totalWidth;
  canvas.height = totalHeight;
  
  // Background color first
  ctx.fillStyle = style.background;
  ctx.fillRect(0, 0, totalWidth, totalHeight);
  
  // Background image if provided
  if (style.backgroundImage) {
    try {
      const bgImg = await loadImage(style.backgroundImage);
      
      // Draw background image with cover effect
      const scale = Math.max(totalWidth / bgImg.width, totalHeight / bgImg.height);
      const x = (totalWidth - bgImg.width * scale) / 2;
      const y = (totalHeight - bgImg.height * scale) / 2;
      ctx.globalAlpha = 0.25;
      ctx.drawImage(bgImg, x, y, bgImg.width * scale, bgImg.height * scale);
      ctx.globalAlpha = 1;
    } catch (err) {
      console.error('Failed to load background image:', err);
    }
  }
  
  // Title if provided
  if (style.title) {
    ctx.fillStyle = style.foreground;
    ctx.font = 'bold 24px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(style.title, totalWidth / 2, margin / 2 + 20);
  }
  
  // Generate QR code - use white background for QR when there's a background image
  const qrBackground = style.backgroundImage ? '#ffffff' : style.background;
  const qrDataUrl = await QRCode.toDataURL(content, {
    errorCorrectionLevel: platform || style.backgroundImage ? 'H' : style.errorCorrection,
    margin: 2,
    width: size,
    color: {
      dark: style.foreground,
      light: qrBackground,
    },
  });
  
  // Draw QR code
  const qrImage = await loadImage(qrDataUrl);
  ctx.drawImage(qrImage, margin, margin + titleHeight, size, size);
  
  // Draw platform logo in center if social media
  if (platform && platform !== 'custom' && SOCIAL_LOGOS[platform]) {
    await drawPlatformLogo(ctx, platform, style, margin, titleHeight, size);
  }
  
  return canvas.toDataURL('image/png');
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

async function drawPlatformLogo(
  ctx: CanvasRenderingContext2D,
  platform: SocialPlatform,
  style: QRStyle,
  margin: number,
  titleHeight: number,
  size: number
): Promise<void> {
  const logoSize = size * 0.18;
  const logoX = margin + (size - logoSize) / 2;
  const logoY = margin + titleHeight + (size - logoSize) / 2;
  
  // White circle background for logo
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2 + 6, 0, Math.PI * 2);
  ctx.fill();
  
  // Border around logo
  ctx.strokeStyle = style.foreground;
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Draw SVG logo
  try {
    const svgLogo = SOCIAL_LOGOS[platform];
    const svgContent = svgLogo.replace(/<svg[^>]*>/, '').replace(/<\/svg>/, '');
    const fullSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${logoSize}" height="${logoSize}" viewBox="0 0 24 24" fill="${style.foreground}">${svgContent}</svg>`;
    const svgBlob = new Blob([fullSvg], { type: 'image/svg+xml' });
    const svgUrl = URL.createObjectURL(svgBlob);
    
    const logoImg = await loadImage(svgUrl);
    ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
    URL.revokeObjectURL(svgUrl);
  } catch (err) {
    console.error('Failed to draw logo:', err);
  }
}

export async function generateCleanSVG(
  content: string, 
  style: QRStyle,
  platform?: SocialPlatform
): Promise<string> {
  const titleHeight = style.title ? 50 : 0;
  const size = 400;
  const totalHeight = size + titleHeight;
  
  // Note: SVG export doesn't support background images (use PNG for that)
  const svg = await QRCode.toString(content, {
    type: 'svg',
    errorCorrectionLevel: platform ? 'H' : style.errorCorrection,
    margin: 2,
    width: size,
    color: {
      dark: style.foreground,
      light: style.background,
    },
  });
  
  // Extract inner SVG content
  const innerMatch = svg.match(/<svg[^>]*>([\s\S]*)<\/svg>/);
  const innerContent = innerMatch ? innerMatch[1] : '';
  
  let titleSvg = '';
  if (style.title) {
    titleSvg = `<text x="${size / 2}" y="30" font-family="Inter, system-ui, sans-serif" font-size="22" font-weight="bold" text-anchor="middle" fill="${style.foreground}">${escapeXml(style.title)}</text>`;
  }
  
  let logoSvg = '';
  if (platform && platform !== 'custom' && SOCIAL_LOGOS[platform]) {
    const logoSize = 72;
    const logoPos = (size - logoSize) / 2;
    const logoY = logoPos + titleHeight;
    const logoSvgContent = SOCIAL_LOGOS[platform].replace(/<svg[^>]*>/, '').replace(/<\/svg>/, '');
    
    logoSvg = `
      <circle cx="${logoPos + logoSize/2}" cy="${logoY + logoSize/2}" r="${logoSize/2 + 6}" fill="#ffffff" stroke="${style.foreground}" stroke-width="2"/>
      <g transform="translate(${logoPos}, ${logoY})">
        <svg width="${logoSize}" height="${logoSize}" viewBox="0 0 24 24" fill="${style.foreground}">
          ${logoSvgContent}
        </svg>
      </g>
    `;
  }
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${totalHeight}" viewBox="0 0 ${size} ${totalHeight}">
  <rect width="${size}" height="${totalHeight}" fill="${style.background}"/>
  ${titleSvg}
  <g transform="translate(0, ${titleHeight})">
    ${innerContent}
  </g>
  ${logoSvg}
</svg>`;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
