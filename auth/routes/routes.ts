import * as express from 'express';
import * as ldapjs from 'ldapjs';
import * as configPrivate from '../../config.private';
import { Auth } from './../auth.class';
import { authUsers } from '../schemas/permisos';
import * as mongoose from 'mongoose';

const isReachable = require('is-reachable');
const sha1Hash = require('sha1');
const shiroTrie = require('shiro-trie');
const router = express.Router();

/**
 * Obtiene el user de la session
 * @get /api/auth/sesion
 */

router.get('/sesion', Auth.authenticate(), (req, res) => {
    res.json((req as any).user);
});

/**
 * Refresca el token y los permisos dado una organizacion}
 * @param {string} username nombre de usuario (DNI)
 * @param {string} password Password de la cuenta
 * @post /api/auth/login
 */

router.post('/login', (req, res, next) => {
    // Función interna que genera token
    const login = (nombre: string, apellido: string) => {
        Promise.all([
            authUsers.findOne({
                usuario: req.body.usuario
            }),
            authUsers.findOneAndUpdate(
                { usuario: req.body.usuario },
                { password: sha1Hash(req.body.password), nombre, apellido },
            )
        ]).then((data: any[]) => {
            // Verifica que el usuario sea valido y que tenga permisos asignados
            console.log('entro por el login común');
            const user = data[0];
            const prof = data[1];
            if (!user || user.length === 0) {
                return next(403);
            }

            // Crea el token con los datos de sesión
            res.json({
                token: Auth.generateUserToken(data[0], null, [], data[1])
            });
        });
    };

    const loginCache = (password: string) => {

        Promise.all([
            authUsers.findOne({
                usuario: req.body.usuario,
                password
            })
        ]).then((data: any[]) => {
            console.log('entro por login cacheee');
            const user = data;
            // Verifica que el usuario sea valido y que tenga permisos asignados
            if (!user || user.length === 0) {
                return next(403);
            }
            // Crea el token con los datos de sesión
            res.json({
                token: Auth.generateUserToken(user, null, [], null)
            });
        });
    };
    // Valida datos
    if (!req.body.usuario || !req.body.password) {
        return next(403);
    }
    // Usar LDAP?
    if (!configPrivate.auth.useLdap) {
        // Access de prueba
        login(req.body.usuario, req.body.usuario);
    } else {
        const server = configPrivate.hosts.ldap + configPrivate.ports.ldapPort;
        /* Verifico que el servicio de ldap esté activo */
        isReachable(server).then(reachable => {
            if (!reachable) {
                /* Login by cache */
                const passwordSha1 = sha1Hash(req.body.password);
                loginCache(passwordSha1);

            } else {
                // Conecta a LDAP
                const dn = 'uid=' + req.body.usuario + ',' + configPrivate.auth.ldapOU;
                const ldap = ldapjs.createClient({
                    url: `ldap://${configPrivate.hosts.ldap}`
                });
                ldap.bind(dn, req.body.password, (err) => {
                    if (err) {
                        return next(ldapjs.InvalidCredentialsError ? 403 : err);
                    }
                    // Busca el usuario con el UID correcto.
                    ldap.search(dn, {
                        scope: 'sub',
                        filter: '(uid=' + req.body.usuario + ')',
                        paged: false,
                        sizeLimit: 1
                    }, (err2, searchResult) => {
                        if (err2) {
                            return next(err2);
                        }
                        searchResult.on('searchEntry', (entry) => {
                            login(entry.object.givenName, entry.object.sn);
                        });
                        searchResult.on('error', (err3) => {
                            return next(err3);
                        });
                    });
                });
            }
        });
    }
});

export = router;
