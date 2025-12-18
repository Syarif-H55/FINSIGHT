<?php
require_once __DIR__ . '/config/database.php';

try {
    $database = new Database();
    $conn = $database->getConnection();

    $sql = file_get_contents(__DIR__ . '/../database/migrations.sql');

    // Split SQL by semicolon to execute multiple statements assuming simple structure
    // or just execute raw if driver supports it (PDO usually allows multiple queries if configured, but safe to split)
    
    // Basic split, might break on semicolons in strings but acceptable for this migration file
    // Cleaning comments might be needed
    
    $conn->exec($sql);
    echo "Database migration executed successfully.";

} catch (PDOException $e) {
    echo "Migration failed: " . $e->getMessage();
}
