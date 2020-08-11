var express = require('express')
const router = express.Router()

/**
 * Realiza la verificación si el servicio esta vivo.
 * @get /
 */
router.get('/', function (req, res) {
    return res.send({ status: 'Auth server alive!' })
})

export = router;