export class ReplyCommentsRequest{
    constructor(
        public commentId:string,
        public userId :string,
        public comment :string,
        public replyId: string,
        public createdDate : Date
    ){}
}