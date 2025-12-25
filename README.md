# FINSIGHT - AI-Powered Personal Finance Dashboard

Project Web Programming FINSIGHT yang bertujuan untuk membantu manajemen keuangan pribadi dengan fitur pencatatan transaksi, budgeting, dan analisis berbasis AI.

## 🚀 Fitur

-   **Dashboard Ringkasan**: Melihat total saldo, pemasukan, dan pengeluaran bulan ini.
-   **Manajemen Dompet (Wallets)**: Mendukung multiple wallets (e.g., Cash, Bank, E-Wallet) dengan saldo terpisah.
-   **Pencatatan Transaksi**: Catat pemasukan dan pengeluaran dengan kategori dan icon.
-   **Transfer Antar Dompet**: Pindahkan saldo antar rekening dengan mudah.
-   **Budgeting**: Atur batasan pengeluaran per kategori agar tidak boros.
-   **Financial Insights**: Analisis otomatis (Rule-Based) untuk memberikan peringatan budget dan saran hemat.
-   **Authentication**: Login dan Register aman dengan JWT.

## 🛠️ Tech Stack

-   **Frontend**: HTML5, CSS3, JavaScript (Vanilla), Bootstrap 5.
-   **Backend**: PHP 8.1 (Native MVC Pattern).
-   **Database**: MySQL 8.0.
-   **Infrastructure**: Docker & Docker Compose.

## 📦 Cara Install & Jalanankan (Untuk Pengguna Baru)

1.  **Clone Repository**
    ```bash
    git clone https://github.com/HilmanAlDwinov/FINSIGHT.git
    cd FINSIGHT-1
    ```

2.  **Jalankan dengan Docker**
    Pastikan Docker Desktop sudah menyala.
    ```bash
    docker-compose up -d --build
    ```
    *Docker akan otomatis membuat database dan mengisi data awal.*

3.  **Akses Aplikasi**
    Buka browser dan kunjungi: `http://localhost:8000`

## ❓ Troubleshooting

### Masalah: "Invalid Credentials" atau Data User Tidak Masuk
Jika Anda baru clone dan mengalami error saat register atau login, kemungkinan besar database belum terinialisasi dengan benar (tabel kosong).

**Solusi:**
Hapus volume database lama dan jalankan ulang agar script migrasi berjalan.

```bash
# 1. Matikan docker dan HAPUS volume (-v)
docker-compose down -v

# 2. Jalankan ulang
docker-compose up -d --build
```

Setelah itu coba Register akun baru lagi. Data seharusnya sudah bisa tersimpan.

### Cek Status Database
Anda bisa menggunakan alat diagnosa bawaan untuk memastikan database sehat:
Akses: `http://localhost:8000/backend/diagnostic.php`

---
**Tim Pengembang**:
- Syarif Hidayatullah
- Hilman Al Dwinov
