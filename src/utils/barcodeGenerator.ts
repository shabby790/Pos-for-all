/**
 * Utility to generate realistic SVG barcode vectors for products
 */

export function generateBarcodeBars(code: string): number[] {
  const str = (code || '00000000').trim();
  const widths: number[] = [];
  
  // Start pattern
  widths.push(2, 1, 1, 2);
  
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);
    const w1 = (charCode % 3) + 1;
    const w2 = ((charCode >> 1) % 2) + 1;
    const w3 = ((charCode >> 2) % 3) + 1;
    const w4 = ((charCode >> 3) % 2) + 1;
    widths.push(w1, w2, w3, w4);
  }
  
  // Stop pattern
  widths.push(2, 2, 1, 2, 1);
  return widths;
}

export function generateBarcodeSvgString(code: string, storeName: string, productName: string, priceStr: string): string {
  const cleanCode = (code || '00000000').trim();
  const bars = generateBarcodeBars(cleanCode);
  
  // Total units
  const totalUnits = bars.reduce((a, b) => a + b, 0);
  const totalWidth = 220;
  const barHeight = 42;
  const unitWidth = totalWidth / totalUnits;
  
  let currentX = 0;
  let rects = '';
  
  bars.forEach((w, idx) => {
    // Even indices are black bars, odd indices are white spaces
    if (idx % 2 === 0) {
      rects += `<rect x="${(currentX * unitWidth).toFixed(2)}" y="0" width="${(w * unitWidth).toFixed(2)}" height="${barHeight}" fill="#000000" />`;
    }
    currentX += w;
  });

  return `
    <div style="
      width: 100%;
      box-sizing: border-box;
      padding: 8px 6px;
      background: #ffffff;
      color: #000000;
      border: 1px dashed #666666;
      border-radius: 6px;
      text-align: center;
      font-family: Arial, sans-serif;
      margin: 0 auto;
      page-break-inside: avoid;
      break-inside: avoid;
    ">
      <div style="font-size: 9px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #111111;">
        ${escapeHtml(storeName || 'STORE')}
      </div>
      <div style="font-size: 10px; font-weight: bold; margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #000000;">
        ${escapeHtml(productName || 'Product')}
      </div>
      <div style="font-size: 11px; font-weight: 800; color: #047857; margin-top: 1px;">
        ${escapeHtml(priceStr)}
      </div>
      <div style="margin: 4px auto 2px auto; width: 100%; max-width: 180px; display: flex; justify-content: center;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} ${barHeight}" style="width: 100%; height: 36px; display: block;">
          ${rects}
        </svg>
      </div>
      <div style="font-size: 9px; font-family: monospace; font-weight: bold; letter-spacing: 1px; color: #333333;">
        ${escapeHtml(cleanCode)}
      </div>
    </div>
  `;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
