FROM php:8.1-apache

# Enable Apache mod_rewrite
RUN a2enmod rewrite

# Install PHP extensions
RUN docker-php-ext-install mysqli pdo pdo_mysql

# Install additional tools
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libzip-dev \
    && docker-php-ext-install zip

# Set working directory
WORKDIR /var/www/html

# Set permissions
# Note: We don't copy src here in dev mode because we are using volumes, 
# but setting permissions is good practice.
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html

# Apache configuration
RUN echo "ServerName localhost" >> /etc/apache2/apache2.conf

EXPOSE 80
