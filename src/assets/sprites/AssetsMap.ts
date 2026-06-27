
const spriteModules = import.meta.glob(
    [
        '@assets/sprites/heroes/*.png',
        '@assets/sprites/squires/*.png', 
        '@assets/sprites/backgrounds/*.png'
    ], 
    { eager: true, query: '?url', import: 'default' }
) as Record<string, string>;


const fileStem = (path: string) => path.split('/').pop()?.replace(/\.png$/, '') ?? path;

export const ImageAssets: Record<string, string> = {};

Object.entries(spriteModules).forEach(([path, url]) => {
  ImageAssets[fileStem(path)] = url;
});

/*
const backgroundModules = import.meta.glob('./generated/*-background.png', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const heroModules = import.meta.glob('./generated/heroes/*.png', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const enemyModules = import.meta.glob('./generated/enemies/*.png', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const itemModules = import.meta.glob('./generated/items/*.png', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const portraitModules = import.meta.glob('./generated/portraits/*.png', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const statusModules = import.meta.glob('./generated/statuses/*.png', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const factionModules = import.meta.glob('./fixed/enemies/fractions/*.png', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const inventorySlotModules = import.meta.glob('./fixed/ui/inventory/*.png', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const uiIconModules = import.meta.glob('./fixed/ui/icon/*.png', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;

const fileStem = (path: string) => path.split('/').pop()?.replace(/\.png$/, '') ?? path;
const inventorySlotAssetVersion = 'slot-icons-2026-06-15-2';

export const IMAGE_ASSETS: Record<string, string> = {};

Object.entries(backgroundModules).forEach(([path, url]) => {
  const stem = fileStem(path);
  if (stem === 'map-background') IMAGE_ASSETS['bg-map'] = url;
  if (stem === 'battle-background') IMAGE_ASSETS['bg-battle'] = url;
});

Object.entries(heroModules).forEach(([path, url]) => {
  IMAGE_ASSETS[`sprite-${fileStem(path)}`] = url;
});

Object.entries(enemyModules).forEach(([path, url]) => {
  IMAGE_ASSETS[`sprite-${fileStem(path)}`] = url;
});

Object.entries(itemModules).forEach(([path, url]) => {
  IMAGE_ASSETS[`icon-${fileStem(path)}`] = url;
});

Object.entries(portraitModules).forEach(([path, url]) => {
  IMAGE_ASSETS[fileStem(path)] = url;
});

Object.entries(statusModules).forEach(([path, url]) => {
  IMAGE_ASSETS[`icon-${fileStem(path)}`] = url;
});

Object.entries(factionModules).forEach(([path, url]) => {
  const stem = fileStem(path).replace(/^fraction-/, '').replace(/-icon$/, '');
  IMAGE_ASSETS[`icon-faction-${stem}`] = url;
});

Object.entries(inventorySlotModules).forEach(([path, url]) => {
  const stem = fileStem(path).replace(/^empty-inventory-/, '');
  IMAGE_ASSETS[`icon-empty-slot-${stem}`] = `${url}?v=${inventorySlotAssetVersion}`;
});

Object.entries(uiIconModules).forEach(([path, url]) => {
  const stem = fileStem(path).replace(/-/g, '_');
  IMAGE_ASSETS[`ui_icon_${stem}`] = url;
});
*/