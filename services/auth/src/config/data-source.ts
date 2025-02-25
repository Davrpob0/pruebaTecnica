import { DataSource } from "typeorm";
import { User } from "../entity/User";

// Configuración de la base de datos PostgreSQL con TypeORM
export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: false,
    logging: true,
    entities: [User],
    migrations: [__dirname + "/../migration/**/*.{ts,js}"],
    subscribers: [__dirname + "/../subscriber/**/*.{ts,js}"],
});
