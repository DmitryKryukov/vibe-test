import { COLORTOKEN } from "@/partials/styles/ColorTokens";
import { TYPETOKEN } from "@/partials/styles/TypeTokens";
import { Background } from "@/partials/ui/components/Background";
import { viewBounds } from "@/utils/UtilsLayout";
import { BOOT_LAYOUT } from "./BootConfig";
import { LoadingBar } from "@/partials/ui/components/LoadingBar";

export class BootRenderer {
    constructor(private scene: Phaser.Scene) { }

    public render(onFinished: () => void, duration: number): void {
        const view = viewBounds(this.scene);

        new Background(this.scene);

        this.scene.add.text(view.centerX, view.centerY + BOOT_LAYOUT.titleOffsetY, 'Armory Intendant', {
            ...TYPETOKEN.Primary.Display,
            color: COLORTOKEN.Foreground.Secondary,
        }).setOrigin(0.5);

        const loadingBar = new LoadingBar(this.scene, {
            x: view.centerX,
            y: view.centerY + BOOT_LAYOUT.loadingBarOffsetY,
        }, BOOT_LAYOUT.loadingBarStyle);

        loadingBar.animateFill(1, onFinished, duration);
    }
}