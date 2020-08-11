import * as bodyParser from 'body-parser';
import { Express } from 'express';

export function initAPI(app: Express) {
    // Configura Express
    app.use(bodyParser.json({ limit: '150mb' }));
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.all('*', (req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

        // Permitir que el método OPTIONS funcione sin autenticación
        if ('OPTIONS' === req.method) {
            res.header('Access-Control-Max-Age', '1728000');
            res.sendStatus(200);
        } else {
            next();
        }
    });

    // Ruteos
    app.use('/alive', require('./routes/alive'));
    app.use('/auth', require('./routes/auth'));
}
