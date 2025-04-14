export class PostCommentsRequest{
    constructor(
        public postId :string,
        public userId :string,
        public comment :string,
        public commentId:string,
        public createdDate : Date
    ){}
}