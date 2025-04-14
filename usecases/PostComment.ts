import { PostCommentsRequest } from "../models/requests/PostCommentsRequest";
import { scyllaClient } from "../Db/dataSource";
export class PostComment {
    async postComment(request: PostCommentsRequest) {
        try {
            console.log(`request received ${JSON.stringify(request)}`);
            const query = `
                INSERT INTO comments (postId, commentId, userId, comment, createdDate)
                VALUES (?, ?, ?, ?, ?)
            `;
            const params = [request.postId, request.commentId, request.userId, request.comment, request.createdDate];
            await scyllaClient.execute(query, params, { prepare: true });
            return {
                message: 'Comment posted successfully',
                commentId: request.commentId,
                Comment: request.comment,
                createdDate: request.createdDate
            };
        } catch (error: any) {
            console.error('Error posting comment:', error);
            throw { error: 'Internal Server Error' };
        }

    }
}