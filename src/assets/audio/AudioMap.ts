const audioModules = import.meta.glob(
  [
    '@assets/audio/**/*.mp3',
    '@assets/audio/**/*.m4a',
    '@assets/audio/**/*.ogg',
    '@assets/audio/**/*.wav',
  ],
  { eager: true, query: '?url', import: 'default' }
) as Record<string, string>;

// Если имена файлов гарантированно уникальны по всей папке audio
const fileStem = (path: string) =>
  path.split('/').pop()?.replace(/\.[^.]+$/, '') ?? path;

export const AudioAssets: Record<string, string> = {};
Object.entries(audioModules).forEach(([path, url]) => {
  AudioAssets[fileStem(path)] = url;
});