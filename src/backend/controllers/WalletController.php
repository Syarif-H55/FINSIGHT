<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/Wallet.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';

class WalletController {
    private $db;
    private $wallet;
    private $userId;

    public function __construct($userId) {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->wallet = new Wallet($this->db);
        $this->userId = $userId;
    }

    public function create() {
        $data = json_decode(file_get_contents("php://input"));

        if (!empty($data->wallet_name) && !empty($data->type) && isset($data->balance)) {
            $this->wallet->user_id = $this->userId;
            $this->wallet->wallet_name = $data->wallet_name;
            $this->wallet->type = $data->type;
            $this->wallet->balance = $data->balance;

            if ($this->wallet->create()) {
                Response::send(true, "Wallet created successfully.", [], 201);
            } else {
                Response::send(false, "Unable to create wallet.", [], 503);
            }
        } else {
            Response::send(false, "Incomplete data.", [], 400);
        }
    }

    public function readAll() {
        $this->wallet->user_id = $this->userId;
        $stmt = $this->wallet->readAll();
        $num = $stmt->rowCount();

        if ($num >= 0) {
            $wallets_arr = [];
            
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                extract($row);
                $wallet_item = [
                    "wallet_id" => $wallet_id,
                    "wallet_name" => $wallet_name,
                    "type" => $type,
                    "balance" => $balance,
                    "created_at" => $created_at
                ];
                array_push($wallets_arr, $wallet_item);
            }
            Response::send(true, "Wallets retrieved.", $wallets_arr);
        }
    }

    public function update($id) {
        $data = json_decode(file_get_contents("php://input"));
        
        $this->wallet->wallet_id = $id;
        $this->wallet->user_id = $this->userId;
        
        // Need to read existing first if partial update, but for now expect full data or handle accordingly
        // For simplicity:
        if (!empty($data->wallet_name) && !empty($data->type) && isset($data->balance)) {
            $this->wallet->wallet_name = $data->wallet_name;
            $this->wallet->type = $data->type;
            $this->wallet->balance = $data->balance;

            if ($this->wallet->update()) {
                Response::send(true, "Wallet updated.");
            } else {
                Response::send(false, "Unable to update wallet.");
            }
        } else {
            Response::send(false, "Incomplete data.");
        }
    }

    public function delete($id) {
        $this->wallet->wallet_id = $id;
        $this->wallet->user_id = $this->userId;

        if ($this->wallet->delete()) {
            Response::send(true, "Wallet deleted.");
        } else {
            Response::send(false, "Unable to delete wallet.");
        }
    }
}
