import { Request, Response } from "express";
import AuthService from "../services/authService";
import { redisClient } from "../config/redis"; // Importar redisClient

export const register = async (req: Request, res: Response) => {
  try {
    const { username, password, email, role } = req.body;

    console.log("Variables recibidas:", { username, password, email, role });

    if (!username || !password || !email) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    const user = await AuthService.register(username, password, email, role);
    return res.status(201).json({ message: "Usuario registrado exitosamente", user });
  } catch (error: any) {
    console.error("Error capturado en controlador:", error);
    return res.status(500).json({ message: error.message });
  }
};

interface SessionRequest extends Request {
  session: any;
}

export const login = async (req: SessionRequest, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username y contraseña son obligatorios" });
    }

    const { token, user } = await AuthService.login(username, password);

    return res.status(200).json({
      message: "Login exitoso",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    return res.status(401).json({ message: error.message });
  }
};

export const verifyToken = async (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ valid: false, message: 'Token no proporcionado' });
  }

  try {
    const user = await AuthService.verifyToken(token);
    return res.status(200).json({ valid: true, user });
  } catch (error) {
    return res.status(401).json({ valid: false, message: 'Token inválido' });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body; // Obtener el ID del usuario desde el cuerpo o token
    const sessionKey = `session:${userId}`;

    // Eliminar la sesión del usuario en Redis
    await redisClient.del(sessionKey);

    return res.json({ message: "Sesión cerrada correctamente" });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
