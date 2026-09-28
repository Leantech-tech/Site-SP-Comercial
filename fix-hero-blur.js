const sharp = require('sharp');
const fs = require('fs');

async function main() {
  const SRC = 'img/Hero_files/seção hero.png';
  const DST = 'img/Hero_files/seção hero.png';
  const BACKUP = 'img/Hero_files/seção hero - backup pre-fix.png';

  if (!fs.existsSync(BACKUP)) {
    fs.copyFileSync(SRC, BACKUP);
    console.log('Backup criado:', BACKUP);
  }

  const { data, info } = await sharp(SRC)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const W = info.width;
  const H = info.height;
  const C = info.channels;
  console.log(`Imagem: ${W}x${H}, ${C} canais`);

  const out = Buffer.from(data);

  // Zona com borrões: cobre inpaint original + restos visíveis (inclui linha vertical até y≈367)
  const AZ = { x1: 25, y1: 10, x2: 875, y2: 368 };

  // Fonte: zona limpa de nuvens à direita
  const SZ = { x1: 885, y1: 0, x2: 1085, y2: 350 };

  const azW = AZ.x2 - AZ.x1 + 1;
  const azH = AZ.y2 - AZ.y1 + 1;
  const szW = SZ.x2 - SZ.x1 + 1;
  const szH = SZ.y2 - SZ.y1 + 1;

  console.log(`AZ: ${azW}x${azH} | SZ: ${szW}x${szH}`);

  // Preencher zona de artefatos com textura da fonte
  // X: ladrilhamento com espelhamento para disfarçar repetição
  // Y: mapeamento proporcional
  for (let y = AZ.y1; y <= AZ.y2; y++) {
    const fy = (y - AZ.y1) / azH;
    for (let x = AZ.x1; x <= AZ.x2; x++) {
      // Ladrilho horizontal com espelhamento
      const localX = (x - AZ.x1) % szW;
      const tileIdx = Math.floor((x - AZ.x1) / szW);
      const srcLocalX = (tileIdx % 2 === 1) ? (szW - 1 - localX) : localX;

      // Posição Y proporcional
      const srcY = SZ.y1 + Math.round(fy * (szH - 1));

      // Jitter suave (baixa frequência) para variar sem destruir a textura
      const dx = x - AZ.x1;
      const dy = y - AZ.y1;
      const jx = Math.sin(dx * 0.022 + dy * 0.016) * 22;
      const jy = Math.cos(dx * 0.018 - dy * 0.024) * 22;

      let sx = Math.round(SZ.x1 + srcLocalX + jx);
      let sy = Math.round(srcY + jy);

      // Manter dentro dos limites da fonte
      sx = Math.max(SZ.x1, Math.min(SZ.x2, sx));
      sy = Math.max(SZ.y1, Math.min(SZ.y2, sy));

      const si = (sy * W + sx) * C;
      const di = (y * W + x) * C;

      out[di] = data[si];
      out[di + 1] = data[si + 1];
      out[di + 2] = data[si + 2];
      if (C > 3) out[di + 3] = data[si + 3];
    }
  }

  // Suavizar bordas da zona substituída (feather)
  const FEATHER = 55;

  for (let y = AZ.y1; y <= AZ.y2; y++) {
    for (let x = AZ.x1; x <= AZ.x2; x++) {
      const dL = x - AZ.x1;
      const dR = AZ.x2 - x;
      const dT = y - AZ.y1;
      const dB = AZ.y2 - y;
      const dE = Math.min(dL, dR, dT, dB);

      if (dE < FEATHER) {
        const t = dE / FEATHER; // 0 na borda, 1 no interior

        // Amostrar pixel original logo fora da zona
        let ox = x, oy = y;
        if (dE === dL) ox = AZ.x1 - 1;
        else if (dE === dR) ox = AZ.x2 + 1;
        else if (dE === dT) oy = AZ.y1 - 1;
        else oy = AZ.y2 + 1;

        ox = Math.max(0, Math.min(W - 1, ox));
        oy = Math.max(0, Math.min(H - 1, oy));

        const oi = (oy * W + ox) * C;
        const di = (y * W + x) * C;

        out[di] = Math.round(data[oi] * (1 - t) + out[di] * t);
        out[di + 1] = Math.round(data[oi + 1] * (1 - t) + out[di + 1] * t);
        out[di + 2] = Math.round(data[oi + 2] * (1 - t) + out[di + 2] * t);
      }
    }
  }

  await sharp(out, { raw: { width: W, height: H, channels: C } })
    .png()
    .toFile(DST);

  console.log('Salvo em:', DST);
}

main().catch(console.error);
