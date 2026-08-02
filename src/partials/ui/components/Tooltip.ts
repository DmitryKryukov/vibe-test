import { COLORTOKEN } from '@/styles/ColorTokens';
import { TYPETOKEN } from '@/styles/TypeTokens';
import { viewBounds } from '@/utils/UtilsLayout';

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
    private activeTarget: Phaser.GameObjects.GameObject | null = null;
    private activeTooltipHeight = 0;
    private readonly tooltipStyle: TooltipScheme = {
        width: 390,
        height: 118,
        minHeight: 53,
        maxHeight: 560,
        paddingTop: 12,
        paddingRight: 20,
        paddingBottom: 14,
        paddingLeft: 14,
        gap: 6,
    }

    constructor(scene: Phaser.Scene) {
        super(scene, 0, 0);
        this.setDepth(3000);
        this.scene = scene;
    }

    public show(
        target: Phaser.GameObjects.GameObject,
        title: string,
        text: string,
        entity?: any,
        tooltipStyle?: Partial<TooltipScheme>,
    ): () => void {
        const style = { ...this.tooltipStyle, ...tooltipStyle };

        const handlePointerOver = (pointer: Phaser.Input.Pointer): void => {
            this.activeTarget = target;
            this.activeTooltipHeight = this.renderTooltip(title, text, entity, style);
            if (this.tooltipContainer) {
                this.placeTooltip(
                    this.tooltipContainer,
                    pointer.worldX,
                    pointer.worldY,
                    style.width,
                    this.activeTooltipHeight,
                );
            }
        };

        const handlePointerOut = (): void => {
            if (this.activeTarget === target) {
                this.hide();
            }
        };

        const handlePointerMove = (pointer: Phaser.Input.Pointer): void => {
            if (this.tooltipContainer && this.activeTarget === target) {
                this.placeTooltip(
                    this.tooltipContainer,
                    pointer.worldX,
                    pointer.worldY,
                    style.width,
                    this.activeTooltipHeight,
                );
            }
        };

        target.on('pointerover', handlePointerOver);
        target.on('pointerout', handlePointerOut);
        target.on('pointermove', handlePointerMove);

        return () => {
            target.off('pointerover', handlePointerOver);
            target.off('pointerout', handlePointerOut);
            target.off('pointermove', handlePointerMove);

            if (this.activeTarget === target) {
                this.hide();
            }
        };
    }

    public hide(): void {
        this.tooltipContainer?.destroy(true);
        this.tooltipContainer = null;
        this.activeTarget = null;
        this.activeTooltipHeight = 0;
    }

    private renderTooltip(titleText: string, bodyText: string, entity: any, style: TooltipScheme): number {
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
            style.paddingLeft,
            style.paddingTop,
            titleText,
            {
                ...TYPETOKEN.Tertiary.Lead,
                color: COLORTOKEN.Foreground.Secondary.Hex,
                wordWrap: { width: style.width - style.paddingLeft - style.paddingRight },
            }
        );

        lastElementY = tooltipConfig.title.height;
        this.tooltipContainer.add(tooltipConfig.title);

        if (entity?.class) {
            tooltipConfig.class = this.scene.add.text(
                style.paddingLeft,
                style.paddingTop + lastElementY + style.gap,
                entity.class,
                {
                    ...TYPETOKEN.Secondary.Caption,
                    color: COLORTOKEN.Foreground.Tertiary.Hex,
                    wordWrap: { width: style.width - style.paddingLeft - style.paddingRight },
                },
            );
            this.tooltipContainer.add(tooltipConfig.class);
            lastElementY = lastElementY + tooltipConfig.class.height + style.gap;
        }

        if (entity?.lore) {
            tooltipConfig.lore = this.scene.add.text(
                style.paddingLeft,
                style.paddingTop + lastElementY + style.gap,
                "«" + entity.lore + "»",
                {
                    ...TYPETOKEN.Secondary.Caption,
                    color: COLORTOKEN.Foreground.Quanternary.Hex,
                    wordWrap: { width: style.width - style.paddingLeft - style.paddingRight },
                },
            );
            this.tooltipContainer.add(tooltipConfig.lore);
            lastElementY = lastElementY + tooltipConfig.lore.height + style.gap;
        }

        if (entity?.perks && entity.perks.length > 0) {
            const perkMarginY = 8;
            entity.perks.forEach((perk: any, index: number) => {
                tooltipConfig.perkName = tooltipConfig.perkName || [];
                tooltipConfig.perkDescription = tooltipConfig.perkDescription || [];
                const perkName = this.scene.add.text(
                    style.paddingLeft,
                    style.paddingTop + lastElementY + style.gap + perkMarginY,
                    perk.name,
                    {
                        ...TYPETOKEN.Secondary.Body,
                        color: COLORTOKEN.Foreground.Secondary.Hex,
                        wordWrap: { width: style.width - style.paddingLeft - style.paddingRight },
                    },
                );
                tooltipConfig.perkName.push(perkName);
                this.tooltipContainer?.add(perkName);
                lastElementY = lastElementY + tooltipConfig.perkName[index].height + style.gap;
                const perkDescription = this.scene.add.text(
                    style.paddingLeft,
                    style.paddingTop + lastElementY + style.gap + perkMarginY,
                    perk.description,
                    {
                        ...TYPETOKEN.Secondary.Caption,
                        color: COLORTOKEN.Foreground.Tertiary.Hex,
                        wordWrap: { width: style.width - style.paddingLeft - style.paddingRight },
                    },
                );
                tooltipConfig.perkDescription.push(perkDescription);
                this.tooltipContainer?.add(perkDescription);
                lastElementY = lastElementY + tooltipConfig.perkDescription[index].height + style.gap + perkMarginY;
            });
            lastElementY = lastElementY + perkMarginY;
        }

        if (bodyText) {
            tooltipConfig.text = this.scene.add.text(
                style.paddingLeft,
                style.paddingTop + lastElementY + style.gap,
                bodyText,
                {
                    ...TYPETOKEN.Secondary.Caption,
                    color: '#e8dfc5',
                    wordWrap: { width: style.width - style.paddingLeft - style.paddingRight },
                }
            );

            this.tooltipContainer.add(tooltipConfig.text);
            lastElementY = lastElementY + tooltipConfig.text.height + style.gap;
        }
        const height = Phaser.Math.Clamp(
            lastElementY + style.paddingTop + style.paddingBottom,
            style.minHeight,
            style.maxHeight,
        );

        const background = this.renderBackground(style.width, height);

        this.tooltipContainer.addAt(background, 0);
        return height;
    }

    private renderBackground(width: number, height: number): Phaser.GameObjects.Graphics {
        const background = this.scene.add.graphics();
        background.fillGradientStyle(
            COLORTOKEN.Background.Secondary.Numeric,
            COLORTOKEN.Background.Zeroth.Numeric,
            COLORTOKEN.Background.Secondary.Numeric,
            1
        );
        background.fillRoundedRect(0, 0, width, height, 0);
        background.lineStyle(4, COLORTOKEN.Background.Primary.Numeric);
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

    destroy(fromScene?: boolean): void {
        this.hide();
        super.destroy(fromScene);
    }
}
