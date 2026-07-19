const spriteModules = import.meta.glob(
    [
        '@assets/sprites/heroes/*.png',
        '@assets/sprites/squires/*.png', 
        '@assets/sprites/enemies/*.png',
        '@assets/sprites/ability/*.png',
        '@assets/sprites/backgrounds/*.png',
        '@assets/sprites/ui/inventory/*.png',
        '@assets/sprites/ui/icons/*.png',
    ], 
    { eager: true, query: '?url', import: 'default' }
) as Record<string, string>;


const fileStem = (path: string) => path.split('/').pop()?.replace(/\.png$/, '') ?? path;

export const ImageAssets: Record<string, string> = {};

Object.entries(spriteModules).forEach(([path, url]) => {
  ImageAssets[fileStem(path)] = url;
});