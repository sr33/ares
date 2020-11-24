import axios, { AxiosError } from 'axios';
import * as Vue from './static_resources/vue';
import Profile from './Profile';

export default class UI {
    readonly templateAbsoluteUrl = chrome.runtime.getURL('/static_resources/template.html');
    readonly body = document.getElementsByTagName('body')[0];
    public vueApp: any;
    public profile: Profile = new Profile();

    public async injectUI() {
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
        this.profile.setup();
    }

    private mountVueApp() {
        // @ts-ignore
        this.vueApp = new Vue({
            el: '#nrhApp',
            data: {
                profile: this.profile,
            },
            mounted: () => {
                console.log("--: Nuke Reddit History initiated :--");
            }
        });
    }
}