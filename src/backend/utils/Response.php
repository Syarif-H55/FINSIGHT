<?php

class Response {
    public static function send($success, $message, $data = [], $code = 200) {
        http_response_code($code);
        echo json_encode([
            "success" => $success,
            "message" => $message,
            "data" => $data
        ]);
        exit();
    }
}
