import { Request, Response } from 'express';
import { GetCommentsRequest } from '../models/requests/GetCommentsRequest';
import { GetComment } from '../usecases/GetComment';
import { v4 as uuidv4 } from 'uuid';
import { SortingField, SortingOrder } from '../models/enums/Sorting';
import { PostCommentsRequest } from '../models/requests/PostCommentsRequest';
import { ReplyCommentsRequest } from '../models/requests/ReplyCommentsRequest';
import { PostComment } from '../usecases/PostComment';
import { ReplyComment } from '../usecases/ReplyComment';
import {  ModifyComment } from '../usecases/ModifyComment';
import { EditCommentsRequest } from '../models/requests/EditCommentsRequest';
import { InteractComment } from '../usecases/InteractComment';
import { DeleteCommentsRequest } from '../models/requests/DeleteCommentsRequest';
import { InteractionType } from '../models/enums/InteractionType';
import { InteractCommentsRequest } from '../models/requests/InteractCommentsRequest';
export class CommentsController {
    async getComments(req: Request, res: Response) {
        try {
            const {
                sortBy = 'date',
                sortOrder = 'DESC',
                limit = '10',
                nextPageState = '',
                postId = ''
            } = req.query;
            if (!postId) {
                return res.status(400).json({ error: 'postId is required' });
            }
            const payload = new GetCommentsRequest(
                sortBy.toString() === SortingField.TOP ? SortingField.TOP : SortingField.DATE,
                sortOrder.toString().toUpperCase() === 'ASC' ? SortingOrder.ASCENDING : SortingOrder.DESCENDING,
                parseInt(limit.toString()),
                nextPageState.toString(),
                postId.toString()
            );
            const getComment = new GetComment();
            const paginatedComments = payload.sortBy === SortingField.TOP ? await getComment.getCommentsSortedByLikes(payload) : await getComment.getCommentsSortedByDate(payload);
            return res.status(200).json({
                data: paginatedComments.data,
                nextPageState: paginatedComments.nextPageState 
            });
        }
        catch (err: any) {
            console.error('Error fetching comments:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    };
    async postComments(req: Request, res: Response) {
        try {
            const { postId, userId, comment } = req.body;
            if (!postId || !userId || !comment) {
                return res.status(400).json({ error: 'postId, userId, and comment are required' });
            }
            const payload = new PostCommentsRequest(
                postId.toString(),
                userId.toString(),
                comment.toString(),
                uuidv4(),
                new Date()
            );
            const postComment = new PostComment();
            const postCommentResposne = await postComment.postComment(payload);
            res.status(201).json(postCommentResposne);
        } catch (err: any) {
            console.error('Error posting comments:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
    async replyComments(req: Request, res: Response) {
        try {
            const { commentId, userId, comment } = req.body;
            if (!commentId || !userId || !comment) {
                return res.status(400).json({ error: 'commentId, userId, and comment are required' });
            }
            const payload = new ReplyCommentsRequest(
                commentId.toString(),
                userId.toString(),
                comment.toString(),
                uuidv4(),
                new Date()
            );
            const replyComment = new ReplyComment();
            const replyCommentResposne = await replyComment.reply(payload);
            res.status(201).json(replyCommentResposne);
        } catch (err: any) {
            console.error('Error posting comments:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
    async interactComment(req: Request, res: Response) {
        try {
            const { commentId, userId, interactionType } = req.body;
            if (!commentId || !userId || !interactionType) {
                return res.status(400).json({ error: 'commentId, userId, and interactionType are required' });
            }
            const interactComment = new InteractComment();
            const payload = new InteractCommentsRequest(
                commentId.toString(),
                userId.toString(),
                interactionType.toString() === InteractionType.LIKE ? InteractionType.LIKE : InteractionType.DISLIKE
            )
            const interactCommentResponse = await interactComment.interactComment(payload);
            res.status(201).json(interactCommentResponse);
        } catch (err: any) {
            console.error('Error posting comments:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async editComment(req: Request, res: Response) {
        try {
            const { postId, commentId, userId, newComment } = req.body;
            if (!postId || !commentId || !userId || !newComment) {
                return res.status(400).json({ error: 'postId,commentId, userId, and newComment are required' });
            }
            const modifyComment = new ModifyComment();
            const payload = new EditCommentsRequest(postId, commentId, userId, newComment)
            const editCommentResposne = await modifyComment.editComment(payload);
            res.status(201).json(editCommentResposne);
        } catch (err: any) {
            console.error('Error editing comments:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
    async deleteComment(req: Request, res: Response) {
        try {
            const { postId, commentId, userId } = req.body;
            if (!postId || !commentId || !userId) {
                return res.status(400).json({ error: 'commentId and userId are required' });
            }
            const modifyComment = new ModifyComment();
            const payload = new DeleteCommentsRequest(postId, commentId, userId)
            const deleteCommentResposne = await modifyComment.deleteComment(payload);
            res.status(201).json(deleteCommentResposne);
        } catch (err: any) {
            console.error('Error posting comments:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}