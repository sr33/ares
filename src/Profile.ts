import { networkRequests } from './NetworkRequests';

export default class Profile {
    private userName: string = '..fetching';
    private comments: any[] = [];

    public get stats() {
        return {
            username: this.userName,
            commentsFetched: this.comments.length,
            commentsDeleted: 0,
        }
    }

    public get doCommentsExist() {
        return this.comments && this.comments.length > 0;
    }
    
    public async fetchComments() {
        const r = await networkRequests.fetchComments();
        this.comments = r.data.children;
        if (this.comments.length > 0){
            this.userName = this.comments[0].data.author;
            console.log(r.data.children)
        } else {
            alert('no comments found on your profile');
        }

    }
}