#!/bin/bash
set -e
# Laravel Forge Deployment Script for SWEAT24 Backend

cd /home/forge/sweat24backend.obs.com.gr

# Pull latest changes
git pull origin $FORGE_SITE_BRANCH

# Install/update PHP dependencies
composer install --no-interaction --prefer-dist --optimize-autoloader --no-dev

# Run database migrations
php artisan migrate --force

# Clear and rebuild caches (IMPORTANT for CORS changes)
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# Rebuild optimized caches
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Install frontend dependencies and build
npm install
npm run build

# Restart PHP-FPM to ensure all changes take effect
# (Forge usually handles this automatically)
# sudo -S service php8.2-fpm reload