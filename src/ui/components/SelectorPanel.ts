import Phaser from 'phaser';

import { SelectorCard, SelectableEntity } from './SelectorCard';

import { TYPETOKEN } from '../styles/TypeTokens';
import { HeroScheme } from '@/data/Heroes';
import { SquireScheme } from '@/data/Squires';

export interface SelectorPanelLayoutScheme {
    x: number;
    y: number;
}


export interface SelectorPanelDataScheme<T extends SelectableEntity> {
    title: string;
    list: T[];
    selectedId: string;
    // attachTooltip?: (target: Phaser.GameObjects.GameObject, entity: T) => void;
}

export interface SelectorPanelInteractScheme<T extends SelectableEntity> {
    onSelect: (id: T['id']) => void;
}

// export const SelectorPabelLayout = {
//   gap: 4,
//   titleOffsetY: -40,
// } as const;


export class SelectorPanel<T extends SelectableEntity> extends Phaser.GameObjects.Container {
    public scene: Phaser.Scene;
    private dataList: SelectorPanelDataScheme<HeroScheme | SquireScheme>;
    private layout!: SelectorPanelLayoutScheme;
    private interaction!: SelectorPanelInteractScheme<T>;

    private GO: {
        title: Phaser.GameObjects.Text | null;
        background: Phaser.GameObjects.Shape | null;
        cards: Map<string, SelectorCard<T>>;
    } = { title: null, background: null, cards: new Map<string, SelectorCard<T>>};

    constructor(scene: Phaser.Scene, data: SelectorPanelDataScheme<HeroScheme | SquireScheme>, layout?: SelectorPanelLayoutScheme, interaction?: SelectorPanelInteractScheme<T>) {
        super(scene, layout?.x, layout?.y);
        this.scene = scene;
        this.dataList = data;
        if (layout) {
            this.layout = { ...layout };
        }
        if (interaction) {
            this.interaction = interaction;
        }
        this.setDepth(100);
        this.setPosition(this.layout.x, this.layout.y);
        scene.add.existing(this);
        this.render();
    }

    private render(): void {
        this.renderTitle();
        this.renderCards();
    }

    private renderTitle(): void {
        this.GO.title = new Phaser.GameObjects.Text(
            this.scene,
            0,
            0,
            this.dataList.title,
            {
                ...TYPETOKEN.Tertiary.Lead,
            }
        ).setOrigin(0).setLetterSpacing(1);

        this.add(this.GO.title);
    }

    private renderCards(): void {
        const newArray = this.dataList.list.map(item => ({
            ...item,
            selectedId: this.dataList.selectedId
        }));


        Object.values(newArray).forEach((entity, index) => {
            const card = new SelectorCard(
                this.scene, 
                entity, 
                entity.id === entity.selectedId,
                () => {this.interaction.onSelect(entity.id)}
            )
                this.GO.cards?.set(entity.id, card);
            
                this.add(card)
        })
    }

    public setSelected(id: string): void {
        console.log( this.GO.cards )
        this.GO.cards?.forEach((card, cardID)=> {
            card.setSelected(cardID === id);
        })
    }
}
//config.items.forEach((item, index) => {
//  const card = new SelectorCard(scene, 0, index * (SelectorCardLayout.height + SelectorPabelLayout.gap), {
//    attachTooltip: config.attachTooltip,
//  });
