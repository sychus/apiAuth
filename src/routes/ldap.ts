var express = require('express')
const router = express.Router()
import { checkPassword } from '../controller/ldap';

/**
 * Realiza la verificación si el servicio esta vivo.
 * @get /
 */
router.get('/', function (req, res) {
    return res.send({ status: 'Auth server alive!' })
})

/**
 * Realiza la validación en servidor de authentication
 * @param {string} username nombre de usuario (DNI)
 * @param {string} password Password de la cuenta
 * @post /
 */
router.post('/', async (req, res, next) => {
    try {
        if (!req.body.username || !req.body.password) {
            return next(403);
        }
        const ldapUser = await checkPassword(req.body.username, req.body.password);
        if (ldapUser) {
            res.status(200).send({nombre: ldapUser.nombre, apellido: ldapUser.apellido, email: ldapUser.email, telefono: ldapUser.telefono, du: ldapUser.du });
        }
        else {
            return next(403);
        }
    } catch (error) {
        return next(403);
    }
});

export = router;