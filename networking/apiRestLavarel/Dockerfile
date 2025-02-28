FROM php:8.1-apache

# Actualizar e instalar dependencias y extensiones necesarias
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libzip-dev \
    libpq-dev \
    && docker-php-ext-install pdo pdo_pgsql pdo_mysql zip \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Habilitar el módulo mod_rewrite para Apache
RUN a2enmod rewrite

# Instalar Composer (usando la imagen oficial de Composer)
COPY --from=composer:2.3 /usr/bin/composer /usr/bin/composer

# Copiar el archivo de configuración personalizado de Apache
COPY miservicio.conf /etc/apache2/sites-available/miservicio.conf
RUN a2ensite miservicio.conf && a2dissite 000-default.conf

# Establecer el directorio de trabajo en la raíz del proyecto
WORKDIR /var/www/html/

# Copiar todos los archivos del proyecto al contenedor
COPY . .

# Instalar las dependencias de Composer
RUN composer install --no-dev --optimize-autoloader

# Ajustar permisos para el usuario de Apache
RUN chown -R www-data:www-data /var/www/html/

# Exponer el puerto 80 (que se mapea a 8080 en Docker Compose)
EXPOSE 80

# Iniciar Apache en primer plano
CMD ["apache2-foreground"]
