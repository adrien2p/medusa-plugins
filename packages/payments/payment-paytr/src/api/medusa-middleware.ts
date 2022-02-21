const medusaMiddlewares = {
    preCartCreation: async function (req, res, next) {
        try {
            if (req.originalUrl === '/store/carts/create-cart/' && req.method.toLowerCase() === 'post') {
/*                req.body.context = req.body.context ?? {};
                req.body.context = {
                    ...req.body.context,
                    ip: req.headers["x-forwarded-for"] || req.connection.remoteAddress
                };*/
            }

            next()
        } catch (error) {
            next()
        }
    }
};

export default medusaMiddlewares;