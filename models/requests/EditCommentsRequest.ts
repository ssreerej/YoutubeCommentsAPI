export class EditCommentsRequest{
    constructor(
        public postId:string,
        public commentId:string,
        public userId :string,
        public newComment :string
    ){}
}