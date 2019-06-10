import UI from './InjectableUI';
import Profile from './Profile';

const ui: UI = new UI();
ui.injectUI(onUIUpdate);

function onUIUpdate() {
    ui.profile.fetchComments();
    if (ui.profile.doCommentsExist) {
        // overwrite & delete comments
    }
}