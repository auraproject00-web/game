const { chromium } = require('playwright');
const path = require('path');
const out = process.argv[2] || '/tmp';
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 960, height: 540 } });
  const errs = [];
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  p.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  await p.goto('file://' + path.resolve(__dirname, '../index.html'));
  await p.waitForFunction(() => window.NinjaSabar, null, { timeout: 5000 });
  await p.waitForTimeout(600);
  await p.screenshot({ path: out + '/menu.png' });
  // sprite sheet
  await p.evaluate(() => {
    const S = PixelRenderer.sprites, keys = Object.keys(S).filter(k => k !== 'ground');
    const c = document.createElement('canvas'); c.width = 600; c.height = 260; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; x.fillStyle = '#7ab'; x.fillRect(0, 0, 600, 260);
    let px = 2, py = 2; for (const k of keys) { const s = S[k]; if (px + s.width * 3 > 600) { px = 2; py += 64; } x.drawImage(s, px, py, s.width * 3, s.height * 3); px += s.width * 3 + 4; }
    window.__sheet = c.toDataURL();
  });
  const sheet = await p.evaluate(() => window.__sheet);
  require('fs').writeFileSync(out + '/sheet.png', Buffer.from(sheet.split(',')[1], 'base64'));
  await p.keyboard.press('Enter');
  await p.evaluate(() => { NinjaSabar.world.invincible = true; });
  for (let i = 0; i < 6; i++) { await p.waitForTimeout(1500); await p.screenshot({ path: out + '/play' + i + '.png' }); }
  const st = await p.evaluate(() => ({ state: NinjaSabar.state, x: NinjaSabar.world.player.x, chunks: NinjaSabar.world.director.chunks.map(c => c.type).join(',') }));
  console.log('STATE', JSON.stringify(st));
  if (process.argv[3] === 'tests') {
    const t0 = Date.now();
    const res = await p.evaluate(() => NinjaSabar.SelfTest.run());
    console.log('SELFTEST (' + (Date.now() - t0) + 'ms)');
    for (const r of res) console.log((r.pass ? 'PASS ' : 'FAIL ') + r.name + ' :: ' + r.detail);
  }
  console.log('ERRORS', errs.length ? errs.join('\n') : 'none');
  await b.close();
})();
