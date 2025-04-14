import { scyllaClient } from "../Db/dataSource";
import { InteractionType } from "../models/enums/InteractionType";
import { InteractCommentsRequest } from "../models/requests/InteractCommentsRequest";
export class InteractComment {
    async interactComment(request: InteractCommentsRequest) {
        try {

            const query = `
                SELECT interactionType FROM comment_user_interactions
                WHERE commentId = ? AND userId = ?;
            `;
            const params = [request.commentId, request.userId];
            const data = await scyllaClient.execute(query, params, { prepare: true });
            if (data.rowLength === 0) {
                if (request.interactionType === InteractionType.LIKE)
                    return this.likeComment(request.commentId, request.userId);
                else
                    return this.dislikeComment(request.commentId, request.userId);
            }
            else {
                const existingInteractionType = data.rows[0].interactiontype;
                if (existingInteractionType === InteractionType.LIKE) {
                    const deleteInteraction = `DELETE FROM comment_user_interactions WHERE commentId = ? AND userId = ?`;
                    const decrementLikeCounter = `UPDATE comment_interactions SET likes = likes - 1 WHERE commentId = ?`;
              
                    await scyllaClient.execute(deleteInteraction, [request.commentId, request.userId], { prepare: true });
                    await scyllaClient.execute(decrementLikeCounter, [request.commentId], { prepare: true });
                    console.log('Like removed successfully');
                    return {
                        message: 'Comment Disliked successfully',
                        commentId: request.commentId
                    };
                  } else if (existingInteractionType === 'dislike') {
                    const interactedAt = new Date()
                    const updateInteraction = `UPDATE comment_user_interactions SET interactionType = '${InteractionType.LIKE}', interactedAt = ? WHERE commentId = ? AND userId = ?`;
                    const updateCounters = `UPDATE comment_interactions SET likes = likes + 1, dislikes = dislikes - 1 WHERE commentId = ?`;
              
                    await scyllaClient.execute(updateInteraction, [interactedAt, request.commentId, request.userId], { prepare: true });
                    await scyllaClient.execute(updateCounters, [request.commentId], { prepare: true });
                    console.log('Switched from dislike to like');
                    return {
                        message: 'Comment Switched from dislike to like successfully',
                        commentId: request.commentId
                    };
                  }
            }
        } catch (error: any) {
            console.error('Error interacting with comment:', error);
            throw { error: 'Internal Server Error' };
        }
    }
    private async dislikeComment(commentID: string, userId: string) {
        const interactedAt = new Date()
        const insertInteraction = `INSERT INTO comment_user_interactions (commentId, userId, interactionType, interactedAt) VALUES (?, ?, '${InteractionType.DISLIKE}', ?)`;
        const updateLikeCounter = `UPDATE comment_interactions SET dislikes = dislikes + 1 WHERE commentId = ?`;
        await scyllaClient.execute(insertInteraction, [commentID, userId, interactedAt], { prepare: true });
        await scyllaClient.execute(updateLikeCounter, [commentID], { prepare: true });
        console.log('Disliked successfully');
        return {
            message: 'Comment Disliked successfully',
            commentId: commentID
        };
    }
    private async likeComment(commentID: string, userId: string) {
        const interactedAt = new Date()
        const insertInteraction = `INSERT INTO comment_user_interactions (commentId, userId, interactionType, interactedAt) VALUES (?, ?, '${InteractionType.LIKE}', ?)`;
        const updateLikeCounter = `UPDATE comment_interactions SET likes = likes + 1 WHERE commentId = ?`;
        await scyllaClient.execute(insertInteraction, [commentID, userId, interactedAt], { prepare: true });
        await scyllaClient.execute(updateLikeCounter, [commentID], { prepare: true });
        console.log('Liked successfully');
        return {
            message: 'Comment Liked successfully',
            commentId: commentID
        };
    }
}