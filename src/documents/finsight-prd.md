# FINSIGHT - Product Requirements Detail (PRD)

**Version:** 1.0  
**Date:** December 17, 2024  
**Project:** Financial Insight (FINSIGHT)  
**Team:** Shelby Company Ltd.  
**Tech Stack:** PHP, HTML, CSS, JavaScript, MySQL, Docker

---

## 1. EXECUTIVE SUMMARY

### 1.1 Product Vision
FINSIGHT adalah dasbor keuangan pribadi modern AI-powered yang dirancang untuk memberi pengguna pandangan yang jelas dan mendalam tentang kesehatan keuangan mereka. WebApp yang melampaui pelacakan pengeluaran sederhana dengan menyediakan analisis mendalam dan rekomendasi yang dipersonalisasi untuk membantu pengguna membuat keputusan keuangan yang lebih cerdas.

### 1.2 Target Users
- **Primary:** Mahasiswa dan young professionals yang ingin mengelola keuangan pribadi
- **Scope:** Lingkup kampus (development focused, not production scale)

### 1.3 Success Criteria
1. Proyek selesai sesuai jadwal (Deadline: Early January 2026)
2. Hasil memenuhi standar kualitas dan persyaratan fungsional
3. Demo impressive di expo akhir semester
4. AI recommendations yang akurat dan helpful
5. Full integration: Frontend ↔ Backend ↔ Database

---

## 2. TECHNICAL ARCHITECTURE

### 2.1 Technology Stack

**Backend:**
- **Language:** PHP 8.1+
- **Architecture:** RESTful API (JSON responses)
- **Database:** MySQL 8.0+
- **Authentication:** JWT (JSON Web Token)

**Frontend:**
- **Languages:** HTML5, CSS3, JavaScript (ES6+)
- **CSS Framework:** Bootstrap 5 + Tailwind CSS
- **Charts:** Chart.js
- **HTTP Client:** Fetch API

**DevOps:**
- **Containerization:** Docker + Docker Compose
- **Services:** PHP-FPM, MySQL, phpMyAdmin

**External APIs:**
- **OpenAI API:** GPT-4 Turbo/GPT-3.5 Turbo for AI Chat Advisor

### 2.2 Project Structure

```
FINSIGHT/
├── docker-compose.yml
├── Dockerfile
├── README.md
└── src/
    ├── backend/
    │   ├── config/
    │   │   ├── database.php
    │   │   └── jwt.php
    │   ├── controllers/
    │   │   ├── AuthController.php
    │   │   ├── TransactionController.php
    │   │   ├── WalletController.php
    │   │   ├── BudgetController.php
    │   │   ├── InsightController.php
    │   │   └── AIController.php
    │   ├── models/
    │   │   ├── User.php
    │   │   ├── Transaction.php
    │   │   ├── Wallet.php
    │   │   ├── Budget.php
    │   │   └── Category.php
    │   ├── middleware/
    │   │   └── AuthMiddleware.php
    │   ├── utils/
    │   │   ├── Response.php
    │   │   ├── Validator.php
    │   │   └── FinancialCalculator.php
    │   └── index.php (API Router)
    ├── database/
    │   ├── migrations.sql
    │   └── seeds.sql
    └── frontend/
        ├── assets/
        │   ├── css/
        │   ├── js/
        │   └── img/
        ├── pages/
        │   ├── login.html
        │   ├── register.html
        │   ├── dashboard.html
        │   ├── transactions.html
        │   ├── budgets.html
        │   ├── wallets.html
        │   ├── insights.html
        │   └── ai-chat.html
        └── js/
            ├── api.js (API client)
            ├── auth.js
            ├── dashboard.js
            ├── transactions.js
            └── ai-chat.js
```

### 2.3 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    FINSIGHT ARCHITECTURE                 │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐         ┌──────────────┐             │
│  │   Browser    │ ◄─────► │  PHP Backend │             │
│  │  (Frontend)  │  REST   │   (API)      │             │
│  └──────────────┘  JSON   └──────┬───────┘             │
│                                   │                      │
│                            ┌──────▼───────┐             │
│                            │    MySQL     │             │
│                            │   Database   │             │
│                            └──────────────┘             │
│                                                          │
│  ┌──────────────────────────────────────┐              │
│  │  External: OpenAI API (Chat AI)      │              │
│  │  - Called from PHP Backend           │              │
│  │  - User context included in prompt   │              │
│  └──────────────────────────────────────┘              │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 3. DATABASE SCHEMA

### 3.1 Tables Overview

Based on provided ERD, the database consists of:

1. **users** - User accounts and profiles
2. **wallets** - Multiple wallet support (cash, bank, ewallet)
3. **categories** - Transaction categories (customizable)
4. **transactions** - All financial transactions
5. **budgets** - Category-based budgets
6. **recurring_transactions** - Automated recurring transactions
7. **financial_goals** - User financial goals and targets
8. **wallet_transfers** - Inter-wallet transfers
9. **ai_insights** - AI-generated insights (cached)
10. **notifications** - System notifications
11. **user_settings** - User preferences and settings
12. **user_profile** - Extended user financial profile

### 3.2 Key Relationships

```sql
users (1) ──── (N) wallets
users (1) ──── (N) categories
users (1) ──── (N) transactions
users (1) ──── (N) budgets
users (1) ──── (N) financial_goals
users (1) ──── (1) user_profile
users (1) ──── (1) user_settings

wallets (1) ──── (N) transactions
categories (1) ──── (N) transactions
categories (1) ──── (N) budgets
```

### 3.3 Database Implementation Requirements

**Migration File:** `database/migrations.sql`
- Create all tables with proper indexes
- Set foreign key constraints
- Set default values appropriately

**Seed File:** `database/seeds.sql`
- Default categories (Makanan, Transport, Hiburan, etc.)
- Sample user for testing
- Sample transactions for demo

---

## 4. API SPECIFICATIONS

### 4.1 API Conventions

**Base URL:** `http://localhost:8080/api`

**Response Format:**
```json
{
  "success": true/false,
  "message": "Response message",
  "data": { ... }
}
```

**Authentication:**
- Use JWT tokens
- Header: `Authorization: Bearer {token}`

### 4.2 Authentication Endpoints

#### POST /api/auth/register
**Description:** Register new user

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user_id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Validation Rules:**
- Name: required, min 3 chars
- Email: required, valid email, unique
- Password: required, min 8 chars

---

#### POST /api/auth/login
**Description:** User login

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user_id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

#### GET /api/auth/profile
**Description:** Get user profile (requires authentication)

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user_id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "profile": {
      "monthly_income": 5000000,
      "average_expense": 3500000,
      "risk_appetite": "moderate",
      "financial_goals": "Saving for investment"
    }
  }
}
```

---

### 4.3 Transaction Endpoints

#### GET /api/transactions
**Description:** Get all user transactions with optional filters

**Query Parameters:**
- `wallet_id` (optional): Filter by wallet
- `category_id` (optional): Filter by category
- `type` (optional): 'income' or 'expense'
- `start_date` (optional): YYYY-MM-DD
- `end_date` (optional): YYYY-MM-DD
- `limit` (optional): default 50
- `offset` (optional): default 0

**Response:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "transaction_id": 1,
        "wallet_id": 1,
        "wallet_name": "Dompet Utama",
        "category_id": 3,
        "category_name": "Makanan",
        "amount": 50000,
        "transaction_type": "expense",
        "description": "Makan siang",
        "transaction_date": "2024-12-15",
        "created_at": "2024-12-15 12:30:00"
      }
    ],
    "total": 100,
    "limit": 50,
    "offset": 0
  }
}
```

