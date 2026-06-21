import Phaser from 'phaser';

export interface SelectableEntity {
  id: string;
}

/*
import { SelectorCard, SelectorCardLayout } from './SelectorCard';
import { TextStyles } from '../styles/TextStyles';
import { SelectableEntity } from '../../entities/Types';

export interface SelectorPanelConfig<T extends SelectableEntity> {
   
  x: number;
  y: number;
  title: string;
  items: T[];
  selectedId: string;
  onSelect: (id: T['id']) => void;
  attachTooltip?: (target: Phaser.GameObjects.GameObject, entity: T) => void;
}

export const SelectorPabelLayout = {
  gap: 4,
  titleOffsetY: -40,
} as const;
*/
 
export class SelectorPanel<T extends SelectableEntity> extends Phaser.GameObjects.Container {
    /*
  private readonly cards = new Map<string, SelectorCard<T>>();

  constructor(scene: Phaser.Scene, config: SelectorPanelConfig<T>) {
    super(scene, config.x, config.y);

    this.add(scene.add.text(0, SelectorPabelLayout.titleOffsetY, config.title, TextStyles.subHeader()));

    config.items.forEach((item, index) => {
      const card = new SelectorCard(scene, 0, index * (SelectorCardLayout.height + SelectorPabelLayout.gap), {
        entity: item,
        active: item.id === config.selectedId,
        onSelect: () => config.onSelect(item.id),
        attachTooltip: config.attachTooltip,
      });

      this.cards.set(item.id, card);
      this.add(card);
    });

    scene.add.existing(this);
  }

  public setSelected(id: string): void {
    this.cards.forEach((card, cardId) => {
      card.setSelected(cardId === id);
    });
  }
    */
}
