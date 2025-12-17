<?php

class Budget {
    private $conn;
    private $table = 'budgets';

    public $budget_id;
    public $user_id;
    public $category_id;
    public $wallet_id;
    public $allocated_amount;
    public $start_date;
    public $end_date;
    public $created_at;

    // Properties for Joins
    public $category_name;
    public $wallet_name;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function create() {
        $query = "INSERT INTO " . $this->table . " 
                  SET user_id=:user_id, category_id=:category_id, wallet_id=:wallet_id, 
                      allocated_amount=:allocated_amount, start_date=:start_date, end_date=:end_date";

        $stmt = $this->conn->prepare($query);

        $this->user_id = htmlspecialchars(strip_tags($this->user_id));
        $this->category_id = htmlspecialchars(strip_tags($this->category_id));
        $this->wallet_id = !empty($this->wallet_id) ? htmlspecialchars(strip_tags($this->wallet_id)) : null;
        $this->allocated_amount = htmlspecialchars(strip_tags($this->allocated_amount));
        $this->start_date = htmlspecialchars(strip_tags($this->start_date));
        $this->end_date = htmlspecialchars(strip_tags($this->end_date));

        $stmt->bindParam(":user_id", $this->user_id);
        $stmt->bindParam(":category_id", $this->category_id);
        $stmt->bindParam(":wallet_id", $this->wallet_id);
        $stmt->bindParam(":allocated_amount", $this->allocated_amount);
        $stmt->bindParam(":start_date", $this->start_date);
        $stmt->bindParam(":end_date", $this->end_date);

        if ($stmt->execute()) {
            return true;
        }

        return false;
    }

    public function readAll() {
        $query = "SELECT b.*, c.name as category_name, w.wallet_name 
                  FROM " . $this->table . " b 
                  LEFT JOIN categories c ON b.category_id = c.category_id 
                  LEFT JOIN wallets w ON b.wallet_id = w.wallet_id 
                  WHERE b.user_id = :user_id 
                  ORDER BY b.end_date DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":user_id", $this->user_id);
        $stmt->execute();

        return $stmt;
    }

    public function delete() {
        $query = "DELETE FROM " . $this->table . " WHERE budget_id = :budget_id AND user_id = :user_id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":budget_id", $this->budget_id);
        $stmt->bindParam(":user_id", $this->user_id);

        if ($stmt->execute()) {
            return true;
        }
        return false;
    }
}