---

#### POST /api/transactions
**Description:** Create new transaction

**Request Body:**
```json
{
  "wallet_id": 1,
  "category_id": 3,
  "amount": 50000,
  "transaction_type": "expense",
  "description": "Makan siang",
  "transaction_date": "2024-12-15"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Transaction created successfully",
  "data": {
    "transaction_id": 1,
    "wallet_id": 1,
    "category_id": 3,
    "amount": 50000,
    "transaction_type": "expense",
    "description": "Makan siang",
    "transaction_date": "2024-12-15"
  }
}
```

**Validation:**
- wallet_id: required, must exist and belong to user
- category_id: required, must exist and belong to user
- amount: required, positive number
- transaction_type: required, enum('income','expense')
- transaction_date: required, valid date

**Business Logic:**
- Update wallet balance automatically
- If expense: wallet.balance -= amount
- If income: wallet.balance += amount

---

#### PUT /api/transactions/{id}
**Description:** Update transaction

**Request Body:** Same as POST

**Response:**
```json
{
  "success": true,
  "message": "Transaction updated successfully",
  "data": { /* updated transaction */ }
}
```

---

#### DELETE /api/transactions/{id}
**Description:** Delete transaction

**Response:**
```json
{
  "success": true,
  "message": "Transaction deleted successfully"
}
```

**Business Logic:**
- Reverse wallet balance change before deletion

---

### 4.4 Wallet Endpoints

#### GET /api/wallets
**Description:** Get all user wallets

**Response:**
```json
{
  "success": true,
  "data": {
    "wallets": [
      {
        "wallet_id": 1,
        "wallet_name": "Dompet Utama",
        "type": "cash",
        "balance": 1500000,
        "created_at": "2024-12-01"
      },
      {
        "wallet_id": 2,
        "wallet_name": "Bank BCA",
        "type": "bank",
        "balance": 5000000,
        "created_at": "2024-12-01"
      }
    ],
    "total_balance": 6500000
  }
}
```

---

#### POST /api/wallets
**Description:** Create new wallet

**Request Body:**
```json
{
  "wallet_name": "E-Wallet GoPay",
  "type": "ewallet",
  "balance": 500000
}
```

**Validation:**
- wallet_name: required, min 3 chars
- type: required, enum('cash','bank','ewallet')
- balance: optional, default 0

---

#### POST /api/wallets/transfer
**Description:** Transfer money between wallets

**Request Body:**
```json
{
  "from_wallet_id": 1,
  "to_wallet_id": 2,
  "amount": 500000,
  "notes": "Transfer ke tabungan"
}
```

**Business Logic:**
1. Deduct from source wallet
2. Add to destination wallet
3. Create wallet_transfer record
4. Return both updated wallet balances

---

### 4.5 Budget Endpoints

#### GET /api/budgets
**Description:** Get all budgets for current month

**Query Parameters:**
- `month` (optional): YYYY-MM, default current month

**Response:**
```json
{
  "success": true,
  "data": {
    "budgets": [
      {
        "budget_id": 1,
        "category_id": 3,
        "category_name": "Makanan",
        "wallet_id": 1,
        "allocated_amount": 1000000,
        "spent_amount": 750000,
        "percentage": 75,
        "status": "warning",
        "start_date": "2024-12-01",
        "end_date": "2024-12-31"
      }
    ],
    "total_allocated": 3000000,
    "total_spent": 2100000
  }
}
```

**Status Logic:**
- `active`: < 80% spent
- `warning`: 80-99% spent
- `over`: >= 100% spent

---

#### POST /api/budgets
**Description:** Create budget

**Request Body:**
```json
{
  "category_id": 3,
  "wallet_id": 1,
  "allocated_amount": 1000000,
  "start_date": "2024-12-01",
  "end_date": "2024-12-31"
}
```

---

### 4.6 Dashboard Endpoints

#### GET /api/dashboard
**Description:** Get dashboard summary data

**Response:**
```json
{
  "success": true,
  "data": {
    "financial_health_score": 78,
    "score_breakdown": {
      "savings_rate": 32,
      "debt_ratio": 15,
      "emergency_fund_months": 3.2
    },
    "monthly_summary": {
      "total_income": 5000000,
      "total_expense": 3400000,
      "net_cashflow": 1600000
    },
    "wallet_summary": {
      "total_balance": 6500000,
      "wallets_count": 3
    },
    "budget_summary": {
      "budgets_on_track": 4,
      "budgets_warning": 2,
      "budgets_over": 1
    },
    "recent_transactions": [ /* 5 most recent */ ]
  }
}
```

**Financial Health Score Calculation:**
```php
// Algorithm
$savings_rate = ($monthly_income - $monthly_expense) / $monthly_income * 100;
$debt_ratio = $total_debt / $monthly_income * 100;
$emergency_fund = $savings / $average_expense; // in months

$score = ($savings_rate * 0.4) + 
         ((100 - $debt_ratio) * 0.3) + 
         (min($emergency_fund, 6) * 10);

$score = min($score, 100); // Cap at 100
```

---

#### GET /api/dashboard/cashflow
**Description:** Get monthly cash flow data for chart

**Query Parameters:**
- `months` (optional): Number of months, default 6

**Response:**
```json
{
  "success": true,
  "data": {
    "labels": ["Jul 2024", "Aug 2024", "Sep 2024", "Oct 2024", "Nov 2024", "Dec 2024"],
    "income": [4500000, 5000000, 4800000, 5200000, 5000000, 5000000],
    "expense": [3200000, 3400000, 3600000, 3300000, 3500000, 3400000]
  }
}
```

---

### 4.7 Insights Endpoints (Rule-Based)

#### GET /api/insights
**Description:** Get automatic financial insights

**Response:**
```json
{
  "success": true,
  "data": {
    "insights": [
      {
        "insight_id": 1,
        "insight_type": "spending_pattern",
        "title": "Pengeluaran Weekend Tinggi",
        "message": "Pengeluaran Anda di weekend 35% lebih tinggi dibanding weekday. Rata-rata weekend: Rp 450k, weekday: Rp 280k.",
        "severity": "info",
        "created_at": "2024-12-15"
      },
      {
        "insight_id": 2,
        "insight_type": "budget_warning",
        "title": "Budget Makanan Hampir Habis",
        "message": "Budget kategori 'Makanan' sudah mencapai 85%. Sisa: Rp 150k untuk 15 hari.",
        "severity": "warning",
        "created_at": "2024-12-15"
      },
      {
        "insight_id": 3,
        "insight_type": "savings_opportunity",
        "title": "Peluang Hemat Transport",
        "message": "Pengeluaran transport Rp 800k/bulan. Dengan alternatif transportasi umum, potensial hemat Rp 400k.",
        "severity": "success",
        "created_at": "2024-12-14"
      }
    ]
  }
}
```

**Rule-Based Insight Types:**

1. **spending_pattern**
   - Weekend vs weekday comparison
   - Category spending trends
   - Unusual spending detection

2. **budget_warning**
   - Budget approaching 80%
   - Budget exceeded

3. **savings_opportunity**
   - High spending categories
   - Potential savings suggestions

4. **bill_forecast**
   - Upcoming recurring expenses
   - Bill reminders

