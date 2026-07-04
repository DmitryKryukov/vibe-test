import Phaser from 'phaser';
import { viewBounds } from '@/utils/UtilsLayout';
import { anyToColor } from '@/utils/UtilsColor';
import { TYPETOKEN } from '../styles/TypeTokens';
import { COLORTOKEN } from '../styles/ColorTokens';

export interface TooltipScheme {
    width: number;
    height: number;
    minHeight: number;
    maxHeight: number;
    paddingTop: number;
    paddingRight: number;
    paddingBottom: number;
    paddingLeft: number;
    gap: number;
}

export class Tooltip extends Phaser.GameObjects.Container {
    scene: Phaser.Scene;

    private tooltipContainer: Phaser.GameObjects.Container | null = null;
    private tooltipStyle: TooltipScheme = {
        width: 390,
        height: 118,
        minHeight: 53,
        maxHeight: 560,
        paddingTop: 10,
        paddingRight: 20,
        paddingBottom: 12,
        paddingLeft: 14,
        gap: 4,
    }

    constructor(scene: Phaser.Scene) {
        super(scene, 0, 0);
        this.setDepth(3000);
        this.scene = scene;
    }

    public show(target: Phaser.GameObjects.GameObject, title: string, text: string, entity: any, tooltipStyle?: any): void {
    const style = { ...this.tooltipStyle, ...tooltipStyle };

    target.on('pointerover', (pointer: Phaser.Input.Pointer) => {
        this.renderTooltip(title, text, entity, style);  // передаём стиль
        if (this.tooltipContainer) {
            this.placeTooltip(
                this.tooltipContainer,
                pointer.worldX,
                pointer.worldY,
                style.width,
                this.tooltipStyle.height
            );
        }
    });

    target.on('pointerout', () => {
        this.tooltipContainer?.destroy();
        this.tooltipContainer = null;
    });

    target.on('pointermove', (pointer: Phaser.Input.Pointer) => {
        if (this.tooltipContainer) {
            this.placeTooltip(
                this.tooltipContainer,
                pointer.worldX,
                pointer.worldY,
                style.width,
                this.tooltipStyle.height
            );
        }
    });
}

