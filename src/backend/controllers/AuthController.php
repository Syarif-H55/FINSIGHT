<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/JWT.php';

class AuthController {
    private $db;
    private $user;
    private $jwt;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->user = new User($this->db);
        $this->jwt = new JWTHandler();
    }

    public function register() {
        $data = json_decode(file_get_contents("php://input"));

        if (!empty($data->name) && !empty($data->email) && !empty($data->password)) {
            $this->user->name = $data->name;
            $this->user->email = $data->email;
            $this->user->password = $data->password;

            if ($this->user->create()) {
                Response::send(true, "User registered successfully.", [], 201);
            } else {
                Response::send(false, "Email already exists or registration failed.", [], 400); // 400 Bad Request
            }
        } else {
            Response::send(false, "Incomplete data. Name, email, and password required.", [], 400);
        }
    }

    public function login() {
        $data = json_decode(file_get_contents("php://input"));

        if (!empty($data->email) && !empty($data->password)) {
            $this->user->email = $data->email;

            if ($this->user->emailExists() && password_verify($data->password, $this->user->password)) {
                $token = $this->jwt->generateToken($this->user->user_id);
                Response::send(true, "Login successful.", [
                    "token" => $token,
                    "user" => [
                        "id" => $this->user->user_id,
                        "name" => $this->user->name,
                        "email" => $this->user->email
                    ]
                ]);
            } else {
                Response::send(false, "Invalid credentials.", [], 401);
            }
        } else {
            Response::send(false, "Incomplete data. Email and password required.", [], 400);
        }
    }
}
