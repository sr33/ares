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

    public get stats() {
        return {
            username: this.userName,
            commentsFetched: this.comments.length,
            commentsDeleted: 0,
        }
    }

    public async overwriteAndDelComments() {
        await this.fetchComments();
        if (this.comments && this.comments.length > 0) {
            for (let comment of this.comments) {
                this.currentComment = {
                    action: "Editing Comment..",
                    comment
                };
                await comment.editComment(this.modhash, this.userName)
                .then(async r => {
                    console.log('edit response r is ', r)
                    comment.isEdited = r.data.success;
                    if (comment.isEdited) {
                        this.currentComment.action = "Deleting Comment..";
                        await comment.deleteComment(this.modhash)
                        .then((r: any) => {
                            console.log('delete response r is ', r)
                            comment.isDeleted = r.data.success;
                        })
                        .catch((e: AxiosError) => {
                            if (e.response.status === 403) {
                                // modhash expired
                                this.setup();
                            }
                        });
                    }
                })
                .catch((e: AxiosError) => {
                    if (e.response.status === 403) {
                        // modhash expired
                        this.setup();
                    }
                });
                // wait two seconds to respect reddit api rules.
                // todo: count x-remaining headers to automate this better
                this.currentComment.action = "Performing checks..."
                await utils.resolveAfter2Seconds();
            }
            this.setup();
        }
        else {
            this.currentComment.action = "All comments overwritten & deleted. If you think this was done in error, press feedback button below";
            alert(`No more comments found.`);
        }
    }

    public async setup() {
        const r = await networkRequests.getUserDetails();
        this.userName = r.data.name;
        this.modhash = r.data.modhash;
        this.overwriteAndDelComments();
    }
    
    public async fetchComments() {
        const r = await networkRequests.getComments(this.userName);
        for (let rc of r.data.children) {
            const c = new Comment(rc);
            this.comments.push(c);
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
