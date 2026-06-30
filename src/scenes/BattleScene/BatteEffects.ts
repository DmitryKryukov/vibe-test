// BattleEffects.ts
import Phaser from 'phaser';
import { CombatSystem, CombatVisualEvent } from '@/services/CombatSystem';
import { BattleSceneRenderer } from './BattleSceneRenderer';
import { COLORTOKEN } from '@/ui/styles/ColorTokens';
import { anyToColor } from '@/utils/UtilsColor';
import { TYPETOKEN } from '@/ui/styles/TypeTokens';

export class BattleEffects {
  private scene: Phaser.Scene;
  private combatSystem: CombatSystem;
  private sceneRenderer: BattleSceneRenderer;

  constructor(scene: Phaser.Scene, combat: CombatSystem, renderer: BattleSceneRenderer) {
    this.scene = scene;
    this.combatSystem = combat;
    this.sceneRenderer = renderer;
  }

  public processVisualEvents(): void {
    const events = this.combatSystem.visualEvents.splice(0);
    let impactDelay = 0;

    events.forEach((event) => {
      if (event.type === 'windup') {
        alert();
        this.playWindupFlash(event.sourceUid);
      }

      if (event.type === 'attack') {
        this.playAttackWindup(event);
        impactDelay = 310;
      }

      if (event.type === 'damage') {
        this.scene.time.delayedCall(impactDelay, () => {
          this.renderFloatMessage(event.targetUid, `−${event.amount}`, COLORTOKEN.Accent.Red);
          this.playHitImpact(event.targetUid);
        });
      }

      if (event.type === 'heal') {
        this.scene.time.delayedCall(impactDelay, () => {
          //this.floatNumber(event.targetUid, `+${event.amount}`, '#5cff83');
        });
      }

      if (event.type === 'miss') {
        this.scene.time.delayedCall(impactDelay, () => {
          //this.floatNumber(event.targetUid, 'Промах', '#f2e7c6');
        });
      }
    });
  }

  private renderFloatMessage(targetId: string, text: string, color: string): void {
    const position = this.sceneRenderer.getCombatantPositions().get(targetId);
    if (!position) return;

    const label = this.scene.add.text(
      position.x + Phaser.Math.Between(-8, 8),
      position.y - 70 + Phaser.Math.Between(-32, 0),
      text,
      {
        ...TYPETOKEN.Tertiary.Lead,
        color: COLORTOKEN.Accent.Red,
        stroke: COLORTOKEN.Background.Zeroth,
        strokeThickness: 5,
      }
    ).setOrigin(0.5).setDepth(1200);

    this.scene.tweens.add({
      targets: label,
      y: label.y - 120,
      x: label.x + Phaser.Math.Between(18, 48),
      scale: 1.25,
      duration: 1000,
      ease: 'Quint.easeOut',
    });

    this.scene.tweens.add({
      targets: label,
      alpha: 0,
      delay: 500,
      duration: 500,
      ease: 'Quint.easeOut',
      onComplete: () => label.destroy()
    });
  }

  // ----- Вспышка перед атакой (windup) -----
  private playWindupFlash(sourceUid: string): void {
    /*
    const pos = this.renderer.getCombatantPositions().get(sourceUid);
    const objects = this.renderer.getBodyObjects().get(sourceUid);
    if (!pos || !objects?.length) return;

    const visual = objects.find((obj) => !(obj instanceof Phaser.GameObjects.Text));

    if (visual instanceof Phaser.GameObjects.Image) {
      // Создаём белую накладку поверх спрайта
      const overlay = this.scene.add.image(
        visual.x,
        visual.y,
        visual.texture.key,
        visual.frame.name
      )
        .setOrigin(visual.originX, visual.originY)
        .setDisplaySize(visual.displayWidth, visual.displayHeight)
        .setRotation(visual.rotation)
        .setFlip(visual.flipX, visual.flipY)
        .setTintFill(0xffffff)
        .setBlendMode(Phaser.BlendModes.NORMAL)
        .setAlpha(1)
        .setDepth(visual.depth + 120);
      this.scene.tweens.add({
        targets: overlay,
        alpha: 0,
        duration: 250,
        ease: 'Cubic.easeOut',
        onComplete: () => overlay.destroy(),
      });
    } else {
      // Если нет спрайта – рисуем силуэт из геометрии
      const silhouette = this.scene.add.container(pos.x, pos.y - 50).setDepth(130);
      const body = this.scene.add.rectangle(0, 28, 128, 172, 0xffffff, 1).setOrigin(0.5).setAngle(0);
      const head = this.scene.add.ellipse(0, -78, 98, 108, 0xffffff, 1);
      silhouette.add([body, head]);
      this.scene.tweens.add({
        targets: silhouette,
        alpha: 0,
        duration: 250,
        ease: 'Cubic.easeOut',
        onComplete: () => silhouette.destroy(),
      });
    }

    // Засветка самого объекта (если есть tint)
    objects.forEach((obj) => {
      if (obj instanceof Phaser.GameObjects.Text) return;
      const tintable = obj as Phaser.GameObjects.GameObject & {
        setTintFill?: (color: number) => void;
        setTint?: (color: number) => void;
        clearTint?: () => void;
      };
      if (tintable.setTintFill) tintable.setTintFill(0xffffff);
      else if (tintable.setTint) tintable.setTint(0xffffff);
      this.scene.time.delayedCall(250, () => tintable.clearTint?.());
    });

    // Большая белая вспышка
    const flash = this.scene.add.ellipse(pos.x, pos.y - 20, 210, 270, 0xffffff, 0.68).setDepth(125);
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 250,
      ease: 'Cubic.easeOut',
      onComplete: () => flash.destroy(),
    });
    */
  }