---

### 4.8 AI Chat Endpoints (OpenAI Integration)

#### POST /api/ai/chat
**Description:** Send message to AI financial advisor

**Request Body:**
```json
{
  "message": "Gimana cara saya bisa hemat uang transport?",
  "conversation_id": null
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "conversation_id": "conv_123abc",
    "reply": "Berdasarkan data keuangan Anda, pengeluaran transport saat ini Rp 800.000 per bulan. Berikut beberapa saran:\n\n1. Gunakan transportasi umum untuk jarak jauh - potensial hemat 40%\n2. Pertimbangkan carpool dengan teman kuliah\n3. Jalan kaki atau sepeda untuk jarak < 2km\n\nDengan strategi ini, Anda bisa hemat hingga Rp 400.000 per bulan.",
    "timestamp": "2024-12-15 14:30:00"
  }
}
```

**OpenAI Integration Details:**

```php
// PHP Implementation Guide

class AIController {
    
    public function chat() {
        // 1. Get user message
        $message = $_POST['message'];
        $user_id = $this->getUserIdFromToken();
        
        // 2. Get user financial context
        $context = $this->getUserFinancialContext($user_id);
        
        // 3. Build prompt for OpenAI
        $prompt = $this->buildPrompt($message, $context);
        
        // 4. Call OpenAI API
        $response = $this->callOpenAI($prompt);
        
        // 5. Return response
        return $this->jsonResponse(true, 'Success', [
            'reply' => $response['reply']
        ]);
    }
    
    private function getUserFinancialContext($user_id) {
        // Get relevant financial data
        return [
            'monthly_income' => 5000000,
            'monthly_expense' => 3400000,
            'top_categories' => [
                ['name' => 'Makanan', 'amount' => 1200000],
                ['name' => 'Transport', 'amount' => 800000],
                ['name' => 'Hiburan', 'amount' => 600000]
            ],
            'savings_rate' => 32,
            'financial_goals' => 'Saving for laptop'
        ];
    }
    
    private function buildPrompt($message, $context) {
        $prompt = "Kamu adalah financial advisor yang membantu user mengelola keuangan pribadi.\n\n";
        $prompt .= "Data Keuangan User:\n";
        $prompt .= "- Pendapatan bulanan: Rp " . number_format($context['monthly_income']) . "\n";
        $prompt .= "- Pengeluaran bulanan: Rp " . number_format($context['monthly_expense']) . "\n";
        $prompt .= "- Savings rate: " . $context['savings_rate'] . "%\n";
        $prompt .= "- Top spending categories:\n";
        
        foreach ($context['top_categories'] as $cat) {
            $prompt .= "  * {$cat['name']}: Rp " . number_format($cat['amount']) . "\n";
        }
        
        $prompt .= "\nUser bertanya: {$message}\n\n";
        $prompt .= "Berikan advice yang:\n";
        $prompt .= "1. Spesifik berdasarkan data user\n";
        $prompt .= "2. Actionable dan practical\n";
        $prompt .= "3. Dalam Bahasa Indonesia\n";
        $prompt .= "4. Maksimal 150 kata\n";
        
        return $prompt;
    }
    
    private function callOpenAI($prompt) {
        $api_key = getenv('OPENAI_API_KEY');
        
        $data = [
            'model' => 'gpt-3.5-turbo',
            'messages' => [
                ['role' => 'system', 'content' => 'Kamu adalah financial advisor yang helpful.'],
                ['role' => 'user', 'content' => $prompt]
            ],
            'temperature' => 0.7,
            'max_tokens' => 300
        ];
        
        $ch = curl_init('https://api.openai.com/v1/chat/completions');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $api_key
        ]);
        
        $response = curl_exec($ch);
        curl_close($ch);
        
        $result = json_decode($response, true);
        
        return [
            'reply' => $result['choices'][0]['message']['content']
        ];
    }
}
```

**Environment Variable:**
```
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxx
```

---

### 4.9 Category Endpoints

#### GET /api/categories
**Description:** Get all user categories (default + custom)

**Response:**
```json
{
  "success": true,
  "data": {
    "income_categories": [
      {"category_id": 1, "name": "Gaji", "type": "income", "is_default": true},
      {"category_id": 2, "name": "Freelance", "type": "income", "is_default": true}
    ],
    "expense_categories": [
      {"category_id": 3, "name": "Makanan", "type": "expense", "is_default": true},
      {"category_id": 4, "name": "Transport", "type": "expense", "is_default": true},
      {"category_id": 5, "name": "Hiburan", "type": "expense", "is_default": true}
    ]
  }
}
```

---

#### POST /api/categories
**Description:** Create custom category

**Request Body:**
```json
{
  "name": "Kursus Online",
  "type": "expense"
}
```

---

## 5. FRONTEND SPECIFICATIONS

### 5.1 Pages & Features

#### 5.1.1 Login Page (`login.html`)

**Features:**
- Email & password input
- "Remember me" checkbox
- Login button
- Link to register page
- Form validation (client-side)

**API Integration:**
- POST /api/auth/login
- Store JWT token in localStorage
- Redirect to dashboard on success

**UI Elements:**
```html
<form id="loginForm">
  <input type="email" name="email" required>
  <input type="password" name="password" required>
  <button type="submit">Login</button>
  <a href="register.html">Daftar</a>
</form>
```

---

#### 5.1.2 Register Page (`register.html`)

**Features:**
- Name, email, password input
- Password confirmation
- Terms & conditions checkbox
- Register button

**Validation:**
- Password min 8 characters
- Password confirmation match
- Email format validation

---

#### 5.1.3 Dashboard Page (`dashboard.html`)

**Layout Sections:**

1. **Header**
   - User name & avatar
   - Notification bell icon
   - Logout button

2. **Financial Health Score Card** (Hero Section)
   - Large score display (78/100)
   - Progress bar
   - Breakdown: Savings Rate, Debt Ratio, Emergency Fund
   - Gradient background (blue to purple)

3. **Monthly Cash Flow Chart**
   - Line/bar chart showing income vs expense
   - Last 6 months data
   - Interactive tooltips

4. **Budget Progress**
   - List of category budgets
   - Progress bars with colors:
     - Green: < 80%
     - Yellow: 80-99%
     - Red: >= 100%

5. **Recent Transactions**
   - Last 5 transactions
   - Link to full transaction page

6. **Quick Actions**
   - "Add Transaction" button
   - "Set Budget" button
   - "Ask AI Advisor" button

**JavaScript:**
```javascript
// dashboard.js

async function loadDashboard() {
  // Fetch dashboard data
  const response = await api.get('/dashboard');
  const data = response.data;
  
  // Render Financial Health Score
  renderHealthScore(data.financial_health_score, data.score_breakdown);
  
  // Render Cash Flow Chart
  renderCashFlowChart(data.monthly_summary);
  
  // Render Budget Progress
  renderBudgetProgress(data.budget_summary);
  
  // Render Recent Transactions
  renderRecentTransactions(data.recent_transactions);
}

function renderHealthScore(score, breakdown) {
  document.getElementById('healthScore').textContent = score;
  document.getElementById('savingsRate').textContent = breakdown.savings_rate + '%';
  document.getElementById('debtRatio').textContent = breakdown.debt_ratio + '%';
  document.getElementById('emergencyFund').textContent = breakdown.emergency_fund_months.toFixed(1) + ' months';
  
  // Update progress bar
  const progressBar = document.getElementById('scoreProgressBar');
  progressBar.style.width = score + '%';
}

function renderCashFlowChart(data) {
  // Using Chart.js
  const ctx = document.getElementById('cashFlowChart').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.labels,
      datasets: [{
        label: 'Income',
        data: data.income,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)'
      }, {
        label: 'Expense',
        data: data.expense,
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)'
      }]
    },
    options: {
      responsive: true,
      interaction: {
        mode: 'index',
        intersect: false
      }
    }
  });
}
```

