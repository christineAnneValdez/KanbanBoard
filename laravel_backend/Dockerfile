FROM node:20-alpine AS assets

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY resources ./resources
COPY public ./public
COPY vite.config.js ./
RUN npm run build

FROM composer:2 AS vendor

WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --no-interaction \
    --no-progress \
    --prefer-dist \
    --optimize-autoloader \
    --no-scripts \
    --ignore-platform-req=php

FROM php:8.3-apache-bookworm

ENV APACHE_DOCUMENT_ROOT=/var/www/html/public

RUN set -eux; \
    apt-get update; \
    apt-get install -y --no-install-recommends \
        libonig-dev \
        libzip-dev \
        zlib1g-dev \
        unzip \
        supervisor; \
    docker-php-ext-install -j"$(nproc)" \
        bcmath \
        mbstring \
        pdo_mysql \
        zip; \
    a2enmod rewrite headers; \
    sed -ri -e "s!/var/www/html!${APACHE_DOCUMENT_ROOT}!g" /etc/apache2/sites-available/*.conf; \
    sed -ri -e "s!/var/www/!${APACHE_DOCUMENT_ROOT}!g" /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf; \
    rm -rf /var/lib/apt/lists/*

WORKDIR /var/www/html

COPY . .
COPY --from=vendor /app/vendor ./vendor
COPY --from=assets /app/public/build ./public/build
COPY php.ini /usr/local/etc/php/conf.d/99-app.ini

RUN chown -R www-data:www-data storage bootstrap/cache

COPY startup.sh /startup.sh
COPY supervisord.conf /etc/supervisor/conf.d/weconnect.conf
RUN chmod +x /startup.sh

EXPOSE 80

CMD ["/startup.sh"]
