import { networkRequests } from './NetworkRequests';
import * as utils from './utils.js';

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
        let num: number = 0;
        if (this.comments && this.comments.length > 0) {
            for (let comment of this.comments) {
                this.currentComment = {
                    action: "Editing Comment",
                    comment
                };
                const r = await networkRequests.getUserDetails();
                console.log(r.data.modhash);
                comment.editComment(r.data.modhash, this.userName);
                await utils.resolveAfter2Seconds();
                num++;
                if (num === 2) break;
            }
        }
        else {
            alert(`No more comments found.`);
        }
    }

    public async setup() {
        const r = await networkRequests.getUserDetails();
        this.userName = r.data.name;
        this.modhash = r.data.modhash;
        await this.fetchComments();
        this.overwriteAndDelComments()
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

    public editComment(uh: string, username: string) {
        console.log('editing comment', this);
        const r = networkRequests.editComment({
            thing_id: this.thing_id,
            text: this.editedText,
            id: `#form-${this.thing_id}`,
            r: this.subreddit,
            uh,
            renderstyle: 'html',
        }, uh);
        if (r.data.status === '200') {
            this.isEdited = true;
        }
    }

    public deleteComment() {
        const r = networkRequests.deleteComment({

        });
        if (r.data.status === '200') {
            this.isDeleted = true;
        }
    }
}