import { configuration } from '../config.private';
import express from 'express';
import { initAPI } from './initialize';

const { server: serverConfig } = configuration;
// Inicializa express
const app = express();
initAPI(app);

app.listen(serverConfig, () => {
    return console.log(`Auth server is running on port.... ${serverConfig.port}`);
});