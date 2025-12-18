<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class ProfileController {
    private $conn;
    private $user_id;

    public function __construct($user_id) {
        $database = new Database();
        $this->conn = $database->getConnection();
        $this->user_id = $user_id;
    }

    public function getProfile() {
        // user_id is already set via constructor
        $user_id = $this->user_id;

        try {
            // Get Basic User Info
            $stmt = $this->conn->prepare("SELECT id, name, email FROM users WHERE id = ?");
            $stmt->execute([$user_id]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$user) {
                Response::send(404, false, 'User not found');
                return;
            }

            // Get Extended Profile
            $stmtProfile = $this->conn->prepare("SELECT * FROM user_profiles WHERE user_id = ?");
            $stmtProfile->execute([$user_id]);
            $profile = $stmtProfile->fetch(PDO::FETCH_ASSOC);

            // Merge data
            $data = [
                'user' => $user,
                'profile' => $profile ? $profile : null // Null if not set yet
            ];

            Response::send(200, true, 'Profile retrieved successfully', $data);

        } catch (PDOException $e) {
            Response::send(500, false, 'Database error: ' . $e->getMessage());
        }
    }

    public function updateProfile() {
        $user_id = $this->user_id;
        $data = json_decode(file_get_contents("php://input"), true);

        // Fields for User Account
        $name = isset($data['name']) ? trim($data['name']) : null;
        $email = isset($data['email']) ? trim($data['email']) : null;

        // Fields for Extended Profile
        $monthly_income = isset($data['monthly_income']) ? $data['monthly_income'] : 0;
        $average_expense = isset($data['average_expense']) ? $data['average_expense'] : 0;
        $risk_appetite = isset($data['risk_appetite']) ? $data['risk_appetite'] : 'moderate';
        $financial_goals = isset($data['financial_goals']) ? $data['financial_goals'] : '';

        try {
            $this->conn->beginTransaction();

            // 1. Update User Account (Name/Email) if provided
            if ($name || $email) {
                $updateUserQuery = "UPDATE users SET name = COALESCE(:name, name), email = COALESCE(:email, email) WHERE user_id = :uid";
                $stmtUser = $this->conn->prepare($updateUserQuery);
                // COALESCE keeps existing value if param is null, but we passed explicit values. 
                // Better: Only update if logic demands. For now, simple update.
                $stmtUser->bindParam(':name', $name);
                $stmtUser->bindParam(':email', $email);
                $stmtUser->bindParam(':uid', $user_id);
                $stmtUser->execute();
            }

            // 2. Check/Update Profile
            $checkStmt = $this->conn->prepare("SELECT profile_id FROM user_profiles WHERE user_id = ?");
            $checkStmt->execute([$user_id]);
            $exists = $checkStmt->fetch();

            if ($exists) {
                $query = "UPDATE user_profiles 
                          SET monthly_income = :income, 
                              average_expense = :expense, 
                              risk_appetite = :risk, 
                              financial_goals = :goals 
                          WHERE user_id = :uid";
            } else {
                $query = "INSERT INTO user_profiles (user_id, monthly_income, average_expense, risk_appetite, financial_goals) 
                          VALUES (:uid, :income, :expense, :risk, :goals)";
            }

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':uid', $user_id);
            $stmt->bindParam(':income', $monthly_income);
            $stmt->bindParam(':expense', $average_expense);
            $stmt->bindParam(':risk', $risk_appetite);
            $stmt->bindParam(':goals', $financial_goals);
            $stmt->execute();

            $this->conn->commit();
            Response::send(200, true, 'Profile updated successfully');

        } catch (PDOException $e) {
            $this->conn->rollBack();
            Response::send(500, false, 'Database error: ' . $e->getMessage());
        }
    }
}