---

#### 5.1.4 Transactions Page (`transactions.html`)

**Features:**

1. **Add Transaction Form**
   - Wallet selector dropdown
   - Category selector dropdown
   - Amount input (Rupiah format)
   - Transaction type toggle (Income/Expense)
   - Description textarea
   - Date picker
   - Submit button

2. **Transaction List**
   - Filterable by:
     - Date range
     - Wallet
     - Category
     - Type
   - Sortable by date/amount
   - Pagination (50 per page)

3. **Transaction Item**
   - Category icon & name
   - Description
   - Amount (colored: green for income, red for expense)
   - Date
   - Wallet badge
   - Edit/Delete buttons

**JavaScript:**
```javascript
// transactions.js

async function addTransaction(formData) {
  const response = await api.post('/transactions', formData);
  
  if (response.success) {
    showSuccessMessage('Transaction added successfully');
    loadTransactions(); // Refresh list
    resetForm();
  }
}

async function loadTransactions(filters = {}) {
  const response = await api.get('/transactions', filters);
  renderTransactions(response.data.transactions);
}

function renderTransactions(transactions) {
  const container = document.getElementById('transactionList');
  container.innerHTML = '';
  
  transactions.forEach(trx => {
    const item = createTransactionItem(trx);
    container.appendChild(item);
  });
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
}
```

---

#### 5.1.5 Budgets Page (`budgets.html`)

**Features:**

1. **Budget Overview Card**
   - Total allocated budget
   - Total spent
   - Overall percentage

2. **Add Budget Form**
   - Category selector
   - Wallet selector
   - Amount input
   - Month selector
   - Save button

3. **Budget List**
   - Per-category budget cards
   - Progress bar with percentage
   - Status indicator (safe/warning/over)
   - Spent vs Allocated amounts
   - Edit/Delete buttons

**UI States:**
```css
.budget-safe { border-left: 4px solid #10b981; }
.budget-warning { border-left: 4px solid #f59e0b; }
.budget-over { border-left: 4px solid #ef4444; }
```

---

#### 5.1.6 Wallets Page (`wallets.html`)

**Features:**

1. **Wallet Summary**
   - Total balance across all wallets
   - Number of wallets

2. **Wallet Cards**
   - Wallet name
   - Wallet type (Cash/Bank/E-wallet)
   - Current balance
   - View transactions button
   - Edit/Delete buttons

3. **Add Wallet Form**
   - Wallet name input
   - Type selector
   - Initial balance input
   - Create button

4. **Transfer Money Form**
   - From wallet selector
   - To wallet selector
   - Amount input
   - Notes textarea
   - Transfer button

---

#### 5.1.7 Insights Page (`insights.html`)

**Features:**

1. **Insight Cards** (Rule-Based)
   - Auto-generated insights
   - Categorized by type:
     - Spending Patterns
     - Budget Warnings
     - Savings Opportunities
     - Bill Forecasts
   - Each card shows:
     - Icon (based on severity)
     - Title
     - Message
     - Date generated

2. **Insight Severity Colors:**
   - Info (blue): General information
   - Warning (yellow): Attention needed
   - Success (green): Positive insights
   - Danger (red): Critical alerts

**Layout:**
```html
<div class="insight-card insight-warning">
  <div class="insight-icon">⚠️</div>
  <div class="insight-content">
    <h3>Budget Makanan Hampir Habis</h3>
    <p>Budget kategori 'Makanan' sudah mencapai 85%. Sisa: Rp 150k untuk 15 hari.</p>
    <span class="insight-date">15 Dec 2024</span>
  </div>
</div>
```

---

#### 5.1.8 AI Chat Page (`ai-chat.html`)

**Features:**

1. **Chat Interface**
   - Chat message container (scrollable)
   - User messages (right-aligned, blue)
   - AI responses (left-aligned, gray)
   - Typing indicator when AI is responding

2. **Input Area**
   - Text input for message
   - Send button
   - Quick suggestions (optional):
     - "Gimana cara hemat uang?"
     - "Analisis pengeluaran bulan ini"
     - "Tips investasi untuk pemula"

3. **Chat Message Format:**
```html
<div class="chat-message user">
  <div class="message-bubble">
    Gimana cara saya bisa hemat transport?
  </div>
  <span class="message-time">14:30</span>
</div>

<div class="chat-message ai">
  <div class="message-bubble">
    Berdasarkan data keuangan Anda, pengeluaran transport...
  </div>
  <span class="message-time">14:31</span>
</div>
```

**JavaScript:**
```javascript
// ai-chat.js

async function sendMessage(message) {
  // Add user message to UI
  addMessageToUI('user', message);
  
  // Show typing indicator
  showTypingIndicator();
  
  // Call API
  const response = await api.post('/ai/chat', { message });
  
  // Hide typing indicator
  hideTypingIndicator();
  
  // Add AI response to UI
  addMessageToUI('ai', response.data.reply);
  
  // Scroll to bottom
  scrollToBottom();
}

function addMessageToUI(sender, message) {
  const chatContainer = document.getElementById('chatMessages');
  const messageDiv = document.createElement('div');
  messageDiv.className = `chat-message ${sender}`;
  messageDiv.innerHTML = `
    <div class="message-bubble">${message}</div>
    <span class="message-time">${getCurrentTime()}</span>
  `;
  chatContainer.appendChild(messageDiv);
}
```

---

### 5.2 Shared Components

#### 5.2.1 API Client (`js/api.js`)

```javascript
class APIClient {
  constructor() {
    this.baseURL = 'http://localhost:8080/api';
    this.token = localStorage.getItem('token');
  }
  
  async request(method, endpoint, data = null) {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    const config = {
      method,
      headers
    };
    
    if (data && (method === 'POST' || method === 'PUT')) {
      config.body = JSON.stringify(data);
    }
    
    try {
      const response = await fetch(this.baseURL + endpoint, config);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Request failed');
      }
      
      return result;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }
  
  get(endpoint, params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${endpoint}?${query}` : endpoint;
    return this.request('GET', url);
  }
  
  post(endpoint, data) {
    return this.request('POST', endpoint, data);
  }
  
  put(endpoint, data) {
    return this.request('PUT', endpoint, data);
  }
  
  delete(endpoint) {
    return this.request('DELETE', endpoint);
  }
}

const api = new APIClient();
```

---

#### 5.2.2 Authentication Guard

```javascript
// auth.js

function checkAuth() {
  const token = localStorage.getItem('token');
  
  if (!token) {
    // Redirect to login
    window.location.href = 'login.html';
    return false;
  }
  
  return true;
}

function logout() {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
}

// Call on protected pages
if (!checkAuth()) {
  throw new Error('Unauthorized');
}
```

---

### 5.3 UI/UX Guidelines

**Color Scheme:**
- Primary: `#3b82f6` (Blue)
- Success: `#10b981` (Green)
- Warning: `#f59e0b` (Orange)
- Danger: `#ef4444` (Red)
- Neutral: `#6b7280` (Gray)

