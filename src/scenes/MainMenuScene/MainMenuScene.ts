import Phaser from 'phaser';

import { Heroes, HeroScheme } from '@/data/Heroes';
import { Squires, SquireScheme } from '@/data/Squires';

import { COLORTOKEN } from '@/ui/styles/ColorTokens';
import { TYPETOKEN } from '@/ui/styles/TypeTokens';

import { Background } from '@/ui/components/Background';
import { Button } from '@/ui/components/Button';
import { SelectorPanel } from '@/ui/components/SelectorPanel';
import { SelectableEntity } from '@/ui/components/SelectorCard';
import { Tooltip } from '@/ui/components/Tooltip';

import { viewBounds } from '@/utils/UtilsLayout';
import { SceneNavigator } from '@/services/SceneNavigator';
import { DEFAULT_HERO_ID, DEFAULT_SQUIRE_ID, MAIN_MENU_LAYOUT } from '@/scenes/MainMenuScene/MainMenuConfig';

import AudioManager from '@/services/AudioManager';


interface ButtonConfig {
    readonly id: string;
    readonly text: string;
    readonly onClick: () => void;
}

export class MainMenuScene extends Phaser.Scene {
    private heroPanel?: SelectorPanel<SelectableEntity>;;
    private squirePanel?: SelectorPanel<SelectableEntity>;;
    private background!: Background;
    private readonly buttons = new Map<string, Button>();
    private sceneNavigator: SceneNavigator = new SceneNavigator(this);

    public selectedHero: string = DEFAULT_HERO_ID;
    public selectedSquire: string = DEFAULT_SQUIRE_ID;

    private readonly buttonConfig: readonly ButtonConfig[] = [
        { id: 'btn-continue-run', text: 'Продолжить', onClick: () => this.sceneNavigator.continueRun() },
        { id: 'btn-new-run', text: 'Новый забег', onClick: () => this.sceneNavigator.startRun(this.selectedHero, this.selectedSquire), },
        { id: 'btn-settings', text: 'Настройки', onClick: () => console.log('Настройки') },
        { id: 'btn-progress', text: 'Прогресс', onClick: () => console.log('Прогресс') },
    ] as const;

    private tooltip: Tooltip | null = null;

    private audio!: AudioManager;

    constructor() {
        super({ key: 'MainMenuScene' });
    }


    public create(): void {
        this.audio = this.plugins.get('AudioManager') as AudioManager;
        this.tooltip = new Tooltip(this);
        this.bindEvents();
        this.renderScene();
    }
    
    private bindEvents(): void {
        this.scale.on('resize', this.handleResize);
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this);
        this.input.once(Phaser.Input.Events.POINTER_DOWN, () => {
            this.audio.setMusicVolume(.25);
            this.audio.playMusic('main-menu');
        });
    }

    private destroy(): void {
        this.scale.off('resize', this.handleResize);
        this.buttons.clear();
        this.heroPanel = undefined;
        this.squirePanel = undefined;
    }

    private renderScene(): void {
        this.background = new Background(this);
        this.renderTitle();
        this.renderPanels();
        this.renderButtons();
    }

    private renderTitle(): void {
        const { x, y } = MAIN_MENU_LAYOUT.title;

        this.add.text(x, y, 'Armory Intendant', {
            ...TYPETOKEN.Primary.Display,
            color: COLORTOKEN.Foreground.Secondary,
        });
    }

    private renderButtons(): void {
        this.buttonConfig.forEach((config) => {
            const button = new Button(this, config.text, config.onClick);
            this.buttons.set(config.id, button);
        });

        this.layoutButtons();
    }

    private layoutButtons(): void {
        const view = viewBounds(this);
        const { paddingX, paddingY, gap } = MAIN_MENU_LAYOUT.buttonsPanel;

        let offsetX = 0;

        this.buttons.forEach((button) => {
            const x = view.left + paddingX + offsetX + button.width / 2;
            const y = view.bottom - paddingY - button.height / 2;

            button.setPosition(x, y);
            offsetX += button.width + gap;
        });
    }

    private renderPanels(): void {
        this.heroPanel = new SelectorPanel(
            this,
            {
                title: 'Герои',
                list: Object.values(Heroes),
                selectedId: DEFAULT_HERO_ID,
                attachTooltip: (target, entity) => this.attachEntityTooltip(target, entity),
            },
            MAIN_MENU_LAYOUT.heroesPanel,
            { onSelect: (id) => this.selectHero(id as string) },
        );

        this.squirePanel = new SelectorPanel(
            this,
            {
                title: 'Оруженосцы',
                list: Object.values(Squires),
                selectedId: DEFAULT_SQUIRE_ID,
                attachTooltip: (target, entity) => this.attachEntityTooltip(target, entity),
            },
            MAIN_MENU_LAYOUT.squiresPanel,
            { onSelect: (id) => this.selectSquire(id as string) },
        );
    }

    private selectHero(id: string): void {
        this.selectedHero = id;
        this.heroPanel?.setSelected(id);
    }

    private selectSquire(id: string): void {
        this.selectedSquire = id;
        this.squirePanel?.setSelected(id);
    }

    private attachEntityTooltip(target: Phaser.GameObjects.GameObject, entity: HeroScheme | SquireScheme): void {
        if (entity.locked) {
            this.tooltip?.show(target, entity.name, '', entity, { width: 286 });
            return;
        }
        this.tooltip?.show(target, entity.name, '', entity, { width: 390 });
    }

    private readonly handleResize = (): void => {
        this.background?.updateBackground();
        this.layoutButtons();
    };
}