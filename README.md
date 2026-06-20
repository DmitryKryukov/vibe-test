# Armory Intendant

## Запуск
```bash
npm install
npm run dev
```
После запуска Vite откроет локальный адрес вида `http://localhost:5173`.

## Структура проекта
- `src/config/ScebesConfig.ts` — cписок сцен.
- `src/config/GameConfig.ts` — конфигурация Phaser.
- `src/ui/components/*` — здесь лежат UI-компоненты для использования в Phaser.

## Токены
В проекте используются токены для отображения пользовательского интерфейса. Все компоненты должны их использовать.
- `src/ui/ColorTokens` — цветовые токены.
- `src/ui/TypeTokens` — типографические токены.
- `src/ui/FontTokens` — шрифтовые токены.
- `src/ui/MetricTokens` — размерные токены.


## Сцены
В начале класса каждой сцены есть конфиг с базовыми настройками UI сцены.
- `src/scenes/BootScene.ts` — экран загрузки.
- `src/scenes/MainMenuScene.ts` — главное меню.