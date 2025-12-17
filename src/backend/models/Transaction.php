<?php

class Transaction {
    private $conn;
    private $table = 'transactions';

    public $transaction_id;
    public $user_id;
    public $wallet_id;
    public $category_id;
    public $amount;
    public $transaction_type; // income / expense
    public $description;
    public $transaction_date;
    public $created_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function create() {
        try {
            $this->conn->beginTransaction();

            // 1. Insert Transaction
            $query = "INSERT INTO " . $this->table . " 
                      SET user_id=:user_id, wallet_id=:wallet_id, category_id=:category_id, 
                          amount=:amount, transaction_type=:type, description=:desc, transaction_date=:date";
            
            $stmt = $this->conn->prepare($query);

            // Sanitize
            $this->amount = htmlspecialchars(strip_tags($this->amount));
            $this->description = htmlspecialchars(strip_tags($this->description));

            // Bind
            $stmt->bindParam(':user_id', $this->user_id);
            $stmt->bindParam(':wallet_id', $this->wallet_id);
            $stmt->bindParam(':category_id', $this->category_id);
            $stmt->bindParam(':amount', $this->amount);
            $stmt->bindParam(':type', $this->transaction_type);
            $stmt->bindParam(':desc', $this->description);
            $stmt->bindParam(':date', $this->transaction_date);

            if (!$stmt->execute()) {
                throw new Exception("Failed to insert transaction.");
            }

            // 2. Update Wallet Balance
            $operator = ($this->transaction_type === 'income') ? '+' : '-';
            $updateQuery = "UPDATE wallets SET balance = balance $operator :amount WHERE wallet_id = :wallet_id";
            $updateStmt = $this->conn->prepare($updateQuery);
            $updateStmt->bindParam(':amount', $this->amount);
            $updateStmt->bindParam(':wallet_id', $this->wallet_id);

            if (!$updateStmt->execute()) {
                throw new Exception("Failed to update wallet balance.");
            }

            $this->conn->commit();
            return true;

        } catch (Exception $e) {
            $this->conn->rollBack();
            return false;
        }
    }

    public function readAll() {
        // Join with Categories and Wallets to get names
        $query = "SELECT t.*, c.name as category_name, c.icon as category_icon, w.wallet_name 
                  FROM " . $this->table . " t
                  JOIN categories c ON t.category_id = c.category_id
                  JOIN wallets w ON t.wallet_id = w.wallet_id
                  WHERE t.user_id = :user_id 
                  ORDER BY t.transaction_date DESC, t.created_at DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $this->user_id);
        $stmt->execute();
        return $stmt;
    }

    public function delete() {
        // Note: For full correctness, deleting a transaction should REVERSE the wallet balance.
        // Implementing strict reverse logic.
        
        try {
            $this->conn->beginTransaction();

            // 1. Get Transaction Details (Amount & Type) to reverse
            $getQuery = "SELECT amount, transaction_type, wallet_id FROM " . $this->table . " WHERE transaction_id = :id AND user_id = :user_id";
            $getStmt = $this->conn->prepare($getQuery);
            $getStmt->bindParam(':id', $this->transaction_id);
            $getStmt->bindParam(':user_id', $this->user_id);
            $getStmt->execute();
            
            if ($getStmt->rowCount() == 0) {
                throw new Exception("Transaction not found.");
            }

            $row = $getStmt->fetch(PDO::FETCH_ASSOC);
            $amount = $row['amount'];
            $type = $row['transaction_type'];
            $wallet_id = $row['wallet_id'];

            // 2. Delete Transaction
            $delQuery = "DELETE FROM " . $this->table . " WHERE transaction_id = :id";
            $delStmt = $this->conn->prepare($delQuery);
            $delStmt->bindParam(':id', $this->transaction_id);
            if (!$delStmt->execute()) {
                throw new Exception("Failed to delete transaction record.");
            }

            // 3. Reverse Wallet Balance
            // If it was income, we SUBTRACT. If expense, we ADD.
            $operator = ($type === 'income') ? '-' : '+';
            $updateQuery = "UPDATE wallets SET balance = balance $operator :amount WHERE wallet_id = :wallet_id";
            $updateStmt = $this->conn->prepare($updateQuery);
            $updateStmt->bindParam(':amount', $amount);
            $updateStmt->bindParam(':wallet_id', $wallet_id);

            if (!$updateStmt->execute()) {
                throw new Exception("Failed to revert wallet balance.");
            }

            $this->conn->commit();
            return true;

        } catch (Exception $e) {
            $this->conn->rollBack();
            return false;
        }
    }
}
