import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../config/data-source";
import { User } from "../entity/User";
import { redisClient } from "../config/redis";

class AuthService {
  async register(username: string, password: string, email: string, role: string = "student") {
    const userRepository = AppDataSource.getRepository(User);

    try {
      const userExists = await userRepository.findOne({
        where: [{ username }, { email }],
      });

      if (userExists) {
        throw new Error("El usuario o correo ya existe");
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = userRepository.create({
        username,
        password: hashedPassword,
        email,
        role,
      });

      await userRepository.save(user);

      return user;
    } catch (error) {
      console.error("Error capturado en servicio AuthService:", error);
      throw error;
    }
  }



  async login(username: string, password: string) {
    const userRepository = AppDataSource.getRepository(User);
    console.log(username);
    console.log(password);
    try {
      // Buscar el usuario por nombre
      console.log(`Buscando usuario con nombre: ${username}`);
      const user = await userRepository.findOne({ where: { username } });
      if (!user) {
        console.log("Usuario no encontrado");
        throw new Error("Usuario no encontrado");
      }

      // Comparar la contraseña
      console.log("Comparando contraseñas");
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        console.log("Contraseña incorrecta");
        throw new Error("Contraseña incorrecta");
      }

      // Verificar si ya existe una sesión activa para el usuario
      const sessionKey = `session:${user.id}`;
      const existingSession = await redisClient.get(sessionKey);
      if (existingSession) {
        console.log("Sesión existente encontrada, eliminando...");
        await redisClient.del(sessionKey);
      }

      // Generar JWT
      console.log("Generando token JWT");
      const token = jwt.sign(
        {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET as string, // Secreto JWT
        { expiresIn: process.env.JWT_EXPIRATION || "10h" } // Tiempo de expiración
      );

      // Almacenar la sesión en Redis
      const sessionData = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: token, // Almacenar el token en la sesión
      };

      await redisClient.set(sessionKey, JSON.stringify(sessionData), {
        EX: 60 * 60 * 10, // Expiración en segundos (10 horas)
      });

      return { token, user };
    } catch (error) {
      console.error("Error en el login:", error);
      throw new Error("Error en el login");
    }
  }

  async verifyToken(token: string): Promise<any> {
    console.log("Verificando token");
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
      const sessionKey = `session:${decoded.id}`;
      const userData = await redisClient.get(sessionKey);
      if (!userData) {
        throw new Error("Token inválido o expirado");
      }
      return JSON.parse(userData);
    } catch (error) {
      throw new Error("Error al verificar el token");
    }
  }
}



export default new AuthService();
