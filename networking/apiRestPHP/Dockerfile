FROM php:8.1-apache

# Instalar dependencias del sistema y extensiones PDO PostgreSQL
RUN apt-get update && apt-get install -y \
    libpq-dev \
    && docker-php-ext-install pdo pdo_pgsql \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Activar módulos Apache necesarios
RUN a2enmod rewrite headers

# Instalar Composer (usando una etiqueta fija)
COPY --from=composer:2.3 /usr/bin/composer /usr/bin/composer

# Copiar configuración personalizada de Apache
COPY miservicio.conf /etc/apache2/sites-available/miservicio.conf

# Habilitar la configuración personalizada y deshabilitar la por defecto
RUN a2ensite miservicio.conf && a2dissite 000-default.conf

# Establecer el directorio de trabajo en la raíz del proyecto
WORKDIR /var/www/html/networking/apiRestPHP
COPY . .

# Instalar dependencias PHP (desde la raíz del proyecto)
RUN composer install --no-dev --optimize-autoloader

# Ajustar permisos para Apache (se aplica a todo el proyecto)
RUN chown -R www-data:www-data /var/www/html/networking/apiRestPHP

# Establecer el directorio de trabajo en la carpeta public (DocumentRoot)
WORKDIR /var/www/html/networking/apiRestPHP/public

# Exponer el puerto 80
EXPOSE 80

# Iniciar Apache en primer plano
CMD ["apache2-foreground"]
