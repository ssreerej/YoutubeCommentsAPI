import { scyllaClient } from "../Db/dataSource";
export class DeleteComment {
    async deleteComment(commentID: string, userID: string) {
        try {
            console.log(`request received ${JSON.stringify(commentID)}`);
            const query = `
                Delete from comments WHERE commentId = ? and userID = ?
            `;
            const params = [commentID,userID];
            await scyllaClient.execute(query, params, { prepare: true });
            console.log(`Comment deleted successfully`);
            return {
                message: 'Comment deleted successfully',
                commentId: commentID,
                createdDate:new Date()
            };
        } catch (error: any) {
            console.error('Error posting comment:', error);
            throw { error: 'Internal Server Error' };
        }
    }
}