const { chromium, devices } = require('playwright');
const path = require('path'); const out = process.argv[2];
const url = 'file://' + path.resolve(__dirname, '../index.html');
(async () => {
  const b = await chromium.launch(); const errs = [];
  const p = await b.newPage({ viewport: { width: 960, height: 540 } });
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto(url); await p.waitForFunction(() => window.NinjaSabar);
  await p.keyboard.press('Enter');
  // veteran director, invincible, cycle through traps and grab frames when a trap is active near the player
  await p.evaluate(() => { const e = NinjaSabar, d = e.world.director; d.unlocked = ['spike', 'lantern', 'branch'].concat(INTRO_ORDER); d.introIdx = INTRO_ORDER.length; e.world.invincible = true; e.debug.toggle(); });
  const got = new Set();
  for (let i = 0; i < 160 && got.size < 14; i++) {
    await p.waitForTimeout(250);
    const act = await p.evaluate(() => { const w = NinjaSabar.world; const o = w.obstacles.find(o => o.trapType && !['coin', 'spike', 'lantern', 'branch'].includes(o.trapType) && o.st !== 'idle' && o.st !== 'done' && Math.abs(o.x - w.player.x) < 200); return o ? o.trapType : null; });
    if (act && !got.has(act)) { got.add(act); await p.screenshot({ path: out + '/trap_' + act + '.png' }); }
  }
  console.log('captured', [...got].join(','));
  await p.evaluate(() => { NinjaSabar.debug.toggle(); NinjaSabar.world.invincible = false; });
  // die: wait until dead
  await p.waitForFunction(() => NinjaSabar.state === 'dying' || NinjaSabar.state === 'over', null, { timeout: 30000 });
  await p.waitForTimeout(150); await p.screenshot({ path: out + '/dying.png' });
  await p.waitForFunction(() => NinjaSabar.state === 'over'); await p.waitForTimeout(1500); await p.screenshot({ path: out + '/over.png' });
  const t0 = Date.now(); await p.keyboard.press('KeyR'); const st = await p.evaluate(() => NinjaSabar.state + ' x=' + NinjaSabar.world.player.x.toFixed(1));
  console.log('after R:', st);
  // fps measurement (headless, software rendering)
  const fps = await p.evaluate(() => new Promise(res => { let n = 0; const t = performance.now(); const f = () => { n++; if (performance.now() - t < 2000) requestAnimationFrame(f); else res(n / ((performance.now() - t) / 1000)); }; requestAnimationFrame(f); }));
  console.log('headless fps', fps.toFixed(1));
  await p.close();
  // mobile
  const ctx = await b.newContext({ ...devices['Pixel 7 landscape'] }); const m = await ctx.newPage();
  m.on('pageerror', e => errs.push('mobile: ' + e.message));
  await m.goto(url); await m.waitForFunction(() => window.NinjaSabar);
  await m.tap('#bStart'); await m.waitForTimeout(300);
  const vis = await m.evaluate(() => getComputedStyle(document.getElementById('touch')).display);
  const before = await m.evaluate(() => ({ y: NinjaSabar.world.player.y, sx: scrollX, sy: scrollY }));
  await m.tap('#tJump'); const t1 = Date.now();
  await m.waitForFunction(() => !NinjaSabar.world.player.onGround || NinjaSabar.state !== 'play', null, { timeout: 2000 });
  const lat = Date.now() - t1;
  await m.waitForTimeout(120); await m.screenshot({ path: out + '/mobile.png' });
  // slide button hold
  await m.waitForFunction(() => NinjaSabar.world.player.onGround || NinjaSabar.state !== 'play');
  const box = await m.locator('#tSlide').boundingBox();
  await m.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
  const slid = await m.evaluate(() => new Promise(r => { let s = false; const t = performance.now(); const f = () => { s = s || NinjaSabar.world.player.sliding; if (performance.now() - t < 300) requestAnimationFrame(f); else r(s); }; requestAnimationFrame(f); }));
  const after = await m.evaluate(() => ({ sx: scrollX, sy: scrollY }));
  console.log('mobile: touch controls display=' + vis + ', jump latency ' + lat + 'ms (incl. automation), slide=' + slid + ', scroll ' + JSON.stringify(before) + '->' + JSON.stringify(after));
  // portrait
  const pc = await b.newContext({ ...devices['Pixel 7'] }); const pp = await pc.newPage(); await pp.goto(url); await pp.waitForFunction(() => window.NinjaSabar); await pp.tap('#bStart'); await pp.waitForTimeout(400); await pp.screenshot({ path: out + '/portrait.png' });
  console.log('ERRORS', errs.length ? errs.join('\n') : 'none');
  await b.close();
})();
