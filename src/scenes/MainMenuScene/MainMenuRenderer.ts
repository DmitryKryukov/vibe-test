

import { Heroes } from '@/data/Heroes';
import { Squires } from '@/data/Squires';

import { Background } from '@/partials/ui/components/Background';
import { Button } from '@/partials/ui/components/Button';
import { SelectableEntity } from '@/partials/ui/components/SelectorCard';
import { SelectorPanel } from '@/partials/ui/components/SelectorPanel';
import { Tooltip } from '@/partials/ui/components/Tooltip';

import { viewBounds } from '@/utils/UtilsLayout';

import { DEFAULT_HERO_ID, DEFAULT_SQUIRE_ID, MAIN_MENU_LAYOUT } from './MainMenuConfig';
import { MainMenuScene } from './MainMenuScene';
import { TYPETOKEN } from '@/styles/TypeTokens';
import { COLORTOKEN } from '@/styles/ColorTokens';


interface ButtonConfig {
    readonly text: string;
    readonly onClick: () => void;
}

export class MainMenuRenderer {
    private readonly scene: MainMenuScene;
    private tooltip!: Tooltip;
    private heroPanel!: SelectorPanel<SelectableEntity>;
    private squirePanel!: SelectorPanel<SelectableEntity>;
    private readonly buttons: Button[] = [];

    constructor(scene: MainMenuScene) {
        this.scene = scene;
    }

    public render(): void {
        new Background(this.scene);
        this.tooltip = new Tooltip(this.scene);

        this.renderTitle();
        this.renderPanels();
        this.renderButtons();
    }

    public destroy(): void {
        this.buttons.length = 0;
    }

    public selectedHero(id: string): void {
        this.heroPanel.setSelected(id);
    }

    public selectedSquire(id: string): void {
        this.squirePanel.setSelected(id);
    }

    private renderTitle(): void {
        const { x, y } = MAIN_MENU_LAYOUT.title;

        this.scene.add.text(x, y, 'Armory Intendant', {
            ...TYPETOKEN.Primary.Display,
            color: COLORTOKEN.Foreground.Secondary.Hex,
        });
    }

    private renderButtons(): void {
        const buttonConfig: ButtonConfig[] = [
            { text: 'Продолжить', onClick: () => this.scene.navigator.continueRun() },
            {
                text: 'Новый забег',
                //onClick: () => this.navigator.startRun(this.scene.selectedHero, this.scene.selectedSquire),
                onClick: () => this.scene.navigator.startRun(this.scene.selectedHero, this.scene.selectedSquire),
            },
            { text: 'Настройки', onClick: () => console.log('Настройки') },
            { text: 'Прогресс', onClick: () => console.log('Прогресс') },
        ];

        buttonConfig.forEach((config) => {
            this.buttons.push(new Button(this.scene, config.text, config.onClick));
        });

        this.layoutButtons();
    }

    private layoutButtons(): void {
        const view = viewBounds(this.scene);
        const { paddingX, paddingY, gap } = MAIN_MENU_LAYOUT.buttonsPanel;

        let offsetX = 0;

        for (const button of this.buttons) {
            button.setPosition(
                view.left + paddingX + offsetX + button.width / 2,
                view.bottom - paddingY - button.height / 2,
            );

            offsetX += button.width + gap;
        }
    }

    private renderPanels(): void {
        this.heroPanel = new SelectorPanel(
            this.scene,
            {
                title: 'Герои',
                list: Object.values(Heroes),
                selectedId: DEFAULT_HERO_ID,
                attachTooltip: (target, entity) => this.showTooltip(target, entity),
            },
            MAIN_MENU_LAYOUT.heroesPanel,
            {
                onSelect: (id) => this.scene.selectHero(id as string),
            },
        );

        this.squirePanel = new SelectorPanel(
            this.scene,
            {
                title: 'Оруженосцы',
                list: Object.values(Squires),
                selectedId: DEFAULT_SQUIRE_ID,
                attachTooltip: (target, entity) => this.showTooltip(target, entity),
            },
            MAIN_MENU_LAYOUT.squiresPanel,
            {
                onSelect: (id) => this.scene.selectSquire(id as string),
            },
        );
    }

    private showTooltip(target: Phaser.GameObjects.GameObject, entity: HeroScheme | SquireScheme): void {
        this.tooltip.show(target, entity.name, '', entity, {
            width: entity.locked ? 286 : 390,
        });
    }
}