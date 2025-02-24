# Usa una imagen ligera de Node.js LTS basada en Alpine
FROM node:18-alpine

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copia los archivos de dependencias y luego instala
COPY package*.json ./
RUN npm install

# Copia el resto del código fuente al contenedor
COPY . .

# Expone el puerto en el que se ejecuta el servicio (ajusta si es necesario)
EXPOSE 3001

# Inicia el servidor utilizando el script "start" definido en package.json
CMD ["npm", "start"]
