import { DataSource } from "typeorm";
import { User } from "../entity/User";
import dotenv from 'dotenv';

dotenv.config();

// Configuración de la base de datos PostgreSQL con TypeORM
export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD || '', // Asegúrate de que sea una cadena
    database: process.env.DB_NAME,
    synchronize: false, // Configura en false en producción
    logging: true,
    entities: [User],
    migrations: [__dirname + "/../migration/**/*.{ts,js}"],
    subscribers: [__dirname + "/../subscriber/**/*.{ts,js}"],
});

// Inicialización de la conexión
