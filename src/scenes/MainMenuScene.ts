import Phaser from 'phaser';

import { Heroes } from '@/data/heroes';
import { Squires } from '@/data/squires';

import { COLORTOKEN } from '@/ui/styles/ColorTokens';
import { TYPETOKEN } from '@/ui/styles/TypeTokens';

import { Background } from '@/ui/components/Background';
import { Button } from '@/ui/components/Button';
import { SelectorPanel, SelectableEntity } from '@/ui/components/SelectorPanel';

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
    } as const;

    private static readonly BUTTON_CONFIGS: readonly ButtonConfig[] = [
        { id: 'btn-new-run', text: 'Новый забег', onClick: () => console.log('Новый забег') },
        { id: 'btn-settings', text: 'Настройки', onClick: () => console.log('Настройки') },
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
        console.log(Heroes);
        console.log(Squires);
        Object.values(Heroes).forEach( (hero) => {
            this.add.text(15,500, hero.name, TYPETOKEN.Primary.Display);
            
        })

        Object.values(Squires).forEach( (squire) => {
            this.add.text(550,500, squire.name, TYPETOKEN.Primary.Display);
        })
    }
/*
        Object.values(Heroes)

        Object.values(Heroes).forEach((hero) => {
            this.add.text(25, 50, hero.name, {
                ...TYPETOKEN.Primary.Display,
                color: COLORTOKEN.Foreground.Secondary,
            }
    })



        /*
            this.heroPanel = new SelectorPanel(this, {
              x: MENU_LAYOUT.panels.hero.x,
              y: MENU_LAYOUT.panels.hero.y,
              title: 'Герой',
              items: Object.values(HEROES),
              selectedId: this.store.selectedHero,
              onSelect: (id) => this.selectHero(id as HeroId),
              attachTooltip: (target, entity) => this.attachEntityTooltip(target, entity),
            });
        
            this.squirePanel = new SelectorPanel(this, {
              x: MENU_LAYOUT.panels.squire.x,
              y: MENU_LAYOUT.panels.squire.y,
              title: 'Оруженосец',
              items: Object.values(SQUIRES),
              selectedId: this.store.selectedSquire,
              onSelect: (id) => this.selectSquire(id as SquireId),
              attachTooltip: (target, entity) => this.attachEntityTooltip(target, entity),
            });
        */

    
    private readonly handleResize = (): void => {
        this.background?.updateBackground();
        this.layoutButtons();
    };
}
/*

import { HeroId, SquireId, SelectableEntity } from '../entities/Types';
import { SceneNavigator } from '../services/SceneNavigator';
import { GameState } from '../state/GameState';
import { MainMenuStore } from '../stores/MainMenuStore';
import { IconButton } from '../ui/components/IconButton';
import { MenuButton, MenuButtonConfig } from '../ui/components/MenuButton';
import { SelectorPanel } from '../ui/components/SelectorPanel';
import { TextStyles } from '../ui/styles/TextStyles';
import { UIManager } from '../ui/UIManager';
import { UI_ICONS } from '../assets/IconMap';

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

  private readonly handleResize = (): void => {
    this.updateBackground();
    this.layoutButtons();
  };

  constructor() {
    super('MainMenuScene');
  }

  public create(): void {
    this.navigator = new SceneNavigator(this);
    this.ui = new UIManager(this);

    this.renderPipeline();
    this.sceneInit();
  }

  private renderPipeline(): void {
    this.renderBackground();
    this.renderTitle();
    this.renderPanels();
    this.renderButtons();
  } 


  private renderPanels(): void {
    this.heroPanel = new SelectorPanel(this, {
      x: MENU_LAYOUT.panels.hero.x,
      y: MENU_LAYOUT.panels.hero.y,
      title: 'Герой',
      items: Object.values(HEROES),
      selectedId: this.store.selectedHero,
      onSelect: (id) => this.selectHero(id as HeroId),
      attachTooltip: (target, entity) => this.attachEntityTooltip(target, entity),
    });

    this.squirePanel = new SelectorPanel(this, {
      x: MENU_LAYOUT.panels.squire.x,
      y: MENU_LAYOUT.panels.squire.y,
      title: 'Оруженосец',
      items: Object.values(SQUIRES),
      selectedId: this.store.selectedSquire,
      onSelect: (id) => this.selectSquire(id as SquireId),
      attachTooltip: (target, entity) => this.attachEntityTooltip(target, entity),
    });
  }

  private selectHero(id: HeroId): void {
    this.store.selectHero(id);
    this.heroPanel?.setSelected(id);
  }

  private selectSquire(id: SquireId): void {
    this.store.selectSquire(id);
    this.squirePanel?.setSelected(id);
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