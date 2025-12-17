<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/Budget.php';
require_once __DIR__ . '/../utils/Response.php';

class BudgetController {
    private $db;
    private $budget;
    private $userId;

    public function __construct($userId) {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->budget = new Budget($this->db);
        $this->userId = $userId;
    }

    public function create() {
        $data = json_decode(file_get_contents("php://input"));

        // Basic Validation
        if (
            !empty($data->category_id) && 
            !empty($data->allocated_amount) && 
            !empty($data->start_date) && 
            !empty($data->end_date)
        ) {
            $this->budget->user_id = $this->userId;
            $this->budget->category_id = $data->category_id;
            $this->budget->wallet_id = $data->wallet_id ?? null; // Optional
            $this->budget->allocated_amount = $data->allocated_amount;
            $this->budget->start_date = $data->start_date;
            $this->budget->end_date = $data->end_date;

            if ($this->budget->create()) {
                Response::send(true, "Budget created successfully.", [], 201);
            } else {
                Response::send(false, "Unable to create budget.", [], 503);
            }
        } else {
            Response::send(false, "Incomplete data.", [], 400);
        }
    }

    public function readAll() {
        $this->budget->user_id = $this->userId;
        $stmt = $this->budget->readAll();
        $budgets_arr = [];
        
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            array_push($budgets_arr, $row);
        }
        Response::send(true, "Budgets retrieved.", $budgets_arr);
    }

    public function delete($id) {
        $this->budget->budget_id = $id;
        $this->budget->user_id = $this->userId;

        if ($this->budget->delete()) {
            Response::send(true, "Budget deleted.");
        } else {
            Response::send(false, "Unable to delete budget.");
        }
    }
}
