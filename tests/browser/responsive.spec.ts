import { test, expect } from '@playwright/test';
import { seed, finishEnding } from './helpers';
const sizes = [[320,568],[390,844],[768,1024],[1024,768],[844,390],[1280,800]] as const;
for (const [width,height] of sizes) {
  for (const screen of ['start','speech','dialog','ending'] as const) {
    test(`${width}x${height} ${screen} fits without overlapping controls`, async ({page}) => {
      await page.setViewportSize({width,height}); if(screen==='ending') await page.clock.install(); await page.emulateMedia({reducedMotion:'reduce'});
      if (screen === 'start') await page.goto('/');
      else await seed(page,screen==='speech'?700:screen==='dialog'?500:1500,{playerName:'abcdefghijklmnopqrstuvwx'});
      if (screen==='start') await expect(page.getByLabel('Tu nombre')).toBeVisible();
      if (screen==='speech') await expect(page.locator('.speech-bubble')).toBeVisible();
      if (screen==='dialog') await expect(page.getByRole('dialog')).toBeVisible();
      if (screen==='ending') await finishEnding(page);
      await page.evaluate(() => document.fonts.ready);
      const selectors = screen==='start' ? ['h1','.start-form','.character-stage','.language-selector','.creator-credit'] : screen==='speech' ? ['h1','.speech-bubble','.character-stage','.hit-counter','.language-selector','.creator-credit'] : screen==='dialog' ? ['.unlock-dialog'] : ['.replay-button','.creator-credit'];
      const rectangles = await page.evaluate(selectors => selectors.map(selector => { const r=document.querySelector(selector)!.getBoundingClientRect();return {selector,x:r.x,y:r.y,right:r.right,bottom:r.bottom}; }),selectors);
      for (const r of rectangles) {
        expect(r.x,`${r.selector} left`).toBeGreaterThanOrEqual(0);
        expect(r.y,`${r.selector} top`).toBeGreaterThanOrEqual(0);
        expect(r.right,`${r.selector} right`).toBeLessThanOrEqual(width+1);
        expect(r.bottom,`${r.selector} bottom`).toBeLessThanOrEqual(height+1);
      }
      for (let i=0;i<rectangles.length;i++) for(let j=i+1;j<rectangles.length;j++) {
        const a=rectangles[i],b=rectangles[j];
        const intersects=a.x<b.right-1 && a.right>b.x+1 && a.y<b.bottom-1 && a.bottom>b.y+1;
        expect(intersects,`${a.selector} overlaps ${b.selector}`).toBe(false);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
      if(screen === 'speech') expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBeLessThanOrEqual(height+1);
      await page.screenshot({path:`test-results/responsive-${width}-${height}-${screen}-${test.info().project.name}.png`});
    });
  }
}
test('touch play survives rotation on a tablet', async ({browser}) => {
  const context=await browser.newContext({viewport:{width:768,height:1024},hasTouch:true,baseURL:'http://127.0.0.1:4173'});
  const page=await context.newPage(); await page.goto('/'); await page.getByLabel('Tu nombre').fill('Ame');
  await expect(page.getByRole('button',{name:'Click para empezar'})).toBeEnabled();await page.getByRole('button',{name:'Click para empezar'}).tap();
  for (const viewport of [{width:768,height:1024},{width:1024,height:768}]) {
    await page.setViewportSize(viewport);const r=await page.locator('.pchan').boundingBox();
    await page.touchscreen.tap(r!.x+r!.width*.45,r!.y+r!.height*.55);await page.waitForTimeout(180);
  }
  await expect(page.locator('.hit-counter')).toContainText('Has golpeado 2 veces');
  await expect(page.locator('.weapon-cursor')).toHaveCSS('visibility','hidden');
  await context.close();
});
