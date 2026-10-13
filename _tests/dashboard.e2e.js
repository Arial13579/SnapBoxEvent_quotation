// SnapBoxEvent_quotation dashboard: calendar + income/expenses tabs, against the Firestore/Auth emulators.
// env RULES=open|closed (closed = expenses rule not published yet)
const S = '/tmp/claude-0/-home-user/33274e87-36f1-52fb-a542-54f1e7d0e4b6/scratchpad';
const NM = S + '/t/node_modules/', FB = S + '/fb10/node_modules/firebase/';
const { chromium } = require(NM + 'playwright-core');
const fs = require('fs');
const AXE = fs.readFileSync(NM + 'axe-core/axe.min.js', 'utf8');
const SITE = 'http://localhost:8795/site', ADMIN = 'snapboxevent.official@gmail.com', OPEN = process.env.RULES !== 'closed';
const EMU = 'http://127.0.0.1:8086/v1/projects/wedding-rsvp-e2e0f/databases/(default)/documents/';
let failures = 0; const errors = [];
const check = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) failures++; };
const emu = async (method, p, body) => { const r = await fetch(EMU + p, { method, headers: { Authorization: 'Bearer owner', 'Content-Type': 'application/json' }, body: body && JSON.stringify(body) }); return { status: r.status, body: await r.json() }; };
const pad = n => String(n).padStart(2, '0'), dmy = d => pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + d.getFullYear();
const f = o => ({ fields: Object.fromEntries(Object.entries(o).map(([k, v]) => [k, typeof v === 'number' ? { integerValue: String(v) } : v instanceof Date ? { timestampValue: v.toISOString() } : { stringValue: v }])) });
const WRAP = {
  'firebase-app.js': `export * from '/__fb/firebase-app.js';`,
  'firebase-auth.js': `import * as m from '/__fb/firebase-auth.js'; export * from '/__fb/firebase-auth.js';
    export function getAuth(app){ const a = m.getAuth(app); try { m.connectAuthEmulator(a, 'http://127.0.0.1:9098', { disableWarnings: true }); } catch(e){} return a; }
    export function signInWithPopup(a){ return m.signInWithCredential(a, m.GoogleAuthProvider.credential(JSON.stringify({ sub: 'u1', email: window.__LOGIN || '${ADMIN}', email_verified: true }))); }`,
  'firebase-firestore.js': `import * as m from '/__fb/firebase-firestore.js'; export * from '/__fb/firebase-firestore.js';
    export function getFirestore(app){ const d = m.getFirestore(app); try { m.connectFirestoreEmulator(d, '127.0.0.1', 8086); } catch(e){} return d; }`
};

