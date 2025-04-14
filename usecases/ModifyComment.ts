import { Config } from "../Config";
import { scyllaClient } from "../Db/dataSource";
import { Comments } from "../models/Comments";
import { DeleteCommentsRequest } from "../models/requests/DeleteCommentsRequest";
import { EditCommentsRequest } from "../models/requests/EditCommentsRequest";
export class ModifyComment {
    async editComment(request: EditCommentsRequest) {
        try {
            console.log(`request received ${JSON.stringify(request.commentId)}`);
            const matchingComment = await this.getLastcommentsinWindowForUser(request.postId,request.commentId,request.userId);
            const updateQuery = `
                UPDATE comments 
                SET comment = ?
                WHERE postId = ? 
                AND createdDate = ? 
                AND commentId = ? 
              `;
            const paramsUpdate = [request.newComment, request.postId, matchingComment.createdDate , request.commentId];
            await scyllaClient.execute(updateQuery, paramsUpdate, { prepare: true });
            console.log(`Comment edited successfully`);
            return {
                message: 'Comment edited successfully',
                commentId: request.commentId,
                newComment: request.newComment,
                createdDate: new Date()
            };

        } catch (error: any) {
            console.error('Error editing comment:', error);
            throw { error: 'Internal Server Error' };
        }
    }
    private async getLastcommentsinWindowForUser(postId:string,commentID:string, userId:string) {
        const fetchQuery = `
            SELECT commentId,createdDate ,userId
            FROM comments 
            WHERE postId = ? 
            AND createdDate > ?
            AND userId = ?
            ALLOW FILTERING
            `;
            console.log(Config.getEditTimeWindow);
            const timeWindow = new Date(Date.now() - Config.getEditTimeWindow * 60 * 1000);
            const paramsFetch = [postId, timeWindow, userId];

            const fetchResult = await scyllaClient.execute(fetchQuery, paramsFetch, { prepare: true });
            let matchingComment;
            if (fetchResult.rowLength > 0) {
                matchingComment = fetchResult.rows.filter(
                    row => row.commentid.toString() === commentID && row.userid.toString() === userId
                )[0];
                return new Comments(matchingComment.commentid,matchingComment.createddate ,matchingComment.userId);
            }
            else {
                console.error(`Error editing comment: found no comments for the given parameters`);
                throw { error: 'Internal Server Error' };
            }
    }
    async deleteComment(request : DeleteCommentsRequest) {
        try {
            console.log(`request received ${JSON.stringify(request.commentId)}`);
            const matchingComment = await this.getLastcommentsinWindowForUser(request.postId,request.commentId,request.userId);
            const deleteQuery = `
                Delete FROM comments 
                WHERE postId = ? 
                AND createdDate = ? 
                AND commentId = ? 
              `;
            const paramsUpdate = [request.postId, matchingComment.createdDate , request.commentId];
            await scyllaClient.execute(deleteQuery, paramsUpdate, { prepare: true });
            console.log(`Comment deleted successfully`);
            return {
                message: 'Comment deleted successfully',
                commentId: matchingComment.commentId,
                createdDate:new Date()
            };

        } catch (error: any) {
            console.error('Error editing comment:', error);
            throw { error: 'Internal Server Error' };
        }
    }
}