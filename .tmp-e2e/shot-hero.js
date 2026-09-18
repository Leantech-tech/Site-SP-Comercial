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
  page.on('requestfailed', (r) => errors.push('REQFAIL: ' + r.url()));

  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('file:///C:/Projetos/Site-SP-Comercial/index.html', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: 'shot-hero-desktop.png' });

  await page.setViewport({ width: 390, height: 844 });
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: 'shot-hero-mobile.png' });

  console.log('ERROS:', errors.length ? errors.join('\n') : 'nenhum');
  await browser.close();
})();
