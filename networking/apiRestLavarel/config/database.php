<?php

return [

    'default' => env('DB_CONNECTION', 'pgsql'),

    'connections' => [

        'pgsql' => [
            'driver'   => 'pgsql',
            'host'     => env('DB_HOST', 'localhost'),
            'port'     => env('DB_PORT', '5432'),
            'database' => env('DB_DATABASE', 'pruebaTecnica'),
            'username' => env('DB_USERNAME', 'drestrepob'),
            'password' => env('DB_PASSWORD', 'DavidRB25'),
            'charset'  => 'utf8',
            'prefix'   => '',
            'schema'   => 'public',
            'sslmode'  => 'prefer',
        ],

    ],

];
