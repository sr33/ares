import axios, {AxiosError} from 'axios';
import * as Vue from './vue';
import Profile from './Profile';

export default class UI {
    readonly templateAbsoluteUrl = chrome.runtime.getURL('template.html');
    readonly body = document.getElementsByTagName('body')[0];
    public vueApp: Vue;
    public profile: Profile = new Profile();

    public async injectUI(cb: Function) {
        const html = await axios
        .get(this.templateAbsoluteUrl)
        .then((r) => {
            return r.data;
        })
        .catch((error: AxiosError) => {
            console.error(`error while trying to inject ui -> ${error}`);
        });
        this.body.className = ''; // remove existing styles
        this.body.innerHTML = html;
        this.mountVueApp();
        cb();
    }

    private mountVueApp() {
        this.vueApp = new Vue({
            el: '#nrhApp',
            data: {
                profile: this.profile,
            },
            mounted: () => {
                console.log("Nuke Reddit History Mounted");
            }
        });
    }
}