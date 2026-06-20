import Phaser from 'phaser';
import { UI } from '@/config/UIConfig';
import { COLORTOKEN } from '@/ui/styles/ColorTokens';
import { TYPETOKEN } from '@/ui/styles/TypeTokens';

import { Background } from '@/ui/components/Background';
import { Button } from '@/ui/components/Button';

import { screenBounds, ScreenBounds } from '@/utils/UtilsLayout';

export class MainMenuScene extends Phaser.Scene {
    private MAIN_MENU_CONFIG = {
        layout: {
            title: {
                x: 16,
                y: 8,
            },
            mainButtonsPanel: {
                padding: {
                    x: 20,
                    y: 20,
                },
                gap: 8,
            }
        }

    } as const;

    private background!: UI.Background;

    constructor() {
        super({ key: 'MainMenuScene' });
    }

    public create(): void {
        this.initialize();
    }

    private initialize(): void {
        this.scale.off('resize', this.handleResize);
        this.scale.on('resize', this.handleResize);
        /*
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this);
        this.events.once(Phaser.Scenes.Events.DESTROY, this.cleanup, this);
        */
        this.renderScene();
    }

    private renderScene(): void {

        this.background = new Background(this);
        this.renderTitle();
        this.renderButtons();
    }

    private renderTitle(): void {
        this.add.text(this.MAIN_MENU_CONFIG.layout.title.x, this.MAIN_MENU_CONFIG.layout.title.y, 'Armory Intendant', {
            ...TYPETOKEN.Primary.Display,
            color: COLORTOKEN.Foreground.Secondary,
        })
    }

    private renderButtons(): void {
        const screen = screenBounds(this) as ScreenBounds;
        const buttonConfigs = [
            {
                text: 'Новый забег',
                onClick: () => { alert('Новый забег') },
            },
            {
                text: 'Настройки',
                onClick: () => { alert('Настройки') },
            },
        ];

        let nextButtonX: number = 0;

        buttonConfigs.forEach((config) => {
            const button = new Button(this, config.text, config.onClick);
            button.setPosition(screen.left + nextButtonX + this.MAIN_MENU_CONFIG.layout.mainButtonsPanel.padding.x + button.width / 2, screen.bottom - this.MAIN_MENU_CONFIG.layout.mainButtonsPanel.padding.y - button.height / 2);
            nextButtonX = button.width + this.MAIN_MENU_CONFIG.layout.mainButtonsPanel.gap;
        });



        /*
        
    
        buttonConfigs.forEach((config) => {
          const button = new MenuButton(this, config);
          this.menuButtons.set(config.id, button);
        });
    
      */
    }

    private readonly handleResize = (): void => {
        /*
    this.updateBackground();
    this.layoutButtons();
    */
    };

}
/*
import { HEROES } from '../data/heroes';
import { SQUIRES } from '../data/squires';
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

  private sceneInit(): void {
    this.scale.off('resize', this.handleResize);
    this.scale.on('resize', this.handleResize);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this);
    this.events.once(Phaser.Scenes.Events.DESTROY, this.cleanup, this);
  }

  private renderBackground(): void {
    this.background = this.add.graphics().setDepth(-100);
    this.updateBackground();
  }

  private updateBackground(): void {
    if (!this.background) return;

    const screen = screenBounds(this);
    this.background.clear();
    this.background.fillGradientStyle(0x070807, 0x10140f, 0x000000, 0x000000, 1);
    this.background.fillRect(screen.left, screen.top, screen.width, screen.height);
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

  private renderButtons(): void {
    this.renderMenuButtons();
    this.renderContentButton();
    this.layoutButtons();
  }

  private renderMenuButtons(): void {
    const buttonConfigs: MenuButtonConfig[] = [
      {
        id: 'btn-new-run',
        x: 114,
        y: 0,
        height: 62,
        label: 'Новый забег',
        onClick: () => this.navigator.startRun(this.store.selectedHero, this.store.selectedSquire),
        paddingX: 24,
        paddingY: 0,
        minWidth: 220,
      },
      ...(GameState.state.run?.active
        ? [{
          id: 'btn-continue-run',
          x: 336,
          y: 0,
          height: 62,
          label: 'Продолжить',
          onClick: () => this.navigator.continueRun(),
          paddingX: 24,
          paddingY: 0,
          minWidth: 220,
        }]
        : []),
      {
        id: 'btn-reset',
        x: 0,
        y: 0,
        height: 62,
        label: 'Сброс',
        onClick: () => this.showModalResetProgress(),
        paddingX: 24,
        paddingY: 0,
        minWidth: 160,
      },
    ];

    buttonConfigs.forEach((config) => {
      const button = new MenuButton(this, config);
      this.menuButtons.set(config.id, button);
    });
  }

  private renderContentButton(): void {
    this.contentButton = new IconButton(
      this,
      0,
      0,
      {
        idle: UI_ICONS.CONTENT.IDLE,
        hover: UI_ICONS.CONTENT.HOVER,
        press: UI_ICONS.CONTENT.PRESS,
      },
      MENU_LAYOUT.buttons.content.size,
      MENU_LAYOUT.buttons.content.size,
      () => this.navigator.openContentEditor()
    );
  }

  private layoutButtons(): void {
    const screen = screenBounds(this);
    const buttonY = screen.bottom - MENU_LAYOUT.buttons.bottomOffset;

    this.menuButtons.get('btn-new-run')?.setPosition(114, buttonY);
    this.menuButtons.get('btn-continue-run')?.setPosition(336, buttonY);
    this.menuButtons.get('btn-reset')?.setPosition(screen.right - 80, buttonY);
    this.contentButton?.setPosition(screen.right - MENU_LAYOUT.buttons.content.rightOffset, screen.top + MENU_LAYOUT.buttons.content.topOffset);
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