import { ReplyCommentsRequest } from "../models/requests/ReplyCommentsRequest";
import { scyllaClient } from "../Db/dataSource";
export class ReplyComment {
    async reply(request: ReplyCommentsRequest) {
        try {
            console.log(`request received ${JSON.stringify(request)}`);
            const query = `
                INSERT INTO replies (commentId, replyId, userId, reply, createdDate)
                VALUES (?, ?, ?, ?, ?)
            `;
            const params = [request.commentId, request.replyId, request.userId, request.comment, request.createdDate];
            await scyllaClient.execute(query, params, { prepare: true });
            console.log("successfully replied");
            return {
                message: 'replied to comment successfully',
                commentId: request.commentId,
                reply: request.comment,
                createdDate: request.createdDate
            };
        } catch (error: any) {
            console.error('Error replying to comment:', error);
            throw { error: 'Internal Server Error' };
        }
    }
}