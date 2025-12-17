<?php

class Category {
    private $conn;
    private $table = 'categories';

    public $category_id;
    public $user_id;
    public $name;
    public $type;
    public $icon;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Read All Categories (Default + User Custom)
    public function readAll() {
        // Select logic: Get defaults (user_id IS NULL) OR user's own categories (user_id = :user_id)
        $query = "SELECT * FROM " . $this->table . " WHERE user_id IS NULL OR user_id = :user_id ORDER BY type, name";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $this->user_id); // Even if null, we bind for user custom ones
        $stmt->execute();
        return $stmt;
    }
}
