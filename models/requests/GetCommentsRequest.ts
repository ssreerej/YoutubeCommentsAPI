import { SortingField, SortingOrder } from "../enums/Sorting";

export class GetCommentsRequest {
    constructor(
        public sortBy: SortingField,
        public sortOrder: SortingOrder,
        public limit: number,
        public nextPageState: string,
        public postId: string
    ) { }
}