import Phaser from 'phaser';

export interface ViewBounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
}

export interface ScreenBounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
}

export const fitCameraToCanvas = (scene: Phaser.Scene): void => {
  scene.cameras.main.setZoom(1);
  scene.cameras.main.setScroll(0, 0);
};

export const viewBounds = (scene: Phaser.Scene): ViewBounds => {
  const width = Math.max(1, scene.scale.width);
  const height = Math.max(1, scene.scale.height);
  const left = 0;
  const top = 0;
  return {
    left,
    right: left + width,
    top,
    bottom: top + height,
    width,
    height,
    centerX: left + width / 2,
    centerY: top + height / 2
  };
};

export const screenBounds = (scene: Phaser.Scene): ScreenBounds => {
  const width = Math.max(1, scene.scale.width);
  const height = Math.max(1, scene.scale.height);
  return {
    left: 0,
    right: width,
    top: 0,
    bottom: height,
    width,
    height,
    centerX: width / 2,
    centerY: height / 2
  };
};

export const screenToWorld = (scene: Phaser.Scene, x: number, y: number): { x: number; y: number } => {
  return { x, y };
};

export const screenSpaceScale = (_scene: Phaser.Scene): number => 1;
