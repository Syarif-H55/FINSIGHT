<?php

class Wallet {
    private $conn;
    private $table = 'wallets';

    public $wallet_id;
    public $user_id;
    public $wallet_name;
    public $type;
    public $balance;
    public $created_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Create Wallet
    public function create() {
        $query = "INSERT INTO " . $this->table . " SET user_id=:user_id, wallet_name=:wallet_name, type=:type, balance=:balance";
        $stmt = $this->conn->prepare($query);

        // Sanitize
        $this->wallet_name = htmlspecialchars(strip_tags($this->wallet_name));
        $this->type = htmlspecialchars(strip_tags($this->type));
        $this->balance = htmlspecialchars(strip_tags($this->balance));

        // Bind
        $stmt->bindParam(':user_id', $this->user_id);
        $stmt->bindParam(':wallet_name', $this->wallet_name);
        $stmt->bindParam(':type', $this->type);
        $stmt->bindParam(':balance', $this->balance);

        if ($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Read All Wallets for a User
    public function readAll() {
        $query = "SELECT * FROM " . $this->table . " WHERE user_id = :user_id ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $this->user_id);
        $stmt->execute();
        return $stmt;
    }

    // Read One Wallet
    public function readOne() {
        $query = "SELECT * FROM " . $this->table . " WHERE wallet_id = :wallet_id AND user_id = :user_id LIMIT 0,1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':wallet_id', $this->wallet_id);
        $stmt->bindParam(':user_id', $this->user_id);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            $this->wallet_name = $row['wallet_name'];
            $this->type = $row['type'];
            $this->balance = $row['balance'];
            return true;
        }
        return false;
    }

    // Update Wallet
    public function update() {
        $query = "UPDATE " . $this->table . " SET wallet_name = :wallet_name, type = :type, balance = :balance WHERE wallet_id = :wallet_id AND user_id = :user_id";
        $stmt = $this->conn->prepare($query);

        // Sanitize
        $this->wallet_name = htmlspecialchars(strip_tags($this->wallet_name));
        $this->type = htmlspecialchars(strip_tags($this->type));
        $this->balance = htmlspecialchars(strip_tags($this->balance));

        // Bind
        $stmt->bindParam(':wallet_name', $this->wallet_name);
        $stmt->bindParam(':type', $this->type);
        $stmt->bindParam(':balance', $this->balance);
        $stmt->bindParam(':wallet_id', $this->wallet_id);
        $stmt->bindParam(':user_id', $this->user_id);

        if ($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Delete Wallet
    public function delete() {
        $query = "DELETE FROM " . $this->table . " WHERE wallet_id = :wallet_id AND user_id = :user_id";
        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(':wallet_id', $this->wallet_id);
        $stmt->bindParam(':user_id', $this->user_id);

        if ($stmt->execute()) {
            return true;
        }
        return false;
    }
}
