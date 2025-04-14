import { CommentsController } from "./controllers/CommentsController";
import { HttpMethod } from "./models/enums/HttpMethod"
import { Application, Request, Response } from "express"
type ActionType = (request: Request, response: Response) => void;
class Route {
    constructor(
        public path: string,
        public method: HttpMethod,
        public action: ActionType
    ) { }
}
export class Routes {
    routes: Array<Route> = [];
    private controllers = {
        CommentsController: new CommentsController
    }
    constructor(public app: Application) {
    }
    static call(app: Application) {
        const instance = new Routes(app);
        instance.call();
    }
    call() {
        this.routes.push(new Route("/api/v1/comments/show", HttpMethod.GET, this.controllers.CommentsController.getComments.bind(this.controllers.CommentsController)))
        this.routes.push(new Route("/api/v1/comments/post", HttpMethod.POST, this.controllers.CommentsController.postComments.bind(this.controllers.CommentsController)))
        this.routes.push(new Route("/api/v1/comments/reply", HttpMethod.POST, this.controllers.CommentsController.replyComments.bind(this.controllers.CommentsController)))
        this.routes.push(new Route("/api/v1/comments/interact", HttpMethod.POST, this.controllers.CommentsController.interactComment.bind(this.controllers.CommentsController)))
        this.routes.push(new Route("/api/v1/comments/edit", HttpMethod.PUT, this.controllers.CommentsController.editComment.bind(this.controllers.CommentsController)))
        this.routes.push(new Route("/api/v1/comments/delete", HttpMethod.DELETE, this.controllers.CommentsController.deleteComment.bind(this.controllers.CommentsController)))
        this.routes.forEach(route => {
            this.app[route.method](route.path, route.action);
        });
    }
}