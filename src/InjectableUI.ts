import axios, {AxiosError} from 'axios';
import Vue from 'vue';

export default class UI {
    readonly templateAbsoluteUrl = chrome.runtime.getURL('template.html');
    public stats = {
        comments: 0,
        posts: 0,
    }

    async injectUI() {
        const html = await axios
        .get(this.templateAbsoluteUrl)
        .then((r) => {
            return r.data;
        })
        .catch((error: AxiosError) => {
            console.error(`error -> ${error}`);
        });

        document.getElementsByTagName('body')[0].innerHTML = html;

        // new Vue({
        //     el: '#app',
        //     data: {
        //         stats: this.stats
        //     }
        // })
    }

}