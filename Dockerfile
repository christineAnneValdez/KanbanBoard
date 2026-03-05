# syntax=docker/dockerfile:1.7

ARG NODE_VERSION=22
ARG PHP_VERSION=8.2

############################
# Frontend (Nuxt 4) build
############################
FROM node:${NODE_VERSION}-alpine AS frontend-build
WORKDIR /app

COPY nuxt_frontend/package*.json ./
COPY nuxt_frontend/scripts ./scripts
RUN npm ci

COPY nuxt_frontend/ ./
RUN npm run build && npm prune --omit=dev

############################
# Frontend runtime target
############################
FROM node:${NODE_VERSION}-alpine AS frontend
WORKDIR /app

ENV NODE_ENV=production
ENV NITRO_HOST=0.0.0.0
ENV PORT=3000

COPY --from=frontend-build /app/.output ./.output
COPY --from=frontend-build /app/node_modules ./node_modules
COPY --from=frontend-build /app/package.json ./package.json

EXPOSE 3000
CMD ["sh", "-c", "APP_SCHEME=${APP_SCHEME:-https}; if [ -n \"${APP_DOMAIN:-}\" ] && [ -z \"${NUXT_PUBLIC_API_BASE:-}\" ]; then if [ -n \"${BACKEND_SUBDOMAIN:-}\" ]; then BACKEND_HOST=${BACKEND_SUBDOMAIN}.${APP_DOMAIN}; else BACKEND_HOST=${APP_DOMAIN}; fi; export NUXT_PUBLIC_API_BASE=${APP_SCHEME}://${BACKEND_HOST}/api; fi; exec node .output/server/index.mjs"]

############################
# Backend (Laravel) deps
############################
FROM php:${PHP_VERSION}-cli AS backend-composer
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    unzip \
    libzip-dev \
    && docker-php-ext-install zip \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

COPY laravel_backend/composer.json laravel_backend/composer.lock ./
RUN composer install \
    --no-dev \
    --prefer-dist \
    --no-interaction \
    --no-progress \
    --no-scripts \
    --optimize-autoloader

FROM node:${NODE_VERSION}-alpine AS backend-assets
WORKDIR /app

COPY laravel_backend/package*.json ./
RUN npm ci

COPY laravel_backend/ ./
RUN npm run build

############################
# Backend runtime target
############################
FROM php:${PHP_VERSION}-apache AS backend
WORKDIR /var/www/html

RUN apt-get update && apt-get install -y --no-install-recommends \
    libzip-dev \
    zip \
    unzip \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    && docker-php-ext-install pdo_mysql mbstring bcmath exif pcntl \
    && a2enmod rewrite \
    && rm -rf /var/lib/apt/lists/*

COPY laravel_backend/ ./
COPY --from=backend-composer /app/vendor ./vendor
COPY --from=backend-assets /app/public/build ./public/build
COPY docker/backend-entrypoint.sh /usr/local/bin/backend-entrypoint

RUN chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R ug+rwx storage bootstrap/cache \
    && sed -i 's/\r$//' /usr/local/bin/backend-entrypoint \
    && chmod +x /usr/local/bin/backend-entrypoint

ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf \
    && sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf \
    && sed -ri -e 's/AllowOverride None/AllowOverride All/g' /etc/apache2/apache2.conf

EXPOSE 80
CMD ["backend-entrypoint"]
