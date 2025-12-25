<?php
// src/backend/diagnostic.php
header('Content-Type: text/plain');
require_once 'config/database.php';

try {
    $database = new Database();
    $conn = $database->getConnection();
    
    // Hardcoded user_id for testing (Phase 1 usually has user_id=1)
    // You can change this if you are a different user
    $user_id = 4; 

    echo "=== DIAGNOSTIC REPORT FOR USER ID: $user_id ===\n\n";
    echo "Current Server Time: " . date('Y-m-d H:i:s') . "\n\n";

    // 1.5 Check Users
    echo "1.5 Checking Users Table:\n";
    $stmt = $conn->query("SELECT user_id, name, email FROM users");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($users as $u) {
        echo "   - User ID: {$u['user_id']}, Name: {$u['name']}, Email: {$u['email']}\n";
    }
    echo "\n";

    // 2. Check Transactions (ALL, not just this month)
    echo "2. Checking ALL Transactions for User ID $user_id:\n";
    $stmt = $conn->prepare("SELECT * FROM transactions WHERE user_id = ? ORDER BY transaction_date DESC LIMIT 5");
    $stmt->execute([$user_id]);
    $trans = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (count($trans) > 0) {
        echo "   [OK] Found " . count($trans) . " recent transactions (Total).\n";
        foreach ($trans as $t) {
            echo "   - Date: {$t['transaction_date']}, Amount: {$t['amount']}, Type: {$t['transaction_type']}\n";
        }
    } else {
        echo "   [FAIL] No transactions found AT ALL for User ID $user_id.\n";
        
        // Check if ANY transaction exists for ANY user
        $stmtAll = $conn->query("SELECT COUNT(*) as total FROM transactions");
        $totalAll = $stmtAll->fetch(PDO::FETCH_ASSOC);
        echo "   [INFO] Total transactions in entire database (all users): " . $totalAll['total'] . "\n";
    }
    echo "\n";

    // 3. Check Budgets
    echo "3. Checking Budgets Table:\n";
    $stmt = $conn->prepare("SELECT * FROM budgets WHERE user_id = ?");
    $stmt->execute([$user_id]);
    $budgets = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (count($budgets) > 0) {
        echo "   [OK] Found " . count($budgets) . " budgets.\n";
    } else {
        echo "   [INFO] No budgets set.\n";
    }
    echo "\n";

    // 4. SIMULATION: Try to Insert a Dummy Transaction
    echo "4. SIMULATION: Attempting to Insert Test Transaction...\n";
    try {
        $conn->beginTransaction();
        
        // Get valid wallet and category
        $wStmt = $conn->prepare("SELECT wallet_id FROM wallets WHERE user_id = ? LIMIT 1");
        $wStmt->execute([$user_id]);
        $wallet = $wStmt->fetch(PDO::FETCH_ASSOC);
        
        $cStmt = $conn->query("SELECT category_id FROM categories WHERE type='expense' LIMIT 1");
        $category = $cStmt->fetch(PDO::FETCH_ASSOC);
        
        if ($wallet && $category) {
            echo "   Using Wallet ID: {$wallet['wallet_id']} and Category ID: {$category['category_id']}\n";
            
            $sql = "INSERT INTO transactions (user_id, wallet_id, category_id, amount, transaction_type, description, transaction_date) 
                    VALUES (?, ?, ?, 10000, 'expense', 'Diagnostic Test', NOW())";
            $insStmt = $conn->prepare($sql);
            
            if ($insStmt->execute([$user_id, $wallet['wallet_id'], $category['category_id']])) {
                echo "   [SUCCESS] Transaction inserted successfully! (Rolling back now to keep DB clean)\n";
            } else {
                $err = $insStmt->errorInfo();
                echo "   [FAIL] SQL Error: " . print_r($err, true) . "\n";
            }
        } else {
            echo "   [FAIL] Cannot test insert: No wallet or category found for User ID $user_id.\n";
            if (!$wallet) echo "   -> Missing Wallet!\n";
            if (!$category) echo "   -> Missing Category!\n";
        }
        
        $conn->rollBack(); // Always rollback test data
        
    } catch (Exception $e) {
        $conn->rollBack();
        echo "   [CRITICAL FAIL] Exception: " . $e->getMessage() . "\n";
    }
    echo "\n";

    // 4. Test Summary Query (The Fallback)
    echo "4. Testing Financial Summary Query:\n";
    $query = "SELECT 
              SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END) as income,
              SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END) as expense
              FROM transactions 
              WHERE user_id = ? 
              AND MONTH(transaction_date) = MONTH(CURDATE()) 
              AND YEAR(transaction_date) = YEAR(CURDATE())";
    
    $stmt = $conn->prepare($query);
    $stmt->execute([$user_id]);
    $totals = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo "   Income: " . ($totals['income'] ?? 0) . "\n";
    echo "   Expense: " . ($totals['expense'] ?? 0) . "\n";
    
    if (($totals['income'] ?? 0) > 0 || ($totals['expense'] ?? 0) > 0) {
        echo "   [OK] Data exists for summary generation.\n";
    } else {
        echo "   [FAIL] Summary query returned 0. The fallback insight will say 'Belum Ada Cukup Data'.\n";
    }

} catch (Exception $e) {
    echo "CRITICAL ERROR: " . $e->getMessage();
}
