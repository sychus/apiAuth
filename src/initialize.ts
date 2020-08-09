import * as bodyParser from 'body-parser';
import { Express } from 'express';
import { checkPassword } from './controller/ldap';

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


    // Solo realiza un check de alive
    app.get('/alive', (req, res, next) => {
        return res.send({ status: 'Auth server alive!' })
    })


    /**
 * Realiza la validación en servidor de login
 * @param {string} username nombre de usuario (DNI)
 * @param {string} password Password de la cuenta
 * @post /login
 */
    app.post('/login', async (req, res, next) => {
        try {
            if (!req.body.username || !req.body.password) {
                return next(403);
            }
            const ldapUser = await checkPassword(req.body.username, req.body.password);
            if (ldapUser) {
                res.json({nombre: ldapUser.givenName, apellido: ldapUser.sn, email: ldapUser.mail, telefono: ldapUser.telephoneNumber, du: ldapUser.uid }).status(200);
            }
            else {
                return next(403);
            }
        } catch (error) {
            return next(403);
        }
    });
}
