import { expect, type Page } from '@playwright/test';
export async function readClicks(page: Page) {
  if (await page.locator('.ending-screen').count()) return 1500;
  const text = await page.locator('.hit-counter').textContent();
  return Number(text?.match(/\d+/)?.[0]);
}
export async function advance(page: Page, amount: number) {
  let remaining=amount;
  while(remaining>0) {
    const current=await readClicks(page);
    if(current>=1500) return;
    const boundary=current<500?500:current<1000?1000:1500;
    const count=Math.min(remaining,boundary-current);
    await page.locator('.pchan').evaluate((el,count) => { for(let i=0;i<count;i++) (el as HTMLButtonElement).click(); },count);
    remaining-=count;
    if(remaining>0 && boundary<1500) await page.getByRole('dialog').getByRole('button').click();
  }
}
export async function seed(page: Page, clicks: number, extra: Record<string, unknown>={}) {
  await page.addInitScript(extra => {
    if(!localStorage.getItem('pchan-clicker:v1')) localStorage.setItem('pchan-clicker:v1',JSON.stringify({version:1, clicks:0,language:'es',playerName:'Ame',started:false,hammerConfirmed:false,knifeConfirmed:false,completed:false,...extra}));
  },extra);
  await page.goto('/');
  const start=page.locator('.start-button');await expect(start).toBeEnabled();await start.click();
  await advance(page,clicks);
  if(clicks<1500 && clicks!==500 && clicks!==1000) await expect(page.locator('.pchan')).toHaveAttribute('aria-disabled','false');
}