(async () => {
  const now = new Date(), ev = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 9);
  await emu('PATCH', 'snapbox_quotes/SB1', f({ clientName: 'משפחת לוי', eventType: 'בר מצווה', location: 'אולמי הגן, ראשון לציון', date: dmy(ev), startTime: '20:00', endTime: '00:30', guests: '250', price: 2900, deposit: 500, notes: 'כניסה צדדית', status: 'signed', createdAt: now, signedAt: now, pdfData: Buffer.from('%PDF-1.4\n%%EOF').toString('base64') }));
  await emu('PATCH', 'snapbox_quotes/SB2', f({ clientName: 'רונית', eventType: 'חתונה', location: 'חיפה', date: dmy(ev), startTime: '19:00', endTime: '23:00', price: 3500, deposit: 500, status: 'pending', createdAt: now }));
  await emu('PATCH', 'snapbox_quotes/SB3', f({ clientName: 'יואב', eventType: 'חינה', location: 'אשדוד', date: '15/03/2026', startTime: '20:00', price: 2000, deposit: 300, status: 'signed', createdAt: new Date('2026-02-01'), signedAt: new Date('2026-02-02') }));

  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, locale: 'he-IL', acceptDownloads: true });
  await ctx.route('**/*', async route => {
    const u = route.request().url(), H = { 'Access-Control-Allow-Origin': '*' };
    const m = u.match(/gstatic\.com\/firebasejs\/[\d.]+\/(firebase-(app|auth|firestore)\.js)$/);
    if (m) return route.fulfill({ body: WRAP[m[1]], contentType: 'application/javascript', headers: H });
    const l = u.match(/\/__fb\/(firebase-(app|auth|firestore)\.js)$/);
    if (l) return route.fulfill({ body: fs.readFileSync(FB + l[1]), contentType: 'application/javascript', headers: H });
    if (u.endsWith('chart.umd.min.js')) return route.fulfill({ body: fs.readFileSync(NM + 'chart.js/dist/chart.umd.js'), contentType: 'application/javascript' });
    if (u.startsWith('http://localhost:8795') || u.includes('127.0.0.1')) return route.continue();
    if (u.includes('fonts.g')) return route.fulfill({ body: '', contentType: 'text/css' });
    return route.abort();
  });
  const p = await ctx.newPage();
  p.on('pageerror', e => errors.push(e.message));
  p.on('dialog', d => d.accept());

  console.log('1. Login + quotes tab unchanged');
  await p.goto(SITE + '/dashboard.html');
  await p.click('#signInBtn');
  await p.waitForSelector('#tbody tr td.name', { timeout: 20000 });
  check(await p.locator('#tbody tr.main').count() === 3 && await p.isVisible('#kpis'), 'quotes table (3) + KPIs still there');
  check(await p.locator('.tabs button').count() === 3, '3 tabs: הצעות ולקוחות / יומן אירועים / הכנסות והוצאות');

  console.log('1b. Signed client details + my fields');
  const det = p.locator('#tbody tr.det:has([data-id="SB1"])');
  check(await p.locator('#tbody tr.det').count() === 2 && await p.locator('#tbody tr.det:has([data-id="SB2"])').count() === 0, 'details row only for signed clients (2), not for the pending one');
  const dt = (await det.textContent()).replace(/\s+/g, ' ');
  check(/משפחת לוי/.test(dt) && /אולמי הגן/.test(dt) && /20:00–00:30/.test(dt) && /4\.5 שעות/.test(dt) && /₪2,900/.test(dt) && /כניסה צדדית/.test(dt), 'full name, place, start–end, hours (4.5), price, client notes');
  if (OPEN) {
    await p.fill('[data-id="SB1"][data-f="couple"]', 'מאיה ודניאל'); await p.locator('[data-id="SB1"][data-f="couple"]').blur();
    await p.selectOption('[data-id="SB1"][data-f="pkg"]', 'gold');
    await p.waitForTimeout(600);
    check(/מחיר החבילה: ₪1,400/.test(await det.textContent()), 'choosing "גולד" shows ₪1,400');
    await p.check('[data-id="SB1"][data-f="depositPaid"]'); await p.check('[data-id="SB1"][data-f="entered"]');
    await p.fill('[data-id="SB1"][data-f="ownerNotes"]', 'להביא רקע לבן'); await p.locator('[data-id="SB1"][data-f="ownerNotes"]').blur();
    check(!(await p.locator('#tbody tr.main.paid').count()), 'not green before "שולם"');
    await p.check('[data-id="SB1"][data-f="paid"]'); await p.waitForTimeout(800);
    check(await p.locator('#tbody tr.main.paid').count() === 1 && await p.locator('#tbody tr.det.paid').count() === 1, '"שולם" → the client row turns light green');
    const bg = await p.evaluate(() => getComputedStyle(document.querySelector('#tbody tr.main.paid td')).backgroundColor);
    check(/rgba\(74, 222, 128/.test(bg), 'row background is light green: ' + bg);
    const ev = await emu('GET', 'snapbox_events/SB1'); const F = ev.body.fields || {};
    check(F.couple && F.couple.stringValue === 'מאיה ודניאל' && F.pkg.stringValue === 'gold' && +F.pkgPrice.integerValue === 1400 && F.paid.booleanValue && F.depositPaid.booleanValue && F.entered.booleanValue && F.ownerNotes.stringValue === 'להביא רקע לבן', 'all my fields saved (separate from the quote)');
    const q1 = await emu('GET', 'snapbox_quotes/SB1');
    check(!('ownerNotes' in q1.body.fields) && !('couple' in q1.body.fields), 'my notes are NOT on the quote the client can open');
    const anon = await fetch(EMU + 'snapbox_events/SB1');
    check(anon.status === 403, 'nobody else can read my fields (' + anon.status + ')');
    await p.reload(); await p.waitForTimeout(1500); if (await p.isVisible('#signInBtn')) await p.click('#signInBtn');
    await p.waitForSelector('#tbody tr.main.paid', { timeout: 15000 }).catch(() => {});
    check(await p.locator('#tbody tr.main.paid').count() === 1 && await p.inputValue('[data-id="SB1"][data-f="couple"]') === 'מאיה ודניאל' && await p.inputValue('[data-id="SB1"][data-f="pkg"]') === 'gold', 'after reload: still green, fields kept');
    await axe(p, 'quotes tab with details');
    await p.screenshot({ path: S + '/q/quotes.png', fullPage: true });
  } else {
    await p.check('[data-id="SB1"][data-f="paid"]'); await p.waitForTimeout(1000);
    check(/צריך להוסיף הרשאה/.test(await det.textContent()), 'clear message until the rule is published');
  }

  console.log('2. Calendar');
  await p.click('.tabs button[data-tab=cal]');
  await p.waitForSelector('#cal-list .ev-card', { timeout: 10000 });
  check(p.url().endsWith('#cal'), 'tab in the address (#cal)');
  check(await p.locator('#cal-list .ev-card').count() === 1, 'only the signed upcoming event (pending not shown, past not in "upcoming")');
  const card = (await p.textContent('#cal-list .ev-card')).replace(/\s+/g, ' ');
  if (OPEN) check(/מאיה ודניאל/.test(card) && /4\.5 שעות/.test(card) && /גולד · ₪1,400/.test(card) && /שולם ✓/.test(card) && /להביא רקע לבן/.test(card), 'calendar shows bride/groom, hours, package, paid, my notes');
  check(/משפחת לוי/.test(card) && /20:00–00:30/.test(card) && /אולמי הגן/.test(card) && /250 מוזמנים/.test(card) && /₪2,900/.test(card) && /₪500/.test(card) && /₪2,400/.test(card) && /כניסה צדדית/.test(card) && /נחתם עכשיו/.test(card), 'event card: client, hours, place, guests, price/deposit/balance, notes, "just signed"');
  const g = new URL(await p.getAttribute('#cal-list a[href^="https://calendar.google.com"]', 'href'));
  const y1 = ev.getFullYear() + pad(ev.getMonth() + 1) + pad(ev.getDate()), n1 = new Date(ev.getTime() + 864e5), y2 = n1.getFullYear() + pad(n1.getMonth() + 1) + pad(n1.getDate());
  check(g.searchParams.get('dates') === y1 + 'T200000/' + y2 + 'T003000' && g.searchParams.get('ctz') === 'Asia/Jerusalem' && /Snap Box/.test(g.searchParams.get('text')), 'Google Calendar link (ends after midnight): ' + g.searchParams.get('dates'));
  check(await p.locator('#cal-list a[href^="https://waze.com/ul?q="]').count() === 1, 'Waze navigation to the venue');
  check(await p.locator('#cal-list .cal-pdf').count() === 1, 'signed contract button');
  if (ev.getMonth() !== now.getMonth()) await p.click('#cal-next');
  check(await p.locator(`#cal-grid button[data-day="${ev.getFullYear()}-${pad(ev.getMonth() + 1)}-${pad(ev.getDate())}"].has`).count() === 1, 'event day marked in the month grid');
  const [dl] = await Promise.all([p.waitForEvent('download'), p.click('#cal-ics')]);
  check(fs.readFileSync(await dl.path(), 'utf8').includes('DTSTART;TZID=Asia/Jerusalem:' + y1 + 'T200000'), 'ics download');
  // חתימה חדשה נכנסת מיד
  await emu('PATCH', 'snapbox_quotes/SB2?updateMask.fieldPaths=status&updateMask.fieldPaths=signedAt', f({ status: 'signed', signedAt: new Date() }));
  await p.waitForFunction(() => document.querySelectorAll('#cal-list .ev-card').length === 2, null, { timeout: 8000 }).catch(() => {});
  check(await p.locator('#cal-list .ev-card').count() === 2, 'a new signature appears in the calendar live');
  await axe(p, 'calendar');

  console.log('3. Income & expenses (rules: ' + (OPEN ? 'published' : 'not yet published') + ')');
  await p.click('.tabs button[data-tab=books]');
  await p.waitForFunction(() => /6,400/.test(document.getElementById('bk-kpis').textContent), null, { timeout: 8000 }).catch(() => {});
  const k = async () => (await p.textContent('#bk-kpis')).replace(/\s+/g, ' ');
  check(/₪6,400 ?הכנסות החודש/.test(await k()), 'income this month = 2 signatures (2,900 + 3,500): ' + await k());
  check(await p.locator('#inc-list tbody tr').count() >= 2, 'income list');
  await p.fill('#ex-amount', '180'); await p.fill('#ex-label', 'נייר הדפסה'); await p.selectOption('#ex-cat', 'נייר והדפסות'); await p.click('#ex-add');
  if (OPEN) {
    await p.waitForSelector('#ex-list tbody tr', { timeout: 8000 }).catch(() => {});
    check(/נייר הדפסה/.test(await p.textContent('#ex-list')), 'expense saved and listed');
    check(/₪180 ?הוצאות החודש/.test(await k()) && /₪6,220 ?רווח החודש/.test(await k()), 'expenses + profit: ' + await k());
    await p.waitForTimeout(500);
    check(await p.evaluate(() => { const c = Chart.getChart(document.getElementById('booksChart')); const m = new Date().getMonth(); return c && c.data.datasets[0].data[m] === 6400 && c.data.datasets[1].data[m] === 180; }), 'chart: income / expenses / profit by month');
    const [dl2] = await Promise.all([p.waitForEvent('download'), p.click('#bk-csv')]);
    check(/הוצאה.*נייר הדפסה.*180/.test(fs.readFileSync(await dl2.path(), 'utf8')), 'CSV export');
    await axe(p, 'income & expenses');
    await p.screenshot({ path: S + '/q/books.png', fullPage: true });
    await p.click('#ex-list .ex-del');
    await p.waitForFunction(() => !document.querySelector('#ex-list tbody tr'), null, { timeout: 8000 }).catch(() => {});
    check(await p.locator('#ex-list tbody tr').count() === 0, 'expense deleted');
    // another Google account cannot read the expenses
    const r = await fetch(EMU.replace('/documents/', '/documents:runQuery'), { method: 'POST' });
    check(r.status === 403 || r.status === 400 || r.status === 401, 'no access without login (' + r.status + ')');
  } else {
    await p.waitForTimeout(1200);
    check(/אין הרשאה|צריך להוסיף הרשאה/.test(await p.textContent('#ex-msg') + await p.textContent('#ex-list')), 'clear message until the rule is published');
    check(/₪6,400 ?הכנסות החודש/.test(await k()), 'income still works');
  }
  await p.reload(); await p.waitForTimeout(1500);  if (await p.isVisible('#signInBtn')) await p.click('#signInBtn'); await p.waitForSelector('#tbody tr td.name', { timeout: 20000, state: 'attached' });
  check(await p.isVisible('#tab-books') && await p.isHidden('#tab-quotes'), 'reload keeps the tab (#books)');
  for (const w of [320, 768, 1280]) { await p.setViewportSize({ width: w, height: 800 });
    for (const t of ['quotes', 'cal', 'books']) { await p.click(`.tabs button[data-tab=${t}]`); await p.waitForTimeout(300);
      check(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `no sideways scroll: ${t} @${w}px`); } }
  await p.setViewportSize({ width: 390, height: 844 }); await p.click('.tabs button[data-tab=cal]'); await p.waitForTimeout(400);
  await p.screenshot({ path: S + '/q/cal.png', fullPage: true });
  check(!errors.length, 'no page errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
  await b.close();
  console.log(failures ? `\n${failures} FAILED` : '\nALL CHECKS PASSED');
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error('CRASH', e.message); process.exit(2); });

async function axe(p, label){
  await p.addScriptTag({ content: AXE });
  const r = await p.evaluate(async () => (await axe.run(document, { runOnly: ['wcag2a', 'wcag2aa'] })).violations.filter(v => v.impact === 'serious' || v.impact === 'critical').map(v => v.id + ': ' + v.nodes.slice(0, 2).map(n => n.target.join(' ')).join(' | ')));
  check(!r.length, 'axe: ' + label + (r.length ? '\n      ' + r.join('\n      ') : ''));
}
