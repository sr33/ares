import UI from './InjectableUI';
import Profile from './Profile';

const ui: UI = new UI();
const profile: Profile = new Profile();
ui.injectUI(onUIUpdate);

function onUIUpdate() {
    ui.updateCurrentAction('fetching your comments');
    profile.fetchComments();
}