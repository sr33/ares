import { networkRequests } from './NetworkRequests';

export default class Profile {
    private userName: string = '';
    private comments: any[] = [];

    public get stats() {
        return {
            username: this.userName,
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
            
        } else {
            alert('no comments found on your profile');
        }

    }
}