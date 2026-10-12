import { test, expect } from '@playwright/test';
import { seed, advance, readClicks, finishEnding } from './helpers';
async function keyboardHit(page: import('@playwright/test').Page) { await page.getByRole('button', {name:'Golpear a P-Chan'}).focus(); await page.keyboard.press('Enter'); }
test('start, translations, mouse hit, synchronized sprites and persistence', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Tu nombre').fill('Ame');
  await expect(page.getByRole('button', {name:'Click para empezar'})).toBeEnabled();
  await page.getByRole('button', {name:'EN', exact:true}).click();
  await page.getByRole('button', {name:'Click to start'}).click();
  const character = page.getByRole('button', {name:'Hit P-Chan'});
  const rect = await character.boundingBox();
  await character.click({position:{x:rect!.width*.45,y:rect!.height*.55}});
  await expect.poll(() => readClicks(page)).toBe(1);
  await expect(character.locator('img')).toHaveAttribute('src', /normal/);
  await page.reload(); await expect(page.getByRole('button',{name:'Click to start'})).toBeEnabled();
  await page.getByRole('button',{name:'Click to start'}).click();await expect(page.locator('.hit-counter')).toContainText('0 times');
  await page.screenshot({path:'test-results/game-desktop.png'});
});
for (const [start, end, weapon, phase] of [[499,500,'hammer',1],[549,550,null,2],[999,1000,'knife',2],[1049,1050,null,3]] as const) {
  test(`boundary ${end}`, async ({page}) => {
    await seed(page,start);
    await keyboardHit(page);
    if (weapon) {
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.keyboard.press('Enter'); await expect(page.getByRole('dialog')).toHaveCount(0);

    }
    await expect(page.locator('.pchan img')).toHaveAttribute('src', new RegExp(`fase0${phase}_`));
    await expect(page.locator('.weapon-cursor img')).toHaveAttribute('src', new RegExp(`/curors/${end >= 1000 ? 'knife' : 'hammer'}/`));
    expect(await readClicks(page)).toBe(end);
    await expect(page.locator('.hit-counter')).toContainText(`Has ${end >= 1000 ? 'acuchillado' : 'golpeado'} ${end} veces a P-Chan`);
  });
}
test('outside clicks and transparent margins do not count', async ({page}) => {
  await seed(page,0); await page.locator('h1').click();
  await page.locator('.pchan').click({position:{x:1,y:1}});
  expect(await readClicks(page)).toBe(0);
});
test('rapid hits stop exactly at pending dialog', async ({page}) => {
  await seed(page,498);
  await page.locator('.pchan').evaluate(el => { for(let i=0;i<20;i++) (el as HTMLButtonElement).click(); });
  await expect(page.getByRole('dialog')).toBeVisible();
  expect(await readClicks(page)).toBe(500);
});
test('completed ending survives reload and can be replayed', async ({page}) => {
  await page.clock.install(); await page.emulateMedia({reducedMotion:'reduce'}); await seed(page,1499);
  await keyboardHit(page);
  await expect(page.locator('.ending-screen')).toHaveCSS('background-color','rgb(0, 0, 0)');
  await expect(page.locator('.ending-screen')).toHaveAttribute('data-stage','intro');
  await expect(page.getByRole('button')).toHaveCount(0);
  await finishEnding(page);
  await page.reload(); await expect(page.locator('.ending-screen')).toHaveAttribute('data-stage','intro');
});
test('mobile fits and touch hits only once', async ({browser}) => {
  const context = await browser.newContext({viewport:{width:390,height:844}, hasTouch:true, baseURL:'http://127.0.0.1:4173'});
  const page = await context.newPage(); await seed(page,0);
  const rect = await page.locator('.pchan').boundingBox();
  await page.touchscreen.tap(rect!.x + rect!.width*.45, rect!.y + rect!.height*.55);
  expect(await readClicks(page)).toBe(1);
  await expect(page.locator('.weapon-cursor')).toHaveCSS('visibility','hidden');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  await page.screenshot({path:'test-results/game-mobile.png'}); await context.close();
});
for(const [clicks, phase] of [[0,1],[550,2],[1050,3]] as const) {
  test(`synchronized impact in phase ${phase}`, async ({page}) => {
    await seed(page,clicks); await page.clock.install();
    await page.clock.pauseAt(new Date(Date.now()+1000));
    await keyboardHit(page);
    await expect(page.locator('.pchan img')).toHaveAttribute('src', /ouch/);
    await expect(page.locator('.weapon-cursor img')).toHaveAttribute('src', /_02.png/);
    await page.clock.runFor(160);
    await expect(page.locator('.pchan img')).toHaveAttribute('src', /normal/);
    await expect(page.locator('.weapon-cursor img')).toHaveAttribute('src', /_01.png/);
  });
}
test('initial screen and Japanese rendering', async ({page}) => {
  await page.goto('/'); await page.getByLabel('Tu nombre').fill('Ame'); await expect(page.getByRole('button',{name:'Click para empezar'})).toBeEnabled();
  await page.screenshot({path:'test-results/start-desktop.png'});
  await page.getByRole('button',{name:'日本語',exact:true}).click();
  await expect(page.getByRole('heading')).toHaveText('ぴちゃんを叩いて！自業自得だから。');
  await page.screenshot({path:'test-results/start-japanese.png'});
});

