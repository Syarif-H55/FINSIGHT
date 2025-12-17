<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle Preflight Options Request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = explode('/', $uri);

// Expected URI format: /backend/index.php/{resource}/{action}
// $uri[0] = ""
// $uri[1] = "backend"
// $uri[2] = "index.php"
// $uri[3] = "auth" (for example)

// Basic Routing
if (isset($uri[3])) {
    $resource = $uri[3];
    
    // AUTHENTICATION ROUTES
    if ($resource === 'auth') {
        require_once 'controllers/AuthController.php';
        $auth = new AuthController();
        
        if (isset($uri[4])) {
            $action = $uri[4];
            if ($action === 'register' && $_SERVER['REQUEST_METHOD'] === 'POST') {
                $auth->register();
            } elseif ($action === 'login' && $_SERVER['REQUEST_METHOD'] === 'POST') {
                $auth->login();
            } else {
                http_response_code(404);
                echo json_encode(["message" => "Action not found"]);
            }
        }
        exit();
    }

    // WALLET ROUTES (Protected)
    if ($resource === 'wallets') {
        require_once 'middleware/AuthMiddleware.php';
        require_once 'controllers/WalletController.php';
        
        // Validate Token
        $authMiddleware = new AuthMiddleware();
        $userData = $authMiddleware->validateToken(); // Returns decoded user payload
        $userId = $userData['user_id'];

        $walletController = new WalletController($userId);
        
        // Router Logic for Wallets
        $method = $_SERVER['REQUEST_METHOD'];
        $id = isset($uri[4]) ? $uri[4] : null;

        if ($method === 'POST') {
            $walletController->create();
        } elseif ($method === 'GET') {
            if ($id) { 
                // Implement readOne if needed, or filter in readAll
                // For now, readAll only
            } else {
                $walletController->readAll();
            }
        } elseif ($method === 'PUT' && $id) {
            $walletController->update($id);
        } elseif ($method === 'DELETE' && $id) {
            $walletController->delete($id);
        } else {
            http_response_code(405);
            echo json_encode(["message" => "Method Not Allowed"]);
        }
        exit();
    }

    // TRANSACTION ROUTES (Protected)
    if ($resource === 'transactions') {
        require_once 'middleware/AuthMiddleware.php';
        require_once 'controllers/TransactionController.php';
        
        $authMiddleware = new AuthMiddleware();
        $userData = $authMiddleware->validateToken();
        $userId = $userData['user_id'];

        $transactionController = new TransactionController($userId);
        
        $method = $_SERVER['REQUEST_METHOD'];
        $id = isset($uri[4]) ? $uri[4] : null;

        if ($method === 'POST') {
            $transactionController->create();
        } elseif ($method === 'GET') {
            $transactionController->readAll();
        } elseif ($method === 'DELETE' && $id) {
            $transactionController->delete($id);
        } else {
            http_response_code(405);
            echo json_encode(["message" => "Method Not Allowed"]);
        }
        exit();
    }

    // CATEGORY ROUTES (Protected)
    if ($resource === 'categories') {
        require_once 'middleware/AuthMiddleware.php';
        require_once 'controllers/TransactionController.php'; // Reuse controller for simplicity
        
        $authMiddleware = new AuthMiddleware();
        $userData = $authMiddleware->validateToken();
        $userId = $userData['user_id'];

        $transactionController = new TransactionController($userId);
        
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            $transactionController->getCategories();
        }
        exit();
    }

    // BUDGET ROUTES (Protected)
    if ($resource === 'budgets') {
        require_once 'middleware/AuthMiddleware.php';
        require_once 'controllers/BudgetController.php';
        
        $authMiddleware = new AuthMiddleware();
        $userData = $authMiddleware->validateToken();
        $userId = $userData['user_id'];

        $budgetController = new BudgetController($userId);
        
        $method = $_SERVER['REQUEST_METHOD'];
        $id = isset($uri[4]) ? $uri[4] : null;

        if ($method === 'POST') {
            $budgetController->create();
        } elseif ($method === 'GET') {
            $budgetController->readAll();
        } elseif ($method === 'DELETE' && $id) {
            $budgetController->delete($id);
        } else {
            http_response_code(405);
            echo json_encode(["message" => "Method Not Allowed"]);
        }
        exit();
    }
    // Default successful response for root test
    if ($resource === 'test') {
        echo json_encode([
            "success" => true,
            "message" => "FINSIGHT API is running!",
            "version" => "1.0"
        ]);
        exit();
    }
}

// Default Response
http_response_code(404);
echo json_encode(["message" => "Endpoint not found"]);
