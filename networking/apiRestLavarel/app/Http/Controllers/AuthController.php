<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AuthController extends Controller
{
    // POST /auth/login
    public function login(Request $request)
    {
        $authLoginUrl = env('AUTH_SERVICE_LOGIN_URL', 'http://auth-service:3001/auth/login');

        $ch = curl_init($authLoginUrl);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
            CURLOPT_POSTFIELDS     => json_encode($request->all())
        ]);
        $result = curl_exec($ch);
        if (curl_errno($ch)) {
            $error = curl_error($ch);
            curl_close($ch);
            return response()->json(['error' => $error], 500);
        }
        curl_close($ch);

        return response()->json(json_decode($result, true));
    }

    // POST /auth/register
    public function register(Request $request)
    {
        $authRegisterUrl = env('AUTH_SERVICE_REGISTER_URL', 'http://auth-service:3001/auth/register');

        $ch = curl_init($authRegisterUrl);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
            CURLOPT_POSTFIELDS     => json_encode($request->all())
        ]);
        $result = curl_exec($ch);
        if (curl_errno($ch)) {
            $error = curl_error($ch);
            curl_close($ch);
            return response()->json(['error' => $error], 500);
        }
        curl_close($ch);

        return response()->json(json_decode($result, true));
    }
}
