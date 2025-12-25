<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/Response.php';

class InsightController {
    private $conn;
    private $user_id;

    public function __construct($user_id) {
        $database = new Database();
        $this->conn = $database->getConnection();
        $this->user_id = $user_id;
    }

    public function getInsights() {
        $insights = [];

        // Generate all types of insights
        $insights = array_merge($insights, $this->generateBudgetWarnings());
        $insights = array_merge($insights, $this->generateSpendingPatterns());
        $insights = array_merge($insights, $this->generateSavingsOpportunities());
        $insights = array_merge($insights, $this->generateUnusualSpending());
        
        // ALWAYS generate a summary insight if no specific warnings found, or as a general status
        if (empty($insights)) {
             $insights[] = $this->generateFinancialSummary();
        }

        Response::send(200, true, 'Insights generated successfully', ['insights' => $insights]);
    }

    private function generateFinancialSummary() {
        // Calculate total income and expense for this month
        $query = "SELECT 
                  SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END) as income,
                  SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END) as expense
                  FROM transactions 
                  WHERE user_id = :uid 
                  AND MONTH(transaction_date) = MONTH(CURDATE()) 
                  AND YEAR(transaction_date) = YEAR(CURDATE())";
                  
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':uid', $this->user_id);
        $stmt->execute();
        $totals = $stmt->fetch(PDO::FETCH_ASSOC);
        
        $income = $totals['income'] ?? 0;
        $expense = $totals['expense'] ?? 0;
        $net = $income - $expense;
        
        if ($income > 0) {
            $savingsRate = (($income - $expense) / $income) * 100;
             if ($savingsRate > 20) {
                return [
                    'insight_type' => 'spending_pattern',
                    'severity' => 'success',
                    'title' => 'Kesehatan Keuangan Baik',
                    'message' => sprintf('Anda hemat %s%% dari pendapatan bulan ini. Pertahankan!', number_format($savingsRate, 1)),
                    'created_at' => date('Y-m-d H:i:s')
                ];
            } elseif ($savingsRate > 0) {
                return [
                    'insight_type' => 'spending_pattern',
                    'severity' => 'info',
                    'title' => 'Cashflow Positif',
                    'message' => 'Pemasukan Anda lebih besar dari pengeluaran bulan ini. Coba tingkatkan tabungan.',
                    'created_at' => date('Y-m-d H:i:s')
                ];
            } else {
                 return [
                    'insight_type' => 'budget_warning',
                    'severity' => 'warning',
                    'title' => 'Cashflow Negatif',
                    'message' => 'Pengeluaran Anda melebihi pemasukan bulan ini. Periksa kembali anggaran Anda.',
                    'created_at' => date('Y-m-d H:i:s')
                ];
            }
        } elseif ($expense > 0) {
             return [
                'insight_type' => 'budget_warning',
                'severity' => 'warning',
                'title' => 'Perhatian Cashflow',
                'message' => sprintf('Anda mencatat pengeluaran Rp %s namun belum ada pemasukan bulan ini.', number_format($expense, 0, ',', '.')),
                'created_at' => date('Y-m-d H:i:s')
            ];
        }
        
        return [
            'insight_type' => 'spending_pattern',
            'severity' => 'info',
            'title' => 'Belum Ada Cukup Data',
            'message' => 'Mulai catat pemasukan dan pengeluaran untuk melihat analisis keuangan Anda.',
            'created_at' => date('Y-m-d H:i:s')
        ];
    }

    private function generateBudgetWarnings() {
        $insights = [];
        $currentMonth = date('Y-m');

        try {
            // Get all active budgets for current month
            $query = "SELECT b.budget_id, b.allocated_amount, b.start_date, b.end_date, c.name as category_name,
                      (SELECT COALESCE(SUM(t.amount), 0) 
                       FROM transactions t 
                       WHERE t.user_id = :uid 
                       AND t.category_id = b.category_id 
                       AND t.transaction_type = 'expense'
                       AND t.transaction_date BETWEEN b.start_date AND b.end_date) as spent
                      FROM budgets b
                      JOIN categories c ON b.category_id = c.category_id
                      WHERE b.user_id = :uid
                      AND :current_date BETWEEN b.start_date AND b.end_date";
            
            $stmt = $this->conn->prepare($query);
            $currentDate = date('Y-m-d');
            $stmt->bindParam(':uid', $this->user_id);
            $stmt->bindParam(':current_date', $currentDate);
            $stmt->execute();
            $budgets = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($budgets as $budget) {
                if ($budget['allocated_amount'] > 0) {
                    $percentage = ($budget['spent'] / $budget['allocated_amount']) * 100;
                    $remaining = $budget['allocated_amount'] - $budget['spent'];
                    $daysLeft = (strtotime($budget['end_date']) - time()) / (60 * 60 * 24);

                    if ($percentage >= 100) {
                        $insights[] = [
                            'insight_type' => 'budget_warning',
                            'severity' => 'danger',
                            'title' => 'Budget ' . $budget['category_name'] . ' Terlampaui!',
                            'message' => sprintf(
                                'Budget kategori "%s" sudah terlampaui %.0f%%. Total: Rp %s / Rp %s.',
                                $budget['category_name'],
                                $percentage,
                                number_format($budget['spent'], 0, ',', '.'),
                                number_format($budget['allocated_amount'], 0, ',', '.')
                            ),
                            'created_at' => date('Y-m-d H:i:s')
                        ];
                    } elseif ($percentage >= 75) { // Lowered to 75%
                         $insights[] = [
                            'insight_type' => 'budget_warning',
                            'severity' => 'warning',
                            'title' => 'Budget ' . $budget['category_name'] . ' Hampir Habis',
                            'message' => sprintf(
                                'Budget kategori "%s" sudah mencapai %.0f%%. Sisa: Rp %s.',
                                $budget['category_name'],
                                $percentage,
                                number_format($remaining, 0, ',', '.')
                            ),
                            'created_at' => date('Y-m-d H:i:s')
                        ];
                    }
                }
            }
        } catch (PDOException $e) {
            error_log("Budget warnings error: " . $e->getMessage());
        }

        return $insights;
    }

    private function generateSpendingPatterns() {
        $insights = [];
        
        try {
            // Compare weekend vs weekday spending (last 30 days)
            $query = "SELECT 
                      SUM(CASE WHEN DAYOFWEEK(transaction_date) IN (1, 7) THEN amount ELSE 0 END) as weekend_spending,
                      SUM(CASE WHEN DAYOFWEEK(transaction_date) NOT IN (1, 7) THEN amount ELSE 0 END) as weekday_spending,
                      COUNT(DISTINCT CASE WHEN DAYOFWEEK(transaction_date) IN (1, 7) THEN transaction_date END) as weekend_days,
                      COUNT(DISTINCT CASE WHEN DAYOFWEEK(transaction_date) NOT IN (1, 7) THEN transaction_date END) as weekday_days
                      FROM transactions
                      WHERE user_id = :uid
                      AND transaction_type = 'expense'
                      AND transaction_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':uid', $this->user_id);
            $stmt->execute();
            $pattern = $stmt->fetch(PDO::FETCH_ASSOC);

            // Avoid division by zero
            $weekendDays = $pattern['weekend_days'] > 0 ? $pattern['weekend_days'] : 1;
            $weekdayDays = $pattern['weekday_days'] > 0 ? $pattern['weekday_days'] : 1;

            if ($pattern['weekend_spending'] > 0 || $pattern['weekday_spending'] > 0) {
                $avgWeekend = $pattern['weekend_spending'] / $weekendDays;
                $avgWeekday = $pattern['weekday_spending'] / $weekdayDays;

                // Threshold lowered to 1.3
                if ($avgWeekend > $avgWeekday * 1.3) {
                     $insights[] = [
                        'insight_type' => 'spending_pattern',
                        'severity' => 'info',
                        'title' => 'Pengeluaran Weekend Lebih Tinggi',
                        'message' => sprintf(
                            'Rata-rata weekend (Rp %s) lebih tinggi dari weekday (Rp %s).',
                            number_format($avgWeekend, 0, ',', '.'),
                            number_format($avgWeekday, 0, ',', '.')
                        ),
                        'created_at' => date('Y-m-d H:i:s')
                    ];
                }
            }
        } catch (PDOException $e) {
            error_log("Spending patterns error: " . $e->getMessage());
        }

        return $insights;
    }

    private function generateSavingsOpportunities() {
        $insights = [];
        
        try {
            // Find top expense categories (last 30 days)
            $query = "SELECT c.name as category_name, SUM(t.amount) as total,
                      (SELECT SUM(amount) FROM transactions WHERE user_id = :uid AND transaction_type = 'expense' AND transaction_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)) as grand_total
                      FROM transactions t
                      JOIN categories c ON t.category_id = c.category_id
                      WHERE t.user_id = :uid
                      AND t.transaction_type = 'expense'
                      AND t.transaction_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
                      GROUP BY t.category_id, c.name
                      ORDER BY total DESC
                      LIMIT 3";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':uid', $this->user_id);
            $stmt->execute();
            $topCategories = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($topCategories as $category) {
                if ($category['grand_total'] > 0) {
                    $percentage = ($category['total'] / $category['grand_total']) * 100;
                    
                    // Threshold lowered to 25%
                    if ($percentage > 25) {
                        $potentialSavings = $category['total'] * 0.1; // 10% reduction
                        $insights[] = [
                            'insight_type' => 'savings_opportunity',
                            'severity' => 'success',
                            'title' => 'Peluang Hemat: ' . $category['category_name'],
                            'message' => sprintf(
                                'Kategori "%s" menyerap %.0f%% pengeluaran. Kurangi sedikit untuk hemat Rp %s.',
                                $category['category_name'],
                                $percentage,
                                number_format($potentialSavings, 0, ',', '.')
                            ),
                            'created_at' => date('Y-m-d H:i:s')
                        ];
                    }
                }
            }
        } catch (PDOException $e) {
            error_log("Savings opportunities error: " . $e->getMessage());
        }

        return $insights;
    }

    private function generateUnusualSpending() {
        $insights = [];
        
        try {
            // Compare current month vs last month by category
            $query = "SELECT c.name as category_name,
                      (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE user_id = :uid AND category_id = c.category_id AND transaction_type = 'expense' AND MONTH(transaction_date) = MONTH(CURDATE()) AND YEAR(transaction_date) = YEAR(CURDATE())) as current_month,
                      (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE user_id = :uid AND category_id = c.category_id AND transaction_type = 'expense' AND MONTH(transaction_date) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) AND YEAR(transaction_date) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))) as last_month
                      FROM categories c
                      WHERE c.type = 'expense'
                      HAVING current_month > 0 OR last_month > 0";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':uid', $this->user_id);
            $stmt->execute();
            $comparisons = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($comparisons as $comp) {
                if ($comp['last_month'] > 0) {
                    $increase = (($comp['current_month'] - $comp['last_month']) / $comp['last_month']) * 100;
                    
                    if ($increase > 20) {
                        $insights[] = [
                            'insight_type' => 'spending_pattern',
                            'severity' => 'warning',
                            'title' => 'Lonjakan: ' . $comp['category_name'],
                            'message' => sprintf(
                                'Naik %.0f%% dibanding bulan lalu (Rp %s vs Rp %s).',
                                $increase,
                                number_format($comp['current_month'], 0, ',', '.'),
                                number_format($comp['last_month'], 0, ',', '.')
                            ),
                            'created_at' => date('Y-m-d H:i:s')
                        ];
                    }
                }
            }
        } catch (PDOException $e) {
            error_log("Unusual spending error: " . $e->getMessage());
        }

        return $insights;
    }
}
