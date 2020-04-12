import { networkRequests } from './NetworkRequests';
import * as utils from './utils.js';
import { AxiosPromise, AxiosError } from 'axios';

export default class Profile {
    private userName: string = '..loading';
    private comments: Comment[] = [];
    private posts: Post[] = [];
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
        if (document.URL.includes('posts')) {
            this.deletePosts();
        }
        else if (document.URL.includes('comments')) {
            this.overwriteAndDelComments();
        }
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
        } catch (e) {
            utils.onNetworkError(e);
        }
    }

    private async deleteComment(comment: Comment): Promise<any> {
        try {
            const response = await comment.deleteComment(this.modhash);
            comment.isDeleted = true; // reddit doesn't respond with success flag on delete.
            return response;
        } catch (e) {
            utils.onNetworkError(e);
        }
    }

    private async deletePosts() {
        await this.fetchPosts();
        if (this.posts && this.posts.length > 0) {
            for (let p of this.posts) {
                this.currentComment = {
                    action: `Deleting Post titled ${p.title}\nposted to the subreddit: ${p.subreddit}`
                }
                await this.deletePost(p);
                this.currentComment.action = `Performing Checks....`;
                await utils.resolveAfter2Seconds();
            }
            this.setup();
        } else {
            this.currentComment.action = "All Posts were deleted. Feedback -> r/NukeRedditHistory";
            alert(`No more posts found. Nuke Reddit History tried it's best to delete all posts.\nFor feedback or error resolution, please start a thread on /r/NukeRedditHistory`);
        }
        
    }

    public async fetchPosts() {
        this.posts = [];
        const r = await networkRequests.getPosts(this.userName);
        for (let rp of r.data.children) {
            const p = new Post(rp);
            this.posts.push(p);
        }
    }

    private async deletePost(post: Post): Promise<any> {
        try {
            const r = await post.delete(this.modhash);
            post.isDeleted = true;
            return r;
        } catch (e) {
            utils.onNetworkError(e);
        }
    }

}

class Comment {
    private redditThing: any; // raw comment object
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
        return networkRequests.deleteRedditThing(payload, uh);
    }

}

class Post {
    private thing_id: string;
    public subreddit: string;
    public isDeleted: boolean = false;
    public title: string;

    constructor(private redditThing: any) {
        this.thing_id = this.redditThing.data.name;
        this.subreddit = this.redditThing.data.subreddit;
        this.title = this.redditThing.data.title;
    }

    public delete(uh: string) {
        const payload = {
            id: this.thing_id,
            executed: 'deleted',
            uh,
            renderstyle: 'html',
        };
        return networkRequests.deleteRedditThing(payload, uh);
    }

}
