<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/Transaction.php';
require_once __DIR__ . '/../models/Category.php'; // For category fetching
require_once __DIR__ . '/../utils/Response.php';

class TransactionController {
    private $db;
    private $transaction;
    private $category;
    private $userId;

    public function __construct($userId) {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->transaction = new Transaction($this->db);
        $this->category = new Category($this->db);
        $this->userId = $userId;
    }

    public function create() {
        $data = json_decode(file_get_contents("php://input"));

        if (
            !empty($data->wallet_id) && 
            !empty($data->category_id) && 
            !empty($data->amount) && 
            !empty($data->transaction_type) && 
            !empty($data->transaction_date)
        ) {
            $this->transaction->user_id = $this->userId;
            $this->transaction->wallet_id = $data->wallet_id;
            $this->transaction->category_id = $data->category_id;
            $this->transaction->amount = $data->amount;
            $this->transaction->transaction_type = $data->transaction_type;
            $this->transaction->description = $data->description ?? '';
            $this->transaction->transaction_date = $data->transaction_date;

            if ($this->transaction->create()) {
                Response::send(true, "Transaction created successfully.", [], 201);
            } else {
                Response::send(false, "Unable to create transaction.", [], 503);
            }
        } else {
            Response::send(false, "Incomplete data.", [], 400);
        }
    }

    public function readAll() {
        $this->transaction->user_id = $this->userId;
        $stmt = $this->transaction->readAll();
        $transactions_arr = [];
        
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            array_push($transactions_arr, $row);
        }
        Response::send(true, "Transactions retrieved.", $transactions_arr);
    }

    public function delete($id) {
        $this->transaction->transaction_id = $id;
        $this->transaction->user_id = $this->userId;

        if ($this->transaction->delete()) {
            Response::send(true, "Transaction deleted.");
        } else {
            Response::send(false, "Unable to delete transaction.");
        }
    }

    // Helper to get categories for UI
    public function getCategories() {
        $this->category->user_id = $this->userId;
        $stmt = $this->category->readAll();
        $categories_arr = [];

        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            array_push($categories_arr, $row);
        }
        Response::send(true, "Categories retrieved.", $categories_arr);
    }
}