  // ----- Анимация движения атакующего (рывок вперёд) -----
  private playAttackWindup(event: Extract<CombatVisualEvent, { type: 'attack' }>): void {
    //this.playWindupFlash(event.sourceUid);
    this.playAttackMotion(event)
  }

  private playHitImpact(targetId: string): void {
    const position = this.sceneRenderer.getCombatantPositions().get(targetId);
    const gameObjects = this.sceneRenderer.getSpriteObjects().get(targetId);
    if (!position || !gameObjects?.length) return;


    const mainSprite = gameObjects[0] as Phaser.GameObjects.Sprite;

    const tintable = mainSprite as Phaser.GameObjects.GameObject & {
      setTint?: (color: number) => void;
      clearTint?: () => void;
    };

    tintable.setTint?.(anyToColor(COLORTOKEN.Accent.Red));
    this.scene.time.delayedCall(105, () => tintable.clearTint?.());

    this.scene.tweens.add({
      targets: mainSprite,
      x: '+=20',
      duration: 45,
      yoyo: true,
      repeat: 2,
      ease: 'Sine.easeInOut',
    });

    //this.scene.add.rectangle(mainSprite.x, mainSprite.y - mainSprite.displayHeight / 2, mainSprite.displayWidth, mainSprite.displayHeight, anyToColor(COLORTOKEN.Accent.Red))

    const flash = this.scene.add.circle(mainSprite.x, mainSprite.y - mainSprite.displayHeight / 2, 32, anyToColor(COLORTOKEN.Accent.Red), 1).setDepth(85);
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 2,
      duration: 180,
      onComplete: () => flash.destroy(),
    });

    const emitter = this.scene.add.particles(0, 0, '__WHITE', {
      lifespan: { min: 300, max: 1000 },
      speedX: { min: -140, max: 1000 },
      speedY: { min: -200, max: -1000 },
      scale: { start: 4, end: 0.2, ease: 'Cubic.easeOut' },
      alpha: { start: 1, end: 0 },
      color: [
        0x8f0f0a,
        0xb81d18,
        0x5c0603,
        0xa6120d
      ],
      gravityY: 3000,
      quantity: 32,
      emitZone: new Phaser.GameObjects.Particles.Zones.RandomZone(
        new Phaser.Geom.Circle(0, 0, 50) as Phaser.Types.GameObjects.Particles.RandomZoneSource
      )
    }).setDepth(200);

    emitter.explode(32, position.x, position.y - 64);
  }

  private playAttackMotion(event: Extract<CombatVisualEvent, { type: 'attack' }>): void {
  
    const sourcePosition = this.sceneRenderer.getCombatantPositions().get(event.sourceUid);
    const targetPosition = this.sceneRenderer.getCombatantPositions().get(event.targetUid);
    const objects = this.sceneRenderer.getSpriteObjects().get(event.sourceUid);
    
    if (!sourcePosition || !targetPosition || !objects?.length) return;

    const dx = Phaser.Math.Clamp((targetPosition.x - sourcePosition.x) * 0.08, -34, 34);
    const dy = Phaser.Math.Clamp((targetPosition.y - sourcePosition.y) * 0.05, -18, 18);

    this.scene.tweens.add({
      targets: objects,
      x: `+=${dx}`,
      y: `+=${dy}`,
      duration: 85,
      yoyo: true,
      ease: 'Sine.easeOut',
    });
  }

  /*
   
      
  
    // ----- Всплывающее число (урон, лечение, промах) -----
    private floatNumber(targetUid: string, text: string, color: string): void {
      const pos = this.renderer.getCombatantPositions().get(targetUid);
      if (!pos) return;
  
      const label = this.scene.add.text(
        pos.x + Phaser.Math.Between(-28, 28),
        pos.y - 70 + Phaser.Math.Between(-16, 16),
        text,
        {
          resolution: Math.min(window.devicePixelRatio || 1, 2),
          fontSize: '30px',
          color,
          stroke: '#000000',
          strokeThickness: 5,
          fontStyle: 'bold',
        }
      ).setOrigin(0.5).setDepth(1200);
  
      this.scene.tweens.add({
        targets: label,
        y: label.y - 62,
        x: label.x + Phaser.Math.Between(-18, 18),
        alpha: 0,
        scale: 1.25,
        duration: 720,
        ease: 'Cubic.easeOut',
        onComplete: () => label.destroy(),
      });
    }
  
    // ----- Эффект попадания (красная вспышка, тряска, частицы) -----
    
  
    // ----- Очистка (при уничтожении сцены) -----
    public destroy(): void {
      // Никаких долгоживущих объектов не создаём – все анимации сами себя удаляют.
    }
      */
}