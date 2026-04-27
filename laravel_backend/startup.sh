#!/bin/sh
set -e

echo "Waiting for database..."
until php artisan db:show > /dev/null 2>&1; do
  echo "Database not ready, retrying in 2s..."
  sleep 2
done
echo "Database is ready."

php artisan storage:link --force
php artisan migrate --force
php artisan db:seed --force

php artisan config:cache
php artisan route:cache
php artisan view:cache

exec /usr/bin/supervisord -n -c /etc/supervisor/supervisord.conf
