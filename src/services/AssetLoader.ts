import Phaser from 'phaser';

export class AssetLoader {
    public static loadImages(
        loader: Phaser.Loader.LoaderPlugin,
        assets: Record<string, string>
    ): void {
        Object.entries(assets).forEach(([key, url]) => {
            loader.image(key, url);
        });
    }

    public static loadAudio(
        loader: Phaser.Loader.LoaderPlugin,
        assets: Record<string, string>
    ): void {
        Object.entries(assets).forEach(([key, url]) => {
            loader.audio(key, url);
        });
    }
}