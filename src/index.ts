import UI from './UI';
import Profile from './Profile';

const ui: UI = new UI();
ui.injectUI(onUiInject);

function onUiInject() {
    ui.profile.setup();
}