**Typography:**
- Font Family: Inter, system-ui, sans-serif
- Headings: Bold, 1.5-2.5rem
- Body: Regular, 1rem
- Small: 0.875rem

**Spacing:**
- Container: max-width 1280px, centered
- Padding: 1rem to 2rem
- Gap: 1rem between elements

**Responsive:**
- Mobile: < 768px (single column)
- Tablet: 768px - 1024px (2 columns)
- Desktop: > 1024px (3-4 columns)

---

## 6. DEVELOPMENT PRIORITIES (MVP)

### 6.1 Phase 1: Foundation (Week 1)

**Priority: CRITICAL**

1. **Docker Setup**
   - Docker Compose with PHP, MySQL, phpMyAdmin
   - Environment configuration
   - Database connection testing

2. **Database Migration**
   - Implement all tables from ERD
   - Create indexes
   - Seed default categories

3. **Authentication System**
   - Register API
   - Login API
   - JWT middleware
   - Frontend auth pages

4. **Basic CRUD APIs**
   - Transactions API (full CRUD)
   - Wallets API (full CRUD)
   - Categories API (read, create)

**Acceptance Criteria:**
- ✅ Docker containers running successfully
- ✅ Database tables created and seeded
- ✅ User can register, login, logout
- ✅ User can create, view, edit, delete transactions
- ✅ User can create and view wallets

---

### 6.2 Phase 2: Core Features (Week 2)

**Priority: HIGH**

1. **Dashboard Implementation**
   - Financial Health Score calculation
   - Monthly cash flow chart
   - Budget progress display
   - Recent transactions list

2. **Budget Management**
   - Budget API
   - Budget CRUD frontend
   - Budget progress tracking
   - Warning notifications (80% threshold)

3. **Rule-Based Insights**
   - Insight generation algorithm
   - Weekend vs weekday spending analysis
   - Budget warning detection
   - Savings opportunity suggestions

**Acceptance Criteria:**
- ✅ Dashboard shows Financial Health Score
- ✅ Cash flow chart displays correctly
- ✅ User can set and track budgets
- ✅ Automatic insights generated and displayed

---

### 6.3 Phase 3: AI Integration (Week 2-3)

**Priority: HIGH (Showcase Feature)**

1. **OpenAI API Integration**
   - API key configuration
   - Prompt engineering
   - User context gathering
   - Response handling

2. **AI Chat Interface**
   - Chat UI implementation
   - Message sending/receiving
   - Typing indicator
   - Conversation persistence (optional)

**Acceptance Criteria:**
- ✅ User can send messages to AI
- ✅ AI provides relevant financial advice
- ✅ AI responses include user's financial data context
- ✅ Chat interface is user-friendly

---

### 6.4 Phase 4: Polish & Testing (Week 3)

**Priority: MEDIUM**

1. **UI/UX Refinement**
   - Consistent styling across pages
   - Responsive design testing
   - Loading states
   - Error handling

2. **Data Visualization Enhancement**
   - Chart interactivity
   - Color coding consistency
   - Tooltips and legends

3. **Testing**
   - API endpoint testing
   - Frontend integration testing
   - Cross-browser testing
   - Mobile responsiveness

4. **Documentation**
   - README with setup instructions
   - API documentation
   - User guide for demo

**Acceptance Criteria:**
- ✅ All pages responsive on mobile/tablet/desktop
- ✅ Consistent UI/UX across application
- ✅ No critical bugs
- ✅ Documentation complete

---

### 6.5 Nice-to-Have Features (Post-MVP)

**Priority: LOW (If time permits)**

1. ~~Bulk CSV Upload~~
2. ~~Recurring Transactions~~
3. ~~Export to PDF/Excel~~
4. ~~Notification Center with push notifications~~
5. Financial Goals Tracker (full implementation)
6. Advanced data visualizations (category breakdown pie charts)

---

## 7. DOCKER SETUP

### 7.1 Docker Compose Configuration

**File: `docker-compose.yml`**

```yaml
version: '3.8'

services:
  php:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: finsight_php
    ports:
      - "8080:80"
    volumes:
      - ./src:/var/www/html
    depends_on:
      - mysql
    environment:
      - DB_HOST=mysql
      - DB_NAME=finsight_db
      - DB_USER=finsight_user
      - DB_PASSWORD=finsight_pass
      - OPENAI_API_KEY=${OPENAI_API_KEY}

  mysql:
    image: mysql:8.0
    container_name: finsight_mysql
    ports:
      - "3306:3306"
    environment:
      - MYSQL_ROOT_PASSWORD=root
      - MYSQL_DATABASE=finsight_db
      - MYSQL_USER=finsight_user
      - MYSQL_PASSWORD=finsight_pass
    volumes:
      - mysql_data:/var/lib/mysql
      - ./src/database/migrations.sql:/docker-entrypoint-initdb.d/migrations.sql

  phpmyadmin:
    image: phpmyadmin:latest
    container_name: finsight_phpmyadmin
    ports:
      - "8081:80"
    environment:
      - PMA_HOST=mysql
      - PMA_USER=root
      - PMA_PASSWORD=root
    depends_on:
      - mysql

volumes:
  mysql_data:
```

---

### 7.2 Dockerfile

**File: `Dockerfile`**

```dockerfile
FROM php:8.1-apache

# Enable Apache mod_rewrite
RUN a2enmod rewrite

# Install PHP extensions
RUN docker-php-ext-install mysqli pdo pdo_mysql

# Install additional tools
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libzip-dev \
    && docker-php-ext-install zip

# Set working directory
WORKDIR /var/www/html

# Copy application files
COPY ./src /var/www/html

# Set permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html

# Apache configuration
RUN echo "ServerName localhost" >> /etc/apache2/apache2.conf

EXPOSE 80
```

---

### 7.3 Environment Variables

**File: `.env`** (root directory)

```env
# Database
DB_HOST=mysql
DB_NAME=finsight_db
DB_USER=finsight_user
DB_PASSWORD=finsight_pass

# JWT
JWT_SECRET=your-secret-key-here-change-in-production

# OpenAI
OPENAI_API_KEY=sk-proj-your-api-key-here

# Application
APP_ENV=development
APP_DEBUG=true
```

---

### 7.4 Setup Instructions

**Step 1: Clone Repository**
```bash
git clone https://github.com/HilmanAlDwinov/FINSIGHT.git
cd FINSIGHT
```

**Step 2: Configure Environment**
```bash
cp .env.example .env
# Edit .env and add your OpenAI API key
```

**Step 3: Start Docker Containers**
```bash
docker-compose up -d
```

**Step 4: Verify Services**
- Application: http://localhost:8080
- phpMyAdmin: http://localhost:8081
- MySQL: localhost:3306

**Step 5: Initialize Database**
```bash
# Database will be automatically initialized from migrations.sql
# Or manually import via phpMyAdmin
```

---

## 8. TESTING REQUIREMENTS

### 8.1 Backend Testing Checklist

**Authentication:**
- [ ] Register with valid data succeeds
- [ ] Register with duplicate email fails
- [ ] Login with correct credentials succeeds
- [ ] Login with incorrect credentials fails
- [ ] Protected endpoints require valid JWT

**Transactions:**
- [ ] Create transaction updates wallet balance
- [ ] Update transaction adjusts wallet balance correctly
- [ ] Delete transaction reverses balance change
- [ ] Filter transactions by date/category/wallet works
- [ ] Pagination works correctly

