const base = `${import.meta.env.BASE_URL}sprites`;
export const sprites = {
  1: { normal: `${base}/pchan/fase_01/fase01_normal.png`, ouch: `${base}/pchan/fase_01/fase01_ouch.png`, idle: `${base}/curors/hand/hand_01.png`, hitting: `${base}/curors/hand/hand_02.png`, weapon: 'hand' },
  2: { normal: `${base}/pchan/fase_02/fase02_normal.png`, ouch: `${base}/pchan/fase_02/fase02_ouch.png`, idle: `${base}/curors/hammer/hammer_01.png`, hitting: `${base}/curors/hammer/hammer_02.png`, weapon: 'hammer' },
  3: { normal: `${base}/pchan/fase_03/fase03_normal.png`, ouch: `${base}/pchan/fase_03/fase03_ouch.png`, idle: `${base}/curors/knife/knife_01.png`, hitting: `${base}/curors/knife/knife_02.png`, weapon: 'knife' },
} as const;
export async function preloadSprites() {
  await Promise.all(Object.values(sprites).flatMap(s => [s.normal, s.ouch, s.idle, s.hitting]).map(src => new Promise<void>((resolve, reject) => {
    const img = new Image(); img.onload = () => resolve(); img.onerror = () => reject(new Error(`No se pudo cargar ${src}`)); img.src = src;
  })));
}
