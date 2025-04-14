import { Config } from "../Config";
import { scyllaClient } from "../Db/dataSource";
import { SortingOrder } from "../models/enums/Sorting";
import { GetCommentsRequest } from "../models/requests/GetCommentsRequest";

export class GetComment {
    async getCommentsSortedByDate(request: GetCommentsRequest) {
        try {
            const query = `
            SELECT * FROM comments 
            WHERE postId = ? 
            ORDER BY createdDate DESC;
          `;
            const params = [request.postId];
            const pagestate = request.nextPageState === '' ? undefined : request.nextPageState;
            const result = await scyllaClient.execute(query, params, {
                prepare: true,
                fetchSize: request.limit,
                pageState: pagestate
            });
            return {
                data: result.rows,
                nextPageState: result.pageState || null,
            };
        } catch (err: any) {
            console.error('Error fetching user comments:', err);
            throw { error: 'Internal Server Error' };
        }
    }
    async getCommentsSortedByLikes(request: GetCommentsRequest) {
        const query = `SELECT * FROM comments WHERE postId = ?`;
        const result = await scyllaClient.execute(query, [request.postId], {
            prepare: true
        });
        const comments = result.rows;
        const commentIds = comments.map(c => c.commentid);
        if (commentIds.length === 0) {
            return { data: [], nextPageState: null };
        }

        const likeMap = await this.getLikesMap(commentIds);
        const replyMap = await this.getreplyMap(commentIds);
        const sorted = comments.map(comment => {
            const commentId = comment.commentid.toString();

            const interactionScore = likeMap.get(commentId) || 0;
            const replyCount = replyMap.get(commentId) || 0;
            const replyWeightage = Config.getReplyWeightage;
            const score = interactionScore + (replyCount * replyWeightage);
            return {
                ...comment,
                score
            };
        }).sort((a, b) => request.sortOrder === SortingOrder.ASCENDING ? a.score - b.score : b.score - a.score);
        const totalResults = sorted.length;
        const nextState = request.nextPageState === '' ? 0 : parseInt(request.nextPageState);
        const paginatedData = sorted.slice(nextState, nextState + request.limit);
        const hasMoreResults = nextState + request.limit < totalResults;
        const nextPageState = hasMoreResults ? nextState + request.limit : null;
        return {
            data: paginatedData,
            nextPageState: nextPageState
        };
    }
    async getLikesMap(commentIds: string[]): Promise<Map<string, number>> {
        const likeQuery = `SELECT commentId, likes,dislikes FROM comment_interactions WHERE commentId IN (${commentIds.map(() => '?').join(',')})`;
        const likeResult = await scyllaClient.execute(likeQuery, commentIds, { prepare: true });

        const likeMap = new Map<string, number>();
        likeResult.rows.forEach(row => {
            likeMap.set(row.commentid.toString(), row.likes - row.dislikes);
        });
        return likeMap;
    }
    async getreplyMap(commentIds: string[]): Promise<Map<string, number>> {
        const replyQuery = `SELECT commentId, COUNT(*) AS replyCount FROM replies WHERE commentId IN (${commentIds.map(() => '?').join(',')}) GROUP BY commentId`;
        const replyResult = await scyllaClient.execute(replyQuery, commentIds, { prepare: true });

        const replyMap = new Map<string, number>();
        replyResult.rows.forEach(row => {
            replyMap.set(row.commentid.toString(), row.replycount);
        });
        return replyMap;
    }
}