**Wallets:**
- [ ] Create wallet succeeds
- [ ] Transfer between wallets updates both balances
- [ ] Cannot transfer more than available balance
- [ ] Total balance calculation is accurate

**Budgets:**
- [ ] Create budget succeeds
- [ ] Budget progress calculates correctly
- [ ] Budget warnings trigger at 80%
- [ ] Budget status (active/warning/over) updates correctly

**AI Chat:**
- [ ] AI chat returns relevant responses
- [ ] User financial context is included in prompts
- [ ] API rate limits are handled gracefully

---

### 8.2 Frontend Testing Checklist

**Responsiveness:**
- [ ] Mobile (< 768px) - all pages display correctly
- [ ] Tablet (768px - 1024px) - layouts adjust properly
- [ ] Desktop (> 1024px) - full features accessible

**User Flow:**
- [ ] Register → Login → Dashboard flow works
- [ ] Add transaction → View in list → Edit → Delete works
- [ ] Set budget → Track progress → Receive warning works
- [ ] Chat with AI → Receive response → Continue conversation works

**UI/UX:**
- [ ] Loading states shown during API calls
- [ ] Error messages displayed clearly
- [ ] Success messages shown after actions
- [ ] Forms validate inputs before submission
- [ ] Charts render correctly with real data

---

### 8.3 Demo Scenarios for Expo

**Scenario 1: New User Onboarding**
1. Register new account
2. Login
3. View empty dashboard
4. Create first wallet
5. Add initial balance
6. Add first transaction

**Scenario 2: Financial Health Tracking**
1. Show dashboard with populated data
2. Explain Financial Health Score
3. Demonstrate cash flow chart
4. Highlight budget progress with color indicators
5. Show recent transactions feed

**Scenario 3: Budget Management**
1. Navigate to Budget page
2. Create new budget for "Makanan" category (Rp 1,000,000)
3. Add several transactions in that category
4. Show budget progress updating automatically
5. Demonstrate warning when approaching 80%
6. Show "over budget" status

**Scenario 4: AI Financial Advisor (Showcase Feature)**
1. Navigate to AI Chat page
2. Ask: "Gimana cara saya bisa hemat pengeluaran bulanan?"
3. Show AI processing (typing indicator)
4. Display AI response with specific recommendations based on user data
5. Follow-up question: "Kategori mana yang paling boros?"
6. Show AI analyzing spending patterns

**Scenario 5: Multi-Wallet Management**
1. Show multiple wallets (Cash, Bank BCA, GoPay)
2. Create transaction from specific wallet
3. Demonstrate wallet balance updating
4. Transfer money between wallets
5. Show both wallets updating simultaneously

---

## 9. TIMELINE & MILESTONES

### 9.1 Overall Timeline

**Project Duration:** 3 Weeks  
**Start Date:** December 18, 2024  
**End Date:** January 8, 2025  
**Expo Date:** Early January 2025

---

### 9.2 Week-by-Week Breakdown

#### **WEEK 1: Migration & Foundation (Dec 18-24)**

**Day 1-2 (Dec 18-19): PHP Backend Setup** ⚠️ CRITICAL

**Tasks:**
- [ ] Create PHP project structure
- [ ] Setup Docker environment (PHP, MySQL, phpMyAdmin)
- [ ] Implement `config/database.php` connection
- [ ] Migrate `AuthController.php` from Node.js
- [ ] Migrate `TransactionController.php`
- [ ] Migrate `WalletController.php`
- [ ] Setup JWT authentication middleware
- [ ] Create API router (`index.php`)

**Assignments:**
- **Syarif (Backend):** Database connection, AuthController
- **Farid (Lead Dev):** API router, JWT middleware, TransactionController
- **Hilman & Yossa (Frontend):** Update API client untuk PHP endpoints
- **Damara (QA):** Setup testing environment, prepare test cases
- **Ibra (PM):** Unblock issues, daily standup

**Output:**
- ✅ Docker containers running
- ✅ Auth API working (register, login)
- ✅ Transaction API working (CRUD)
- ✅ Wallet API working (CRUD)

---

**Day 3-4 (Dec 20-21): Core APIs & Integration**

**Tasks:**
- [ ] Implement `BudgetController.php`
- [ ] Implement `CategoryController.php`
- [ ] Implement `DashboardController.php`
- [ ] Frontend-backend integration (auth, transactions, wallets)
- [ ] Database seeding (categories, sample data)

**Assignments:**
- **Syarif:** BudgetController, CategoryController
- **Farid:** DashboardController, Financial Health Score algorithm
- **Hilman:** Integrate dashboard.html dengan API
- **Yossa:** Integrate transactions.html dengan API
- **Damara:** Test all API endpoints

**Output:**
- ✅ Budget API working
- ✅ Dashboard API working
- ✅ Frontend dapat fetch data dari backend
- ✅ Basic user flow: Register → Login → Dashboard → Add Transaction

---

**Day 5-7 (Dec 22-24): Complete Integration**

**Tasks:**
- [ ] Complete all frontend pages integration
- [ ] Implement wallet transfer functionality
- [ ] Budget tracking and warnings
- [ ] Data visualization (Chart.js implementation)
- [ ] Comprehensive testing

**Assignments:**
- **All Team:** Integration sprint, bug fixing
- **Hilman & Yossa:** Complete all page integrations, charts
- **Syarif & Farid:** Fix backend bugs, optimize queries
- **Damara:** Comprehensive testing, bug reporting

**Checkpoint Review (Dec 24):**
- ✅ All core features working end-to-end
- ✅ No critical bugs
- ✅ Ready for AI integration

---

#### **WEEK 2: AI Integration & Advanced Features (Dec 25-31)**

**Day 8-9 (Dec 25-26): Rule-Based Insights**

**Tasks:**
- [ ] Implement `InsightController.php`
- [ ] Weekend vs weekday spending algorithm
- [ ] Budget warning detection
- [ ] Category spending analysis
- [ ] Savings opportunity suggestions
- [ ] Frontend insights page integration

**Assignments:**
- **Farid:** InsightController with all algorithms
- **Syarif:** Optimize database queries for insights
- **Hilman:** Insights page UI and integration
- **Damara:** Test insight accuracy

**Output:**
- ✅ Automatic insights generated correctly
- ✅ Insights displayed on frontend
- ✅ Insights update based on new transactions

---

**Day 10-11 (Dec 27-28): OpenAI Integration** 🤖 SHOWCASE

**Tasks:**
- [ ] Implement `AIController.php`
- [ ] OpenAI API integration (cURL implementation)
- [ ] User financial context gathering
- [ ] Prompt engineering for financial advice
- [ ] AI Chat frontend interface
- [ ] Conversation handling

**Assignments:**
- **Syarif & Farid (Pair):** AIController, OpenAI integration
- **Yossa:** AI Chat UI implementation
- **Hilman:** Chat interface styling, responsive design
- **Damara:** Test AI responses quality

**Implementation Priority:**
```php
// AIController.php - Key Methods
1. chat() - Main endpoint
2. getUserFinancialContext() - Gather user data
3. buildPrompt() - Engineer prompt with context
4. callOpenAI() - API call handling
5. Error handling for API failures
```

**Output:**
- ✅ AI Chat working with OpenAI API
- ✅ AI responses relevant and personalized
- ✅ Chat UI user-friendly
- ✅ Error handling for API failures

