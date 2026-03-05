<?php

$frontendHost = env('FRONTEND_SUBDOMAIN')
    ? env('FRONTEND_SUBDOMAIN').'.'.env('APP_DOMAIN')
    : env('APP_DOMAIN');

$defaultAllowedOrigins = $frontendHost
    ? 'https://'.$frontendHost
    : 'http://localhost:3000,http://127.0.0.1:3000';

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_filter(array_map(
        'trim',
        explode(',', env('CORS_ALLOWED_ORIGINS', $defaultAllowedOrigins))
    )),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];
