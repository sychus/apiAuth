import { authServer } from './config';
import express from 'express';
import { initAPI } from './initialize';

const { server: serverConfig } = authServer;
// Inicializa express
const app = express();
initAPI(app);

app.listen(serverConfig, () => {
    return console.log(`Auth server is running on.... ${serverConfig.port}`);
});