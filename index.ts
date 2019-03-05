import * as express from 'express';
import * as debug from 'debug';
import { initAPI } from './initialize';
import * as authSec from './auth/routes/routes';

// Inicializa express
const app = express();
initAPI(app);
app.get('/apiSec/alive', (req, res) => {
    res.send('Servicio vivo');
});

app.use('/apiSec', authSec);

// Inicia el servidor HTTP
const port = 3000;
const server = app.listen(port, () => debug('andes')('listening on port %s', port));
