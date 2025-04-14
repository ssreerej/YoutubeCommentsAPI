export class DeleteCommentsRequest{
    constructor(
        public postId:string,
        public commentId:string,
        public userId :string
    ){}
}