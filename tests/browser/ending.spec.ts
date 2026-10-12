import { test, expect } from '@playwright/test';
import { seed } from './helpers';
import { ENDING_CONFIG as C } from '../../src/game/constants';
async function begin(page: import('@playwright/test').Page, reduced=false) {
  await page.clock.install();await page.emulateMedia({reducedMotion:reduced?'reduce':'no-preference'});
  await seed(page,1499);await page.clock.pauseAt(new Date(Date.now()+1000));
  await page.locator('.pchan').evaluate(el => (el as HTMLButtonElement).click());
}
test('exact black pauses, typewriter, manual continue, floating image and replay', async ({page}) => {
  await begin(page);
  const screen=page.locator('.ending-screen');
  await expect(screen).toHaveAttribute('data-stage','intro');
  await expect(page.getByRole('button')).toHaveCount(0);await expect(page.locator('.creator-credit')).toHaveCount(0);
  await expect(screen).toHaveText('');
  await page.clock.runFor(C.INTRO_MS-1);await expect(screen).toHaveAttribute('data-stage','intro');
  await page.clock.runFor(1);await expect(screen).toHaveAttribute('data-stage','message');
  await page.clock.runFor(C.CHARACTER_MS*5);await expect(page.locator('.ending-message-scroll p')).toContainText('¿Está');
  await expect(page.getByRole('button',{name:'Continuar'})).toHaveCount(0);
  const text=await page.locator('.ending-message-scroll p').getAttribute('aria-label');
  expect(text).toContain('¿Estás feliz, Ame?');expect(text).not.toContain('{name}');
  await page.clock.runFor(text!.length*C.CHARACTER_MS);
  await expect(page.locator('.ending-message-scroll p')).toHaveText(text!);
  await page.clock.runFor(60000);await expect(screen).toHaveAttribute('data-stage','message');
  await page.getByRole('button',{name:'Continuar',exact:true}).click();
  await expect(screen).toHaveAttribute('data-stage','blackout');await expect(screen).toHaveText('');
  await page.clock.runFor(C.BLACKOUT_MS-1);await expect(screen).toHaveAttribute('data-stage','blackout');
  await page.clock.runFor(1);await expect(screen).toHaveAttribute('data-stage','scare');
  await expect(page.locator('.ending-scare-image')).toHaveAttribute('src',/fase04_final.png/);
  await expect(page.locator('.ending-threat')).toHaveText('Volveré por ti...');
  await expect(page.locator('.ending-scare-image')).toHaveCSS('animation-name','ending-haunt');
  await page.screenshot({path:'test-results/ending-scare.png'});
  await page.clock.runFor(C.SCARE_MS);await expect(screen).toHaveAttribute('data-stage','outro');await expect(screen).toHaveText('');
  await page.clock.runFor(C.OUTRO_MS);await expect(page.getByRole('button',{name:'Jugar nuevamente'})).toBeVisible();
  await page.getByRole('button',{name:'Jugar nuevamente'}).click();await expect(page.getByLabel('Tu nombre')).toHaveValue('Ame');
});
for(const viewport of [{width:320,height:568},{width:768,height:1024},{width:844,height:390}]) {
  test(`message and scare fit ${viewport.width}x${viewport.height}`, async ({page}) => {
    await page.setViewportSize(viewport);await begin(page,true);await page.clock.runFor(C.INTRO_MS);
    await expect(page.getByRole('button',{name:'Continuar',exact:true})).toBeVisible();
    await expect(page.locator('.ending-message-scroll p')).toContainText('Ya no existo');
    const scroll=page.locator('.ending-message-scroll');await scroll.evaluate(el => {el.scrollTop=el.scrollHeight;});
    expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBeLessThanOrEqual(viewport.height+1);
    await page.screenshot({path:`test-results/ending-message-${viewport.width}.png`});
    await page.getByRole('button',{name:'Continuar',exact:true}).click();await page.clock.runFor(C.BLACKOUT_MS);
    await expect(page.locator('.ending-scare-image')).toHaveCSS('animation-name','none');
    const image=await page.locator('.ending-scare-image').boundingBox();const caption=await page.locator('.ending-threat').boundingBox();
    expect(image!.y+image!.height).toBeLessThanOrEqual(caption!.y+1);
    expect(caption!.y+caption!.height).toBeLessThanOrEqual(viewport.height);
    await page.screenshot({path:`test-results/ending-scare-${viewport.width}.png`});
  });
}
