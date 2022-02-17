import { Router } from "express";
import * as bodyParser from "body-parser";
import callbackHandler from './callback.webhook';

import middlewares from "../middleware";

const route = Router()

export default (app: Router): Router => {
    app.use("/pay-tr", route);

    route.get(
        "/callback",
        bodyParser.json(),
        middlewares.wrap(callbackHandler)
    );

    return app;
}
