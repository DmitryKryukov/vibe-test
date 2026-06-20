import Phaser from 'phaser';

export interface TweenProgressConfig {
    duration: number;
    ease?: string;
    onUpdate: (progress: number) => void;
    onComplete?: () => void;
}

export function createProgressTween(
    scene: Phaser.Scene,
    config: TweenProgressConfig
): Phaser.Tweens.Tween {
    const tweenData = { progress: 0 };

    return scene.tweens.add({
        targets: tweenData,
        progress: 1,
        duration: config.duration,
        ease: config.ease ?? 'Linear',
        onUpdate: () => {
            config.onUpdate(tweenData.progress);
        },
        onComplete: config.onComplete,
    });
}

export function stopTweenSafely(tween?: Phaser.Tweens.Tween): void {
    tween?.stop();
}