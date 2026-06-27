export function interpolateNumber(
    from: number,
    to: number,
    progress: number
): number {
    return from + (to - from) * progress;
}

export function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}