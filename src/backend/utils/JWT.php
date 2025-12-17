<?php

class JWTHandler {
    private $secret_key;

    public function __construct() {
        $this->secret_key = getenv('JWT_SECRET') ?: 'default_secret_key_change_me';
    }

    public function generateToken($user_id) {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload = json_encode([
            'user_id' => $user_id,
            'exp' => time() + (60 * 60 * 24) // 24 hours expiration
        ]);

        $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
        $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));

        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $this->secret_key, true);
        $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

        return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    }

    public function validateToken($token) {
        $metrics = explode('.', $token);

        if (count($metrics) !== 3) {
            return false;
        }

        $header = $metrics[0];
        $payload = $metrics[1];
        $signatureProvided = $metrics[2];

        $signature = hash_hmac('sha256', $header . "." . $payload, $this->secret_key, true);
        $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

        if ($base64UrlSignature === $signatureProvided) {
            $decodedPayload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $payload)), true);
            
            // Check Expiration
            if (isset($decodedPayload['exp']) && $decodedPayload['exp'] < time()) {
                return false;
            }

            return $decodedPayload;
        }

        return false;
    }
}
