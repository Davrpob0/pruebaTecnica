import { createClient } from 'redis';
import session from 'express-session';
const { RedisStore } = require("connect-redis");

// Cliente Redis usando únicamente la URL completa
const redisClient = createClient({ url: process.env.REDIS_URL });

redisClient.on('error', (err) => console.error('Redis Client Error:', err));
redisClient.on('connect', () => console.log('Redis conectado exitosamente'));
redisClient.on('ready', () => console.log('Redis está listo para usarse'));
redisClient.on('reconnecting', () => console.log('Intentando reconectar a Redis...'));

// Conectar al cliente Redis
(async () => {
  try {
    await redisClient.connect();
    console.log('Cliente Redis conectado exitosamente');
  } catch (err) {
    console.error('Error al conectar Redis:', err);
  }
})();

// Configuración del almacén de sesiones con Redis
const redisStore = new RedisStore({
  client: redisClient,
  prefix: 'session:',
});

// Middleware de sesión
const sessionMiddleware = session({
  store: redisStore,
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24,
  },
});

export { sessionMiddleware, redisClient };