    private renderTooltip(titleText: string, bodyText: string, entity: any, style: TooltipScheme): void {
        let tooltipConfig: {
            title: Phaser.GameObjects.Text | null,
            body: Phaser.GameObjects.Text | null,
            class: Phaser.GameObjects.Text | null,
            lore: Phaser.GameObjects.Text | null,
            perkName: Phaser.GameObjects.Text[] | null
            perkDescription: Phaser.GameObjects.Text[] | null
            text: Phaser.GameObjects.Text | null
        } = {
            title: null,
            body: null,
            class: null,
            lore: null,
            perkName: null,
            perkDescription: null,
            text: null
        };
        let lastElementY = 0;

        this.tooltipContainer?.destroy();
        this.tooltipContainer = this.scene.add
            .container(0, 0)
            .setDepth(3000);

        tooltipConfig.title = this.scene.add.text(
            this.tooltipStyle.paddingLeft,
            this.tooltipStyle.paddingTop,
            titleText,
            {
                ...TYPETOKEN.Tertiary.Lead,
                color: COLORTOKEN.Foreground.Secondary,
                wordWrap: { width: this.tooltipStyle.width - this.tooltipStyle.paddingLeft - this.tooltipStyle.paddingRight },
            }
        );

        lastElementY = tooltipConfig.title.height;
        this.tooltipContainer.add(tooltipConfig.title);

        if (entity.class) {
            tooltipConfig.class = this.scene.add.text(
                this.tooltipStyle.paddingLeft,
                this.tooltipStyle.paddingTop + lastElementY + this.tooltipStyle.gap,
                entity.class,
                {
                    ...TYPETOKEN.Secondary.Caption,
                    color: COLORTOKEN.Foreground.Tertiary,
                    wordWrap: { width: this.tooltipStyle.width - this.tooltipStyle.paddingLeft - this.tooltipStyle.paddingRight },
                },
            );
            this.tooltipContainer.add(tooltipConfig.class);
            lastElementY = lastElementY + tooltipConfig.class.height + this.tooltipStyle.gap;
        }

        if (entity.lore) {
            tooltipConfig.lore = this.scene.add.text(
                this.tooltipStyle.paddingLeft,
                this.tooltipStyle.paddingTop + lastElementY + this.tooltipStyle.gap,
                "«" + entity.lore + "»",
                {
                    ...TYPETOKEN.Secondary.Caption,
                    color: COLORTOKEN.Foreground.Quanternary,
                    wordWrap: { width: this.tooltipStyle.width - this.tooltipStyle.paddingLeft - this.tooltipStyle.paddingRight },
                },
            );
            this.tooltipContainer.add(tooltipConfig.lore);
            lastElementY = lastElementY + tooltipConfig.lore.height + this.tooltipStyle.gap;
        }

        if (entity.perks && entity.perks.length > 0) {
            const perkMarginY = 8;
            entity.perks.forEach((perk: any, index: number) => {
                tooltipConfig.perkName = tooltipConfig.perkName || [];
                tooltipConfig.perkDescription = tooltipConfig.perkDescription || [];
                const perkName = this.scene.add.text(
                    this.tooltipStyle.paddingLeft,
                    this.tooltipStyle.paddingTop + lastElementY + this.tooltipStyle.gap + perkMarginY,
                    perk.name,
                    {
                        ...TYPETOKEN.Secondary.Body,
                        color: COLORTOKEN.Foreground.Secondary,
                        wordWrap: { width: this.tooltipStyle.width - this.tooltipStyle.paddingLeft - this.tooltipStyle.paddingRight },
                    },
                );
                tooltipConfig.perkName.push(perkName);
                this.tooltipContainer?.add(perkName);
                lastElementY = lastElementY + tooltipConfig.perkName[index].height + this.tooltipStyle.gap;
                const perkDescription = this.scene.add.text(
                    this.tooltipStyle.paddingLeft,
                    this.tooltipStyle.paddingTop + lastElementY + this.tooltipStyle.gap + perkMarginY,
                    perk.description,
                    {
                        ...TYPETOKEN.Secondary.Caption,
                        color: COLORTOKEN.Foreground.Tertiary,
                        wordWrap: { width: this.tooltipStyle.width - this.tooltipStyle.paddingLeft - this.tooltipStyle.paddingRight },
                    },
                );
                tooltipConfig.perkDescription.push(perkDescription);
                this.tooltipContainer?.add(perkDescription);
                lastElementY = lastElementY + tooltipConfig.perkDescription[index].height + this.tooltipStyle.gap + perkMarginY;
            });
            lastElementY = lastElementY + perkMarginY;
        }

        if (bodyText) {
            tooltipConfig.text = this.scene.add.text(
                this.tooltipStyle.paddingLeft,
                this.tooltipStyle.paddingTop + lastElementY + this.tooltipStyle.gap,
                bodyText,
                {
                    ...TYPETOKEN.Secondary.Caption,
                    color: '#e8dfc5',
                    wordWrap: { width: this.tooltipStyle.width - this.tooltipStyle.paddingLeft - this.tooltipStyle.paddingRight },
                }
            );

            this.tooltipContainer.add(tooltipConfig.text);
            lastElementY = lastElementY + tooltipConfig.text.height + this.tooltipStyle.gap;
        }
        this.tooltipStyle.height = lastElementY + this.tooltipStyle.paddingTop + this.tooltipStyle.paddingBottom;

        let background = this.renderBackground(
            style.width,
            this.tooltipStyle.height
        );

        this.tooltipContainer.addAt(background, 0);
    }

    private renderBackground(width: number, height: number): Phaser.GameObjects.Graphics {
        const background = this.scene.add.graphics();
        background.fillGradientStyle(
            anyToColor(COLORTOKEN.Background.Secondary),
            anyToColor(COLORTOKEN.Background.Zeroth),
            anyToColor(COLORTOKEN.Background.Secondary),
            1
        );
        background.fillRoundedRect(0, 0, width, height, 0);
        background.lineStyle(4, anyToColor(COLORTOKEN.Background.Primary));
        background.strokeRoundedRect(0, 0, width, height, 8);
        return background;
    }

    private placeTooltip(tooltipContainer: Phaser.GameObjects.Container, pointerX: number, pointerY: number, width: number, height: number): void {
        const layoutConfig = {
            pointerXOffstet: 18,
            pointerYOffstet: 18,
            leftPadding: 12,
            rightPadding: 12,
            topPadding: 12,
            bottomPadding: 22,
        }
        const view = viewBounds(this.scene);
        const x = Phaser.Math.Clamp(pointerX + layoutConfig.pointerXOffstet, view.left + layoutConfig.leftPadding, view.right - width - layoutConfig.rightPadding);
        const y = Phaser.Math.Clamp(pointerY + layoutConfig.pointerYOffstet, view.top + layoutConfig.topPadding, view.bottom - height - layoutConfig.bottomPadding);
        tooltipContainer.setPosition(x, y);
    }
}