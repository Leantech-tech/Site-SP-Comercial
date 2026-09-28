const sharp = require('sharp');
const fs = require('fs');

async function main() {
  const HERO = 'img/Hero_files/seção hero.png';
  const LOGO = 'img/Hero_files/Nova logo.png';
  const BACKUP = 'img/Hero_files/seção hero - backup antes de add logo.png';

  if (!fs.existsSync(BACKUP)) {
    fs.copyFileSync(HERO, BACKUP);
    console.log('Backup criado:', BACKUP);
  }

  const hero = sharp(HERO);
  const { width: HW, height: HH } = await hero.metadata();

  // Logo acima da frase "DO BÁSICO AO ACABAMENTO", alinhada à esquerda com o texto
  const LOGO_WIDTH = 480;
  const LEFT = 140;   // alinhado com o início do texto
  const TOP = 70;

  const logoBuf = await sharp(LOGO)
    .resize(LOGO_WIDTH, null, { fit: 'inside' })
    .png()
    .toBuffer();

  const logoMeta = await sharp(logoBuf).metadata();
  console.log(`Hero: ${HW}x${HH} | Logo composta: ${logoMeta.width}x${logoMeta.height} em (${LEFT}, ${TOP})`);

  await hero
    .composite([{ input: logoBuf, left: LEFT, top: TOP }])
    .png()
    .toFile(HERO + '.tmp');

  fs.renameSync(HERO + '.tmp', HERO);
  console.log('Salvo em:', HERO);
}

main().catch(console.error);
