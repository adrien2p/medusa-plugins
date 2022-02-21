import { Response, Router } from "express";
import * as bodyParser from "body-parser";

import middlewares from "../middleware";
import { CustomRequest } from "../../types";
import PayTRProviderService from "../../services/paytr-provider";

const route = Router()

export default (app: Router): Router => {
    app.use("/pay-tr", route);

    route.get(
        "/callback",
        bodyParser.json(),
        middlewares.wrap(webhook)
    );

    return app;
}

async function webhook(req: CustomRequest, res: Response): Promise<void> {
    try {
        const data = req.body;

        const payTRProviderService = req.scope.resolve('pp_paytr') as PayTRProviderService;
        await payTRProviderService.handleCallback(data);

        res.send('OK');
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}