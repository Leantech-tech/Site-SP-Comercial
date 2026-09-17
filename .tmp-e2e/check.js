const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    args: ['--no-sandbox'],
  });

  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });

  await page.setViewport({ width: 1440, height: 960 });
  await page.goto('file:///C:/Projetos/Site-SP-Comercial/index.html', { waitUntil: 'networkidle0' });

  // 1. Desktop: scroll até a galeria e aguarda reveal
  await page.evaluate(() => document.getElementById('galeria').scrollIntoView());
  await new Promise(r => setTimeout(r, 1500));
  const galleryBox = await page.evaluate(() => {
    const el = document.querySelector('.gallery__grid');
    const r = el.getBoundingClientRect();
    const items = Array.from(document.querySelectorAll('.gallery__item')).map(i => {
      const b = i.getBoundingClientRect();
      return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) };
    });
    return { grid: { w: Math.round(r.width), h: Math.round(r.height) }, items };
  });
  console.log('GRID DESKTOP:', JSON.stringify(galleryBox, null, 1));
  await page.screenshot({ path: 'shot-gallery-desktop.png' });

  // 2. Abre lightbox clicando no 3º item
  await page.evaluate(() => document.querySelectorAll('.gallery__item')[2].click());
  await new Promise(r => setTimeout(r, 700));
  const lbState = await page.evaluate(() => ({
    open: document.getElementById('lightbox').classList.contains('lightbox--open'),
    counter: document.querySelector('.lightbox__counter').textContent,
    label: document.querySelector('.lightbox__caption-label').textContent,
    bodyOverflow: document.body.style.overflow,
  }));
  console.log('LIGHTBOX ABERTO:', JSON.stringify(lbState));
  await page.screenshot({ path: 'shot-lightbox.png' });

  // 3. Navegação por teclado
  await page.keyboard.press('ArrowRight');
  await new Promise(r => setTimeout(r, 300));
  const counter2 = await page.evaluate(() => document.querySelector('.lightbox__counter').textContent);
  console.log('APÓS ArrowRight:', counter2);

  // 4. Fecha com Escape
  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 500));
  const lbClosed = await page.evaluate(() => ({
    open: document.getElementById('lightbox').classList.contains('lightbox--open'),
    bodyOverflow: document.body.style.overflow,
  }));
  console.log('APÓS Escape:', JSON.stringify(lbClosed));

  // 5. Mobile
  await page.setViewport({ width: 390, height: 844 });
  await page.evaluate(() => document.getElementById('galeria').scrollIntoView());
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: 'shot-gallery-mobile.png' });

  console.log('ERROS:', errors.length ? errors : 'nenhum');
  await browser.close();
})();
