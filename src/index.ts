import UI from './InjectableUI';
import Profile from './Profile';

const profile: Profile = new Profile();
const ui: UI = new UI(profile);
ui.injectUI(onUIUpdate);

function onUIUpdate() {
    profile.fetchComments();
    if (profile.doCommentsExist) {
        // overwrite & delete comments
    }
}