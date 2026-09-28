const sharp = require('sharp');

async function main() {
  const SRC = 'img/Hero_files/seção hero - backup original.png';
  const DST = 'img/Hero_files/seção hero.png';

  console.log('Loading source image...');
  const { data, info } = await sharp(SRC)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const W = info.width;
  const H = info.height;
  const C = info.channels;
  console.log(`Image: ${W}x${H}, ${C} channels`);

  const out = Buffer.from(data);

  // Tight logo bounding box (blue oval + SP text + | + MATERIAIS P/ CONSTRUÇÃO)
  const BOX = { x1: 55, y1: 55, x2: 650, y2: 265 };

  // Step 1: Create binary mask — 1 = logo pixel (needs fill), 0 = background (keep)
  const mask = new Uint8Array(W * H);

  for (let y = BOX.y1; y <= BOX.y2; y++) {
    for (let x = BOX.x1; x <= BOX.x2; x++) {
      const i = (y * W + x) * C;
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;

      // Logo pixel detection:
      // - White/bright text: luminance > 45
      // - Blue oval: B > 70 and significantly higher than R and G
      const isBright = lum > 45;
      const isBlue = (b > 70 && b > r * 1.8 && b > g * 1.2);

      if (isBright || isBlue) {
        mask[y * W + x] = 1;
      }
    }
  }

  // Step 2: Dilate mask by 4 pixels to cover anti-aliased edges
  for (let pass = 0; pass < 4; pass++) {
    const src = new Uint8Array(mask);
    for (let y = Math.max(0, BOX.y1 - 10); y <= Math.min(H - 1, BOX.y2 + 10); y++) {
      for (let x = Math.max(0, BOX.x1 - 10); x <= Math.min(W - 1, BOX.x2 + 10); x++) {
        if (src[y * W + x] === 1) {
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const ny = y + dy, nx = x + dx;
              if (ny >= 0 && ny < H && nx >= 0 && nx < W) {
                mask[ny * W + nx] = 1;
              }
            }
          }
        }
      }
    }
  }

  let maskCount = 0;
  for (let i = 0; i < W * H; i++) if (mask[i]) maskCount++;
  console.log(`Masked ${maskCount} pixels`);

  // Step 3: Initialize masked pixels with nearby non-masked pixel average
  for (let y = Math.max(0, BOX.y1 - 10); y <= Math.min(H - 1, BOX.y2 + 10); y++) {
    for (let x = Math.max(0, BOX.x1 - 10); x <= Math.min(W - 1, BOX.x2 + 10); x++) {
      if (!mask[y * W + x]) continue;

      let sr = 0, sg = 0, sb = 0, cnt = 0;
      // Search in expanding radius for non-masked neighbors
      for (let rad = 1; rad <= 40 && cnt === 0; rad++) {
        for (let dy = -rad; dy <= rad; dy++) {
          for (let dx = -rad; dx <= rad; dx++) {
            if (Math.abs(dy) !== rad && Math.abs(dx) !== rad) continue; // only border of the square
            const ny = y + dy, nx = x + dx;
            if (ny < 0 || ny >= H || nx < 0 || nx >= W) continue;
            if (!mask[ny * W + nx]) {
              const ni = (ny * W + nx) * C;
              sr += data[ni]; sg += data[ni + 1]; sb += data[ni + 2];
              cnt++;
            }
          }
        }
      }

      const i = (y * W + x) * C;
      if (cnt > 0) {
        out[i] = Math.round(sr / cnt);
        out[i + 1] = Math.round(sg / cnt);
        out[i + 2] = Math.round(sb / cnt);
      } else {
        out[i] = 2; out[i + 1] = 16; out[i + 2] = 30;
      }
      out[i + 3] = 255;
    }
  }

  // Step 4: Laplacian diffusion on masked pixels only
  // Solves Laplace's equation — smooth fill from boundary inward
  const ITERS = 300;
  const PAD = 5;
  const yMin = Math.max(0, BOX.y1 - PAD);
  const yMax = Math.min(H - 1, BOX.y2 + PAD);
  const xMin = Math.max(0, BOX.x1 - PAD);
  const xMax = Math.min(W - 1, BOX.x2 + PAD);

  for (let iter = 0; iter < ITERS; iter++) {
    const fwd = iter % 2 === 0;

    for (let y = fwd ? yMin : yMax; fwd ? y <= yMax : y >= yMin; y += fwd ? 1 : -1) {
      for (let x = fwd ? xMin : xMax; fwd ? x <= xMax : x >= xMin; x += fwd ? 1 : -1) {
        if (!mask[y * W + x]) continue;

        let sr = 0, sg = 0, sb = 0, cnt = 0;
        // 4-connected neighbors for Laplacian
        const nb = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        for (const [dy, dx] of nb) {
          const ny = y + dy, nx = x + dx;
          if (ny < 0 || ny >= H || nx < 0 || nx >= W) continue;
          const ni = (ny * W + nx) * C;
          sr += out[ni]; sg += out[ni + 1]; sb += out[ni + 2];
          cnt++;
        }

        if (cnt > 0) {
          const i = (y * W + x) * C;
          out[i] = Math.round(sr / cnt);
          out[i + 1] = Math.round(sg / cnt);
          out[i + 2] = Math.round(sb / cnt);
        }
      }
    }

    if (iter % 50 === 0) console.log(`Diffusion: ${iter}/${ITERS}`);
  }

  // Save WITHOUT any blur or post-processing
  console.log('Saving result...');
  await sharp(out, { raw: { width: W, height: H, channels: C } })
    .png()
    .toFile(DST);

  console.log('Done! Saved to', DST);
}

main().catch(console.error);