test('requires a name before starting and saves it', async ({page}) => {
  await page.goto('/');
  await expect(page.getByRole('button',{name:'Click para empezar'})).toBeDisabled();
  await page.getByLabel('Tu nombre').fill('   ');
  await expect(page.getByRole('button',{name:'Click para empezar'})).toBeDisabled();
  await page.getByLabel('Tu nombre').fill('  Lucía  ');
  await expect(page.getByRole('button',{name:'Click para empezar'})).toBeEnabled();
  await page.getByRole('button',{name:'Click para empezar'}).click();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('pchan-clicker:v1')!).playerName)).toBe('Lucía');
});
test('speech appears at fifty, cycles, translates and expires', async ({page}) => {
  await seed(page,49); await page.clock.install(); await expect(page.locator('.speech-bubble')).toHaveCount(0);
  await keyboardHit(page);
  await expect(page.getByRole('status')).toHaveText('¿Por qué me golpeas, Ame?');
  await page.screenshot({path:'test-results/speech-desktop.png'});
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:'test-results/speech-mobile.png'});
  await page.getByRole('button',{name:'EN',exact:true}).click();
  await expect(page.getByRole('status')).toHaveText('Why are you hitting me, Ame?');
  await page.clock.runFor(14000);await expect(page.locator('.speech-bubble')).toBeVisible();
  await page.clock.runFor(1100);await expect(page.locator('.speech-bubble')).toHaveCount(0);
  await advance(page,750);
  await expect(page.getByRole('status')).toHaveText('Why are you hitting me, Ame?');
});
test('replay clears progression and keeps name and language', async ({page}) => {
  await page.clock.install();await page.emulateMedia({reducedMotion:'reduce'});await seed(page,1499);
  await keyboardHit(page);await finishEnding(page);await page.getByRole('button',{name:'Jugar nuevamente'}).click();
  await expect(page.getByLabel('Tu nombre')).toHaveValue('Ame');
  await page.getByRole('button',{name:'Click para empezar'}).click();
  await expect(page.locator('.hit-counter')).toContainText('Has golpeado 0 veces');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('pchan-clicker:v1')!).hammerConfirmed)).toBe(false);
  await expect(page.locator('.speech-bubble')).toHaveCount(0);
});

test('reload resets incomplete progress and unlocks but keeps the name', async ({page}) => {
  await seed(page,1100);await page.reload();
  await expect(page.getByLabel('Tu nombre')).toHaveValue('Ame');
  await page.getByRole('button',{name:'Click para empezar'}).click();
  await expect(page.locator('.hit-counter')).toContainText('Has golpeado 0 veces');
  await expect(page.locator('.weapon-cursor img')).toHaveAttribute('src',/curors\/hand\//);
  await expect(page.getByRole('dialog')).toHaveCount(0);
});
