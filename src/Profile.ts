import { networkRequests } from './NetworkRequests';

export default class Profile {
    private userName: string;
    private comments: any[];
    
    public async fetchComments() {
        const r = await networkRequests.fetchComments();
        this.comments = r.data.children;
        if (this.comments.length > 0){
            this.userName = this.comments[0].data.author;
            console.log(this.userName);
        } else {
            alert('no comments found on your profile');
        }

    }
}