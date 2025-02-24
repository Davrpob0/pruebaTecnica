import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import { sessionMiddleware } from './config/redis';
import router from './routes';
import { AppDataSource } from "./config/data-source";


dotenv.config();

const app = express();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.use(bodyParser.json());
app.use('/auth', sessionMiddleware, router);

const PORT = process.env.PORT || 3001;

async function startApp() {
    try {
        await AppDataSource.initialize();
        console.log('Base de datos conectada correctamente.');

        app.listen(PORT, () => {
            console.log(`Servidor de autenticación corriendo en el puerto ${PORT}`);
        });
    } catch (error) {
        console.error("Error crítico durante la inicialización:", error);
        process.exit(1);
    }
}

startApp();
