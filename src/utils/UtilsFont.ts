
import { FONTTOKEN } from '../partials/styles/FontTokens';

const STYLE_ELEMENT_ID = 'armory-intendant-fonts';
let fontLoadPromise: Promise<void> | undefined;

const hasFontFaceSupport = (): boolean => {
    return typeof window !== 'undefined' && 'fonts' in document;
};

const escapeCssString = (value: string): string =>
    value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

const buildFontFaceRule = (font: FONTTOKEN.FontDefinition): string => {
    const variationSettings = font.variationSettings
        ? `  font-variation-settings: ${font.variationSettings};`
        : undefined;

    return [
        '@font-face {',
        `  font-family: "${escapeCssString(font.family)}";`,
        `  src: url("${escapeCssString(font.source)}") format("${font.format}");`,
        `  font-style: ${font.style ?? 'normal'};`,
        `  font-weight: ${font.weight ?? '400'};`,
        '  font-display: block;',
        variationSettings,
        '}',
    ]
        .filter(Boolean)
        .join('\n');
};

const injectFontFaces = (): void => {
    if (document.getElementById(STYLE_ELEMENT_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ELEMENT_ID;
    style.textContent = FONTTOKEN.FontDefinitions.map(buildFontFaceRule).join('\n\n');

    document.head.appendChild(style);
};

export const loadGameFonts = async (): Promise<void> => {
    if (!hasFontFaceSupport()) return;
    if (fontLoadPromise) return fontLoadPromise;

    injectFontFaces();

    fontLoadPromise = Promise.all(
        FONTTOKEN.FontDefinitions.map((font) =>
            document.fonts.load(`${font.weight ?? '400'} 16px "${font.family}"`)
        )
    )
        .then(() => document.fonts.ready)
        .then(() => undefined)
        .catch((error) => {
            console.warn('Failed to load game fonts. Falling back to browser defaults.', error);
        });

    return fontLoadPromise;
};