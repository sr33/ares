import { networkRequests } from './NetworkRequests';
import * as utils from './utils.js';
import { AxiosPromise, AxiosError } from 'axios';

export default class Profile {
    private userName: string = '..loading';
    private comments: Comment[] = [];
    private modhash: string = '';
    private currentComment: any = {
        action: '..loading',
        comment: ''
    }; // current comment being worked on
    
    public async overwriteAndDelComments() {
        await this.fetchComments();
        if (this.comments && this.comments.length > 0) {
            for (let comment of this.comments) {
                this.currentComment = {
                    action: "Editing Comment...",
                    comment
                };
                await this.overWriteComment(comment);
                if (!comment.isEdited) {
                    break;
                }
                this.currentComment.action = "Deleting Comment..."
                await this.deleteComment(comment);

                if (!comment.isDeleted) {
                    break;
                }
                // wait two seconds to respect reddit api rules.
                // todo: count x-remaining headers to automate this better
                this.currentComment.action = "Performing checks..."
                await utils.resolveAfter2Seconds();
            }
            this.setup();
        }
        else {
            this.currentComment.action = "All comments overwritten & deleted. Feedback -> r/NukeRedditHistory";
            alert(`No more comments found. Nuke Reddit History tried it's best to overwrite and delete comments.\nFor feedback or error resolution, please start a thread on /r/NukeRedditHistory`);
        }
    }

    public async setup() {
        const r = await networkRequests.getUserDetails();
        this.userName = r.data.name;
        this.modhash = r.data.modhash;
        this.overwriteAndDelComments();
    }
    
    public async fetchComments() {
        this.comments = [];
        const r = await networkRequests.getComments(this.userName);
        for (let rc of r.data.children) {
            const c = new Comment(rc);
            this.comments.push(c);
        }

    }

    private async overWriteComment(comment: Comment): Promise<any> {
        try {
            const response = await comment.editComment(this.modhash, this.userName);
            comment.isEdited = response.data.success;
            return response;
        } catch (error) {
            if (error.response) {
                /*
                 * The request was made and the server responded with a
                 * status code that falls out of the range of 2xx
                 */
                console.log(error.response.data);
                console.log(error.response.status);
                console.log(error.response.headers);
            } else if (error.request) {
                console.log(error.request);
            } else {
                console.log('An Improper Request was sent to reddit. Please post this on /r/NukeRedditHistory for more help', error.message);
            }
            console.log(error);
        }
    }

    private async deleteComment(comment: Comment): Promise<any> {
        try {
            const response = await comment.deleteComment(this.modhash);
            comment.isDeleted = true; // reddit doesn't respond with success flag on delete.
            return response;
        } catch (error) {
            if (error.response) {
                /*
                 * The request was made and the server responded with a
                 * status code that falls out of the range of 2xx
                 */
                console.log(error.response.data);
                console.log(error.response.status);
                console.log(error.response.headers);
            } else if (error.request) {
                console.log(error.request);
            } else {
                console.log('An Improper Request was sent to reddit. Please post this on /r/NukeRedditHistory for more help', error.message);
            }
            console.log(error);
        }
    }

}

class Comment {
    private redditThing: any;
    private id: string;
    private thing_id: string;
    private body: string;
    private subreddit: string;
    public editedText: string = utils.generateRandomPhrase();
    public isEdited: boolean = false;
    public isDeleted: boolean = false;

    constructor (redditThing: any) {
        this.redditThing = redditThing;
        this.thing_id = redditThing.data.name;
        this.id = redditThing.data.id;
        this.body = redditThing.data.body;
        this.subreddit = redditThing.data.subreddit;
    }

    public editComment(uh: string, username: string): AxiosPromise {
        const payload = {
            thing_id: this.thing_id,
            text: this.editedText,
            id: `#form-${this.thing_id}`,
            r: this.subreddit,
            uh,
            renderstyle: 'html',
        };
        return networkRequests.editComment(payload, uh);
    }

    public deleteComment(uh: string) {
        const payload = {
            id: this.thing_id,
            executed: 'deleted',
            uh,
            renderstyle: 'html'
        };
        return networkRequests.deleteComment(payload, uh);
    }

}
