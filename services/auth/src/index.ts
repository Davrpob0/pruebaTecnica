import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import { sessionMiddleware } from './config/redis';
import router from './routes';
import { AppDataSource } from "./config/data-source";

dotenv.config();

const app = express();


app.use(bodyParser.json());
app.use('/auth', sessionMiddleware, router);

const PORT = process.env.PORT || 3001;

async function startApp() {
    try {
        await AppDataSource.initialize();

        console.log("Configuración actual para conexión DB:", {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            username: process.env.DB_USERNAME,
            database: process.env.DB_NAME
        });

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
