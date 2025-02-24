import { createClient } from 'redis';
import dotenv from 'dotenv';
import session from 'express-session';

dotenv.config();
// Inicializa el almacenamiento de Redis con una función de fábrica
const { RedisStore } = require("connect-redis")

// Configuración del cliente de Redis
const redisClient = createClient({
  url: process.env.REDIS_URL,
  password: process.env.REDIS_PASSWORD, // Si se requiere autenticación
});

redisClient.on('error', (err) => console.error('Redis Client Error:', err));
redisClient.on('connect', () => console.log('Redis conectado exitosamente'));
redisClient.on('ready', () => console.log('Redis está listo para usarse'));
redisClient.on('reconnecting', () => console.log('Intentando reconectar a Redis...'));

// Asegurar la conexión al cliente Redis
(async () => {
  try {
    await redisClient.connect();
    console.log('Cliente Redis conectado exitosamente');
  } catch (err) {
    console.error('Error al conectar Redis:', err);
  }
})();

// Configurar la tienda Redis usando la función de fábrica
const redisStore = new RedisStore({
  client: redisClient,
  prefix: 'session:', // Prefijo opcional para organizar claves de sesión
});

// Middleware de sesión
const sessionMiddleware = session({
  store: redisStore,
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false, // No guardar sesiones no inicializadas
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Cookies seguras solo en producción
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24, // 1 día
  },
});

export { sessionMiddleware, redisClient };
