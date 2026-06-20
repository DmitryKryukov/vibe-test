import Phaser from 'phaser';
import { COLORTOKEN } from "./ColorTokens"
import { METRICTOKEN } from "./MetricTokens"

export namespace TYPETOKEN {
    export const Primary: Record<string, Phaser.Types.GameObjects.Text.TextStyle> = {
        Display: {
            //fontFamily: PHASER_FONT_FAMILIES.xprm3,
            resolution: 2,
            fontSize: METRICTOKEN.Typography.Display.Size,
            color: COLORTOKEN.Foreground.Primary,
        }
    }   
}