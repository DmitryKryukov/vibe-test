import { Background as BackgroundComponent } from '../partials/ui/components/Background';
import { LoadingBar as LoadingBarComponent } from '../partials/ui/components/LoadingBar';
import { Button as ButtonComponent} from '@/partials/ui/components/Button';
import { SelectorPanel as SelectorPanelComponent} from '@/partials/ui/components/SelectorPanel';
import { SelectableEntity as SelectableEntityComponent } from '@/partials/ui/components/SelectorCard';

export namespace UI {
    export type Background = BackgroundComponent;
    export type LoadingBar = LoadingBarComponent;
    export type Button = ButtonComponent;
    export type SelectableEntity = SelectableEntityComponent;
    export type SelectorPanel<SelectableEntity> = SelectorPanelComponent<SelectableEntityComponent>;
}