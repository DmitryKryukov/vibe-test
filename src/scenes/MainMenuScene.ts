import Phaser from 'phaser';

import { Heroes } from '@/data/Heroes';
import { Squires } from '@/data/Squires';

import { COLORTOKEN } from '@/ui/styles/ColorTokens';
import { TYPETOKEN } from '@/ui/styles/TypeTokens';

import { Background } from '@/ui/components/Background';
import { Button } from '@/ui/components/Button';
import { SelectorPanel } from '@/ui/components/SelectorPanel';
import { SelectableEntity } from '@/ui/components/SelectorCard';

import { viewBounds } from '@/utils/UtilsLayout';


interface ButtonConfig {
    readonly id: string;
    readonly text: string;
    readonly onClick: () => void;
}

export class MainMenuScene extends Phaser.Scene {

    private static readonly LAYOUT = {
        title: { x: 16, y: 8 },
        buttonsPanel: {
            paddingX: 20,
            paddingY: 20,
            gap: 8,
        },
        heroesPanel: {
            x: 16,
            y: 200,
        },
        squiresPanel: {
            x: 500,
            y: 200
        }
    } as const;

    private static readonly BUTTON_CONFIGS: readonly ButtonConfig[] = [
        { id: 'btn-continue-run', text: 'Продолжить', onClick: () => console.log('Новый забег') },
        { id: 'btn-new-run', text: 'Новый забег', onClick: () => console.log('Новый забег') },
        { id: 'btn-settings', text: 'Настройки', onClick: () => console.log('Настройки') },
        { id: 'btn-progress', text: 'Прогресс', onClick: () => console.log('Прогресс') },
    ] as const;

    private heroPanel?: SelectorPanel<SelectableEntity>;;
    private squirePanel?: SelectorPanel<SelectableEntity>;;
    private background!: Background;
    private readonly buttons = new Map<string, Button>();


    constructor() {
        super({ key: 'MainMenuScene' });
    }

    public create(): void {
        this.bindEvents();
        this.renderScene();
    }

    private bindEvents(): void {
        this.scale.on('resize', this.handleResize);
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this);
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
        const { x, y } = MainMenuScene.LAYOUT.title;

        this.add.text(x, y, 'Armory Intendant', {
            ...TYPETOKEN.Primary.Display,
            color: COLORTOKEN.Foreground.Secondary,
        });
    }

    private renderButtons(): void {
        MainMenuScene.BUTTON_CONFIGS.forEach((config) => {
            const button = new Button(this, config.text, config.onClick);
            this.buttons.set(config.id, button);
        });

        this.layoutButtons();
    }

    private layoutButtons(): void {
        const view = viewBounds(this);
        const { paddingX, paddingY, gap } = MainMenuScene.LAYOUT.buttonsPanel;

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
            { title: 'Герои', list: Object.values(Heroes), selectedId: "galahad-hero" },
            MainMenuScene.LAYOUT.heroesPanel,
            { onSelect: (id) => this.selectHero(id as string) },
        );
        this.squirePanel = new SelectorPanel(
            this,
            { title: 'Оруженосцы', list: Object.values(Squires), selectedId: "robert-squire" },
            MainMenuScene.LAYOUT.squiresPanel,
            { onSelect: (id) => this.selectSquire(id as string) },
        );
    }


    private selectHero(id: string): void {
        //this.store.selectHero(id);
        this.heroPanel?.setSelected(id);
    }
    private selectSquire(id: string): void {
        // this.store.selectSquire(id);
        this.squirePanel?.setSelected(id);
    }
    /*
        this.heroPanel = new SelectorPanel(this, {
          attachTooltip: (target, entity) => this.attachEntityTooltip(target, entity),
        });
    
        this.squirePanel = new SelectorPanel(this, {
          attachTooltip: (target, entity) => this.attachEntityTooltip(target, entity),
        });
    */


    private readonly handleResize = (): void => {
        this.background?.updateBackground();
        this.layoutButtons();
    };
}
/*

import { SceneNavigator } from '../services/SceneNavigator';
import { GameState } from '../state/GameState';
import { MainMenuStore } from '../stores/MainMenuStore';
import { IconButton } from '../ui/components/IconButton';


const MENU_LAYOUT = {
  title: {
    x: 16,
    y: 8,
  },

  panels: {
    hero: {
      x: 20,
      y: 250,
    },

    squire: {
      x: 720,
      y: 250,
    },
  },

  buttons: {
    bottomOffset: 31,

    content: {
      topOffset: 20,
      rightOffset: 20,
      size: 20,
    },
  },
} as const;

export class MainMenuScene extends Phaser.Scene {
  private readonly store = new MainMenuStore();
  private navigator!: SceneNavigator;
  private ui!: UIManager;

  private background!: Phaser.GameObjects.Graphics;
  private title?: Phaser.GameObjects.Text;

  private heroPanel?: SelectorPanel<SelectableEntity>;
  private squirePanel?: SelectorPanel<SelectableEntity>;
  private menuButtons = new Map<string, MenuButton>();
  private contentButton?: IconButton;

  constructor() {
    super('MainMenuScene');
  }

  public create(): void {
    this.navigator = new SceneNavigator(this);
  }


  private showModalResetProgress(): void {
    // Reset confirmation UI is still pending the shared modal/button refactor.
  }

  private attachEntityTooltip(target: Phaser.GameObjects.GameObject, entity: SelectableEntity): void {
    this.ui.tooltip(target, entity.name, `${entity.title}\n${entity.perks.join('\n')}`);
  }

  private cleanup(): void {
    this.scale.off('resize', this.handleResize);
    this.menuButtons.clear();
    this.contentButton = undefined;
    this.heroPanel = undefined;
    this.squirePanel = undefined;
    this.title = undefined;
  }
}
*/