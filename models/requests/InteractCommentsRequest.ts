import { InteractionType } from "../enums/InteractionType"

export class InteractCommentsRequest{
    constructor(
        public commentId:string,
        public userId :string,
        public interactionType:InteractionType
    ){}
}