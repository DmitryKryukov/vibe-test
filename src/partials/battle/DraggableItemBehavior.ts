export interface DraggableItemBehaviorConfig {
    dragDepth?: number;
    onDragStart?: (target: Phaser.GameObjects.Container) => void;
    onDrag?: (target: Phaser.GameObjects.Container, pointer: Phaser.Input.Pointer) => void;
    onDragEnd?: (target: Phaser.GameObjects.Container, pointer: Phaser.Input.Pointer) => void;
}

export class DraggableItemBehavior {
    private readonly scene: Phaser.Scene;
    private readonly target: Phaser.GameObjects.Container;
    private readonly config: DraggableItemBehaviorConfig;

    constructor(
        scene: Phaser.Scene,
        target: Phaser.GameObjects.Container,
        config: DraggableItemBehaviorConfig = {},
    ) {
        this.scene = scene;
        this.target = target;
        this.config = config;

        this.target.setInteractive({ draggable: true, useHandCursor: true });
        this.scene.input.setDraggable(this.target);
        this.target.on(Phaser.Input.Events.GAMEOBJECT_DRAG_START, this.handleDragStart);
        this.target.on(Phaser.Input.Events.GAMEOBJECT_DRAG, this.handleDrag);
        this.target.on(Phaser.Input.Events.GAMEOBJECT_DRAG_END, this.handleDragEnd);
    }

    public destroy(): void {
        this.target.off(Phaser.Input.Events.GAMEOBJECT_DRAG_START, this.handleDragStart);
        this.target.off(Phaser.Input.Events.GAMEOBJECT_DRAG, this.handleDrag);
        this.target.off(Phaser.Input.Events.GAMEOBJECT_DRAG_END, this.handleDragEnd);

        if (this.target.input) {
            this.scene.input.setDraggable(this.target, false);
            this.target.disableInteractive();
        }
    }

    private readonly handleDragStart = (
        pointer: Phaser.Input.Pointer,
        _dragX: number,
        _dragY: number,
    ): void => {
        if (this.config.dragDepth !== undefined) {
            this.target.setDepth(this.config.dragDepth);
        }
        this.config.onDragStart?.(this.target);
    };

    private readonly handleDrag = (
        pointer: Phaser.Input.Pointer,
        dragX: number,
        dragY: number,
    ): void => {
        this.target.setPosition(dragX, dragY);
        this.config.onDrag?.(this.target, pointer);
    };

    private readonly handleDragEnd = (pointer: Phaser.Input.Pointer): void => {
        this.config.onDragEnd?.(this.target, pointer);
    };
}
