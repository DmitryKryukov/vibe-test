import { Background as BackgroundComponent } from '../ui/components/Background';
import { LoadingBar as LoadingBarComponent } from '../ui/components/LoadingBar';
import { Button as ButtonComponent} from '@/ui/components/Button';
import { SelectorPanel as SelectorPanelComponent} from '@/ui/components/SelectorPanel';
import { SelectableEntity as SelectableEntityComponent } from '@/ui/components/SelectorCard';

export namespace UI {
    export type Background = BackgroundComponent;
    export type LoadingBar = LoadingBarComponent;
    export type Button = ButtonComponent;
    export type SelectableEntity = SelectableEntityComponent;
    export type SelectorPanel<SelectableEntity> = SelectorPanelComponent<SelectableEntityComponent>;
}