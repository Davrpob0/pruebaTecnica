FROM php:8.1-apache

# Instalar dependencias del sistema y extensiones PDO PostgreSQL
RUN apt-get update && apt-get install -y \
    libpq-dev \
    && docker-php-ext-install pdo pdo_pgsql \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Activar módulos Apache necesarios
RUN a2enmod rewrite headers

# Instalar Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copiar configuración personalizada de Apache
COPY miservicio.conf /etc/apache2/sites-available/miservicio.conf

# Habilitar configuración y deshabilitar la por defecto
RUN a2ensite miservicio.conf \
    && a2dissite 000-default.conf

# Definir directorio de trabajo
WORKDIR /var/www/html

# Copiar archivos del proyecto
COPY . .

# Instalar dependencias PHP
RUN composer install --no-dev --optimize-autoloader

# Ajustar permisos para Apache
RUN chown -R www-data:www-data /var/www/html

# Exponer puerto
EXPOSE 80

# Iniciar Apache en primer plano
CMD ["apache2-foreground"]