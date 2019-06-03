import axios, {AxiosError} from 'axios';

export default class UI {
    readonly templateAbsoluteUrl = chrome.runtime.getURL('template.html');
    readonly body = document.getElementsByTagName('body')[0];

    public stats = {
        comments: 0,
        posts: 0,
    }

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
        cb();
    }

    public updateCurrentAction(action: string) {
        const el = document.getElementById('currentAction');
        el.innerHTML = action;
    }

}