---

**Day 12-14 (Dec 29-31): Polish & Visualization**

**Tasks:**
- [ ] Cash flow chart (Chart.js)
- [ ] Category breakdown charts
- [ ] Wallet balance visualization
- [ ] UI/UX refinements
- [ ] Loading states everywhere
- [ ] Error message handling
- [ ] Success notifications

**Assignments:**
- **Hilman & Yossa:** Data visualization, UI polish
- **Syarif & Farid:** Backend optimization, caching
- **Damara:** Full regression testing

**Output:**
- ✅ All charts working and interactive
- ✅ Consistent UI across all pages
- ✅ Smooth user experience
- ✅ No major bugs

---

#### **WEEK 3: Final Testing & Deployment (Jan 1-8)**

**Day 15-16 (Jan 1-2): Bug Fixing Sprint**

**Tasks:**
- [ ] Fix all bugs from testing
- [ ] Performance optimization
- [ ] Mobile responsiveness fixes
- [ ] Cross-browser testing (Chrome, Firefox, Safari)
- [ ] Data validation improvements

**Assignments:**
- **All Team:** Bug fixing based on priority
- **Damara:** Final testing checklist execution

---

**Day 17-18 (Jan 3-4): Docker & Deployment**

**Tasks:**
- [ ] Finalize Docker Compose configuration
- [ ] Test complete setup from scratch
- [ ] Database seeding for demo
- [ ] Environment configuration
- [ ] Create deployment documentation

**Assignments:**
- **Farid:** Docker finalization, deployment testing
- **Syarif:** Database optimization, seeding
- **Ibra:** Documentation compilation

**Output:**
- ✅ Docker setup reproducible
- ✅ Demo data seeded and realistic
- ✅ Deployment documentation complete

---

**Day 19-20 (Jan 5-6): Documentation & Demo Prep**

**Tasks:**
- [ ] Complete README.md
- [ ] API documentation
- [ ] User guide for demo
- [ ] Prepare demo scenarios
- [ ] Practice presentation
- [ ] Prepare backup plan (offline demo)

**Assignments:**
- **Ibra:** Finalize MTI documentation
- **All Team:** Demo practice, Q&A prep

---

**Day 21-22 (Jan 7-8): Buffer & Expo** 🎯

**Tasks:**
- [ ] Last-minute fixes
- [ ] Final testing in expo environment
- [ ] Setup demo laptop/station
- [ ] Prepare demo flow
- [ ] EXPO DAY

**Expo Preparation:**
- Laptop with Docker installed
- Stable internet (for OpenAI API)
- Backup: Seeded database with realistic data
- Backup: Pre-recorded demo video (if live fails)

---

### 9.3 Critical Path

**Must be completed ON TIME:**

1. **Week 1, Day 2:** Auth & Transaction APIs working ⚠️
2. **Week 1, Day 7:** All core features integrated ⚠️
3. **Week 2, Day 11:** OpenAI integration complete ⚠️
4. **Week 3, Day 18:** Docker deployment ready ⚠️

**If behind schedule:**
- Cut: Advanced visualizations
- Cut: Financial goals tracker
- Keep: Auth, Transactions, Budgets, AI Chat

---

## 10. RISK MANAGEMENT

### 10.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Migration PHP takes longer than 5 days** | HIGH | HIGH | Start immediately, pair programming, daily progress check |
| **OpenAI API fails during demo** | MEDIUM | HIGH | Implement fallback: pre-cached responses, offline mode |
| **Docker setup issues** | MEDIUM | MEDIUM | Test early, have backup XAMPP setup |
| **Database performance issues** | LOW | MEDIUM | Optimize queries, add indexes, use caching |
| **Frontend-backend integration bugs** | MEDIUM | HIGH | Test continuously, clear API contracts |

---

### 10.2 Schedule Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Missing Week 1 checkpoint** | HIGH | CRITICAL | Cut non-essential features immediately |
| **Team member unavailable** | MEDIUM | MEDIUM | Cross-training, documentation, backup assignments |
| **Scope creep (adding features)** | MEDIUM | HIGH | Strict MVP focus, PM controls scope |

---

### 10.3 Contingency Plans

**If Migration Takes Too Long (>5 days):**
- **Decision Point:** Dec 22
- **Action:** Keep Node.js backend, focus on feature completion
- **Justification to dosen:** Technical optimization for AI integration

**If OpenAI API Issues:**
- **Backup Plan A:** Pre-cache 5-10 common questions with responses
- **Backup Plan B:** Show rule-based insights only, explain AI feature

**If Docker Doesn't Work:**
- **Backup:** XAMPP local setup (PHP + MySQL)
- **Risk:** Less impressive for demo, but functional

---

## 11. TEAM ROLES & RESPONSIBILITIES

### 11.1 Detailed Role Breakdown

#### **Ibra (Project Manager)**

**Responsibilities:**
- Daily standup coordination (15 min, 9:00 AM)
- Track progress against timeline
- Unblock team issues immediately
- Communication with dosen (if needed)
- Documentation compilation (MTI docs)
- Risk monitoring and escalation

**Daily Tasks:**
- Check-in with each team member
- Update project tracking board
- Escalate blockers to Lead Dev
- Prepare daily progress report

**Deliverables:**
- Updated project charter
- Weekly progress reports
- Final documentation package

---

#### **Farid (Lead Developer)**

**Responsibilities:**
- Technical architecture decisions
- Code review for all backend code
- API design and implementation
- Docker configuration
- Critical bug fixes
- Team technical mentoring

**Week 1 Focus:**
- API router setup
- JWT middleware
- TransactionController
- Code review Syarif's work

**Week 2 Focus:**
- InsightController algorithms
- AIController (OpenAI integration)
- Performance optimization

**Week 3 Focus:**
- Docker finalization
- Deployment testing
- Technical documentation

---

#### **Syarif (Backend Developer)**

**Responsibilities:**
- Database design implementation
- API controllers development
- Business logic implementation
- Database optimization
- Seeding and migration scripts

**Week 1 Focus:**
- Database connection setup
- AuthController
- WalletController
- Database seeding

**Week 2 Focus:**
- BudgetController
- CategoryController
- AIController (pair with Farid)

**Week 3 Focus:**
- Database optimization
- Demo data seeding
- Query performance

---

#### **Hilman (Frontend Developer)**

**Responsibilities:**
- Dashboard implementation
- Insights page
- AI Chat interface
- Data visualization (Chart.js)
- Responsive design
- API integration

**Week 1 Focus:**
- Update API client for PHP
- Dashboard integration
- Transaction form integration

**Week 2 Focus:**
- Insights page UI
- Chart.js implementation
- UI/UX refinements

**Week 3 Focus:**
- Mobile responsiveness
- Final UI polish
- Demo flow preparation

---

#### **Yossa (Frontend Developer)**

**Responsibilities:**
- Transactions page
- Budgets page
- Wallets page
- AI Chat UI
- Form validations
- Error handling UI

**Week 1 Focus:**
- Transactions page integration
- Wallet page integration
- Form validations

**Week 2 Focus:**
- Budget page integration
- AI Chat interface
- Loading states

**Week 3 Focus:**
- Cross-browser testing
- Responsive fixes
- Error message improvements

---

#### **Damara (QA/Tester)**

