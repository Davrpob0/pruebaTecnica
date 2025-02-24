import { AppDataSource } from "../config/data-source";
import AuthService from "../services/authService";
import { User } from "../entity/User";

export async function createDefaultUsers() {
    const usersToCreate = [
        { username: "admin", password: "123456", email: "admin@ejemplo.com", role: "admin" },
        { username: "student", password: "123456", email: "student@ejemplo.com", role: "student" }
    ];

    for (const userData of usersToCreate) {
        try {
            const userExists = await AppDataSource.getRepository(User).findOne({
                where: [{ username: userData.username }, { email: userData.email }]
            });

            if (!userExists) {
                await AuthService.register(userData.username, userData.password, userData.email, userData.role);
                console.log(`Usuario ${userData.username} creado correctamente.`);
            } else {
                console.log(`Usuario ${userData.username} ya existe, se omite creación.`);
            }
        } catch (error) {
            console.error(`Error creando usuario ${userData.username}:`, error.message);
            // Aquí NO lances el error para evitar detener todo el proceso
        }
    }
}
