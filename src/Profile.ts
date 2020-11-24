import { networkRequests } from './NetworkRequests';
import * as utils from './utils.js';
import { AxiosPromise, AxiosError } from 'axios';

enum Mode {
    posts = 'posts',
    comments = 'comments'
}

export default class Profile {
    private userName: string = '..loading';
    private comments: Comment[] = [];
    private posts: Post[] = [];
    private modhash: string = '';
    private currentComment: any = {
        action: '..loading',
        comment: ''
    };
    private mode!: Mode;
    private sortIndex: number = 0;
    private sort = [
        '?sort=new',
        '?sort=hot',
        '?sort=controversial',
        '?sort=controversial&t=hour',
        '?sort=controversial&t=day',
        '?sort=controversial&t=week',
        '?sort=controversial&t=month',
        '?sort=controversial&t=year',
        '?sort=controversial&t=all',
        '?sort=top',
        '?sort=top&t=hour',
        '?sort=top&t=day',
        '?sort=top&t=week',
        '?sort=top&t=month',
        '?sort=top&t=year',
        '?sort=top&t=all',
    ]

    public async overwriteAndDelComments(queryString: string) {
        await this.fetchComments(queryString);
        for (let comment of this.comments) {
            this.currentComment = {
                action: "Editing Comment...",
                comment
            };
            await this.overWriteComment(comment);
            if (!comment.isEdited) {
                // repeat same sort order on failure
                this.overwriteAndDelComments(queryString);
                break;
            }
            this.currentComment.action = "Deleting Comment..."
            await this.deleteComment(comment);

            if (!comment.isDeleted) {
                // repeat same sort order on failure
                this.overwriteAndDelComments(queryString);
                break;
            }
            this.currentComment.action = "Performing checks..."
            await utils.resolveAfter2Seconds();
        }
        this.setup();
    }

    public async setup() {
        if (this.sortIndex >= this.sort.length) {
            this.currentComment.action = `All ${this.mode} deleted!`
            this.currentComment.comment = undefined;
            // alert(`Nuke Reddit History tried it's best to delete all ${this.mode}.\nFor Error resolution, please make a post on the subreddit r/NukeRedditHistory`);
            return
        }
        const r = await networkRequests.getUserDetails();
        this.userName = r.data.name;
        this.modhash = r.data.modhash;
        // determine mode from url params
        const urlParams = new URLSearchParams(window.location.search);
        this.mode = urlParams.get('mode') as Mode;
        const curSort = this.sort[this.sortIndex];

        if (this.mode === Mode.posts) {
            this.deletePosts(curSort);
        }
        else if (this.mode === Mode.comments) {
            this.overwriteAndDelComments(curSort);
        }
        this.sortIndex++;
    }

    public async fetchComments(queryString: string) {
        this.comments = [];
        const r = await networkRequests.getComments(this.userName, queryString);
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

    private async deletePosts(queryString: string) {
        await this.fetchPosts(queryString);
        for (let p of this.posts) {
            this.currentComment = {
                action: `Deleting Post titled ${p.title}\nposted to the subreddit: ${p.subreddit}`
            }
            await this.deletePost(p);
            this.currentComment.action = `Performing Checks....`;
            if (!p.isDeleted) {
                // repeat current sort order on failure
                this.deletePosts(queryString);
                break;
            }
            await utils.resolveAfter2Seconds();
        }
        this.setup();
    }

    public async fetchPosts(queryString: string) {
        this.posts = [];
        const r = await networkRequests.getPosts(this.userName, queryString);
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

    public getHumanizedSort(sort: string) {
        const params = new URLSearchParams(sort);
        let humanizedSort = ''
        params.forEach((value: string, key: string) => {
            humanizedSort = `${humanizedSort} ${key}: ${value}`
        })
        return humanizedSort;
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

    constructor(redditThing: any) {
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