**Responsibilities:**
- Test plan creation
- API endpoint testing
- Frontend integration testing
- Bug reporting (with screenshots)
- Demo scenario testing
- User acceptance testing

**Week 1 Focus:**
- Setup testing environment
- Create test cases document
- Test auth and basic CRUD

**Week 2 Focus:**
- Test all features comprehensively
- Report bugs with priority levels
- Regression testing

**Week 3 Focus:**
- Final testing checklist
- Demo scenario validation
- Backup demo testing

---

### 11.2 Communication Protocol

**Daily Standup (9:00 AM, 15 min):**
1. What did you complete yesterday?
2. What will you work on today?
3. Any blockers?

**Communication Channels:**
- **Urgent:** WhatsApp group (response expected in 30 min)
- **Code:** GitHub issues/PRs
- **Decisions:** Google Meet/Zoom call
- **Documentation:** Google Drive (shared folder)

**Code Review Process:**
1. Developer creates PR on GitHub
2. Farid reviews within 4 hours
3. Address feedback
4. Merge to main branch

---

## 12. SUCCESS METRICS

### 12.1 Technical Metrics

**Must Achieve:**
- [ ] 100% of MVP features working
- [ ] < 3 critical bugs at demo
- [ ] API response time < 500ms (average)
- [ ] Frontend load time < 2 seconds
- [ ] 100% Docker deployment success rate
- [ ] AI response time < 5 seconds

---

### 12.2 Demo Metrics

**Must Demonstrate:**
- [ ] Complete user flow: Register → Login → Dashboard → Transactions → AI Chat
- [ ] Financial Health Score calculation (accurate)
- [ ] OpenAI integration working live
- [ ] Real-time data updates (add transaction → dashboard updates)
- [ ] Responsive design (show mobile view)
- [ ] Multi-wallet management

---

### 12.3 Documentation Metrics

**Must Complete:**
- [ ] README with setup instructions
- [ ] API documentation (all endpoints)
- [ ] ERD diagram (updated if changed)
- [ ] User guide for demo
- [ ] Project Charter (updated)
- [ ] Risk Management document (final)

---

## 13. ACCEPTANCE CRITERIA SUMMARY

### 13.1 Backend Acceptance Criteria

**Authentication:**
- ✅ User can register with email/password
- ✅ User can login and receive JWT token
- ✅ Protected endpoints validate JWT
- ✅ Passwords hashed securely (bcrypt/password_hash)

**Transactions:**
- ✅ CRUD operations work correctly
- ✅ Wallet balance updates automatically
- ✅ Filtering by wallet/category/date works
- ✅ Pagination implemented

**Budgets:**
- ✅ Budget creation and tracking works
- ✅ Budget progress calculates accurately
- ✅ Warning triggered at 80%
- ✅ Status (active/warning/over) correct

**Dashboard:**
- ✅ Financial Health Score calculated correctly
- ✅ Cash flow data aggregated properly
- ✅ API returns all required data

**AI Chat:**
- ✅ OpenAI API integration works
- ✅ User financial context included in prompts
- ✅ Responses relevant and helpful
- ✅ Error handling for API failures

---

### 13.2 Frontend Acceptance Criteria

**Responsive Design:**
- ✅ Mobile (<768px): Single column layout, no horizontal scroll
- ✅ Tablet (768-1024px): 2-column layout where appropriate
- ✅ Desktop (>1024px): Full feature visibility

**User Experience:**
- ✅ Loading indicators shown during API calls
- ✅ Success messages after actions
- ✅ Error messages clear and actionable
- ✅ Form validation before submission
- ✅ Smooth navigation between pages

**Data Visualization:**
- ✅ Charts render correctly
- ✅ Interactive tooltips work
- ✅ Colors consistent (green=income, red=expense)
- ✅ Legend/labels visible and clear

---

### 13.3 Integration Acceptance Criteria

- ✅ Frontend correctly calls all backend APIs
- ✅ Authentication token persisted and used
- ✅ Data flows correctly: User action → API → Database → Response → UI update
- ✅ Real-time updates (e.g., add transaction → dashboard updates)
- ✅ Error handling works end-to-end

---

## 14. DEPLOYMENT CHECKLIST

### 14.1 Pre-Deployment

- [ ] All code committed to GitHub main branch
- [ ] Docker Compose tested from scratch
- [ ] Environment variables configured
- [ ] Database migrations run successfully
- [ ] Demo data seeded
- [ ] All tests passing

### 14.2 Demo Day Checklist

- [ ] Laptop fully charged + charger ready
- [ ] Docker containers running
- [ ] Internet connection tested (for OpenAI API)
- [ ] Demo scenarios rehearsed
- [ ] Backup plan ready (pre-cached AI responses)
- [ ] Screenshots/screen recording as backup
- [ ] Team roles assigned for demo
- [ ] Q&A responses prepared

---

## 15. APPENDIX

### 15.1 Useful Commands

**Docker:**
```bash
# Start containers
docker-compose up -d

# Stop containers
docker-compose down

# View logs
docker-compose logs -f php

# Rebuild containers
docker-compose up -d --build

# Access MySQL
docker exec -it finsight_mysql mysql -u finsight_user -p
```

**Database:**
```bash
# Import database
docker exec -i finsight_mysql mysql -u finsight_user -pfinsight_pass finsight_db < src/database/migrations.sql

# Backup database
docker exec finsight_mysql mysqldump -u finsight_user -pfinsight_pass finsight_db > backup.sql
```

---

### 15.2 Quick Reference Links

**Documentation:**
- PHP Documentation: https://www.php.net/docs.php
- MySQL Documentation: https://dev.mysql.com/doc/
- Chart.js: https://www.chartjs.org/docs/
- Bootstrap: https://getbootstrap.com/docs/
- Tailwind CSS: https://tailwindcss.com/docs
- OpenAI API: https://platform.openai.com/docs/api-reference

**Tools:**
- JWT Debugger: https://jwt.io/
- JSON Formatter: https://jsonformatter.org/
- Postman: https://www.postman.com/

---

### 15.3 Common Issues & Solutions

**Issue:** Docker MySQL container won't start
**Solution:** Check if port 3306 already in use, change port in docker-compose.yml

**Issue:** CORS errors in frontend
**Solution:** Add CORS headers in PHP:
```php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
```

**Issue:** JWT token expired
**Solution:** Implement token refresh mechanism or increase expiry time

**Issue:** OpenAI API rate limit
**Solution:** Implement request queuing or use cached responses for demo

---

## 16. CONCLUSION

**This PRD is the single source of truth for FINSIGHT development.**

**Key Reminders:**
1. **Migration PHP is Week 1 priority** - No feature work until migration done
2. **Week 1 checkpoint (Dec 24)** is CRITICAL - Must have core features working
3. **OpenAI integration (Week 2)** is showcase feature - Allocate sufficient time
4. **Testing is continuous** - Don't leave testing for Week 3
5. **Docker must work** - Test deployment early

**Success Formula:**
✅ Tight scope (MVP only)  
✅ Clear timeline with checkpoints  
✅ Daily communication  
✅ Continuous testing  
✅ Risk-aware (have backups)

**Team Mantra:**
> "Working software over comprehensive features. Quality over quantity. Demo-ready over perfect code."

---

**END OF PRD**

---

**PRD Version:** 1.0 (Complete)  
**Last Updated:** December 17, 2024  
**Document Owner:** Ibra (Project Manager)  
**Review Date:** December 24, 2024 (Checkpoint)

---