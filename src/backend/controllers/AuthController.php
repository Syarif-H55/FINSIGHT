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
                // Create default profile for the new user
                $query = "INSERT INTO user_profiles (user_id, monthly_income, average_expense, risk_appetite, financial_goals) VALUES (:uid, 0, 0, 'moderate', '')";
                $stmt = $this->db->prepare($query);
                $stmt->bindParam(':uid', $this->user->user_id);
                
                if ($stmt->execute()) {
                    Response::send(true, "User registered successfully.", [], 201);
                } else {
                    // If profile creation fails, consider rolling back user creation or logging an error
                    Response::send(false, "User registered but failed to create profile.", [], 500); // Internal Server Error
                }
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
