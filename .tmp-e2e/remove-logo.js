const puppeteer = require('puppeteer-core');
const fs = require('fs');

(async () => {
  const imgPath = 'C:/Projetos/Site-SP-Comercial/img/Hero_files/seção hero.png';
  const b64 = fs.readFileSync(imgPath).toString('base64');

  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage();

  const result = await page.evaluate(async (b64) => {
    const img = new Image();
    img.src = 'data:image/png;base64,' + b64;
    await img.decode();

    const W = img.width, H = img.height;
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    // Região com a logo duplicada (medida na imagem original 1815x867)
    const T = { x: 100, y: 90, w: 800, h: 225 };
    // Região doadora: fundo limpo à direita, mesma faixa vertical
    const S = { x: 50, y: 600, w: 800, h: 225 };

    const patch = document.createElement('canvas');
    patch.width = T.w; patch.height = T.h;
    const pctx = patch.getContext('2d');
    // espelha verticalmente para disfarçar a clonagem
    pctx.translate(0, T.h);
    pctx.scale(1, -1);
    pctx.drawImage(canvas, S.x, S.y, S.w, S.h, 0, 0, T.w, T.h);

    // máscara com bordas suavizadas (feather) para misturar com o fundo
    const mask = document.createElement('canvas');
    mask.width = T.w; mask.height = T.h;
    const mctx = mask.getContext('2d');
    mctx.fillStyle = '#fff';
    mctx.fillRect(0, 0, T.w, T.h);
    mctx.globalCompositeOperation = 'destination-out';
    const f = 55; // largura do feather
    // esquerda
    let g = mctx.createLinearGradient(0, 0, f, 0);
    g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    mctx.fillStyle = g; mctx.fillRect(0, 0, f, T.h);
    // direita
    g = mctx.createLinearGradient(T.w, 0, T.w - f, 0);
    g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    mctx.fillStyle = g; mctx.fillRect(T.w - f, 0, f, T.h);
    // topo
    g = mctx.createLinearGradient(0, 0, 0, f);
    g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    mctx.fillStyle = g; mctx.fillRect(0, 0, T.w, f);
    // base
    g = mctx.createLinearGradient(0, T.h, 0, T.h - f);
    g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    mctx.fillStyle = g; mctx.fillRect(0, T.h - f, T.w, f);

    pctx.globalCompositeOperation = 'destination-in';
    pctx.setTransform(1, 0, 0, 1, 0, 0);
    pctx.drawImage(mask, 0, 0);

    ctx.drawImage(patch, T.x, T.y);
    return canvas.toDataURL('image/png');
  }, b64);

  fs.writeFileSync(imgPath, Buffer.from(result.split(',')[1], 'base64'));
  await browser.close();
  console.log('OK');
})();
