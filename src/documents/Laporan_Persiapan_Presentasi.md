# Laporan Implementasi FINSIGHT
**Mata Kuliah:** Sistem Jaringan Komputer
**Topik:** Deployment Web & Database Architecture pada Docker Environment

---

## 1. Topologi & Perencanaan Server (Server Planning)

Untuk memenuhi prinsip dasar arsitektur jaringan modern dan *microservices*, proyek FINSIGHT diimplementasikan dengan memisahkan *Web Server* dan *Database Server* ke dalam container yang isolatif.

### Arsitektur Kontainer
Kami menggunakan strategi **Multi-Container Architecture** dengan orkestrasi via **Docker Compose**. Berikut adalah pemetaan *nodes* dalam jaringan virtual kami:

| Entity Name | Peran (Role) | Base Image | Internal Port | Host Port (External Access) |
| :--- | :--- | :--- | :--- | :--- |
| **finsight_php** | Web Server + Application Server | `php:8.1-apache` | 80/tcp | `localhost:8000` |
| **finsight_mysql** | Database Server | `mysql:8.0` | 3306/tcp | `localhost:3307` |
| **finsight_phpmyadmin** | Database Management Tool | `phpmyadmin/phpmyadmin` | 80/tcp | `localhost:8081` |

> **Analisis Keamanan Jaringan:**
> Pemisahan ini memastikan bahwa jika Web Server diretas, penyerang tidak langsung mendapatkan akses root ke Database Server (Isolation Principle).

---

## 2. Pengalamatan & Jaringan (Addressing & Networking)

### Docker Bridge Network
Kami menggunakan driver jaringan **Bridge** bawaan Docker (`finsight_default` network). Hal ini menciptakan jaringan *private virtual* yang terisolasi dari jaringan host (laptop).

*   **Subnetting:** Docker secara otomatis memberikan IP Private (biasanya kelas B `172.xx.0.0/16`) kepada setiap container.
*   **NAT (Network Address Translation):** Port Mapping (Contoh: `8000:80`) bertindak sebagai NAT statis, mengizinkan akses dari lalu lintas luar (Host OS) masuk ke jaringan privat container.

### Mekanisme DNS & Komunikasi Antar Container
Hubungan 1 Container dengan Container lain dilakukan menggunakan **Internal Docker DNS**.

1.  **Service Discovery:**
    Alih-alih menggunakan IP statis yang bisa berubah saat restart, kami menggunakan **Hostname**.
    *   Container PHP memanggil Database bukan dengan IP `172.18.0.3`, melainkan dengan hostname: `mysql`.
    
2.  **Implementasi Konfigurasi (`docker-compose.yml`):**
    ```yaml
    services:
      php:
        depends_on:
          - mysql
        environment:
          - DB_HOST=mysql  <-- DNS Resolution
    ```
    
3.  **Flow Komunikasi:**
    *   User mengakses `localhost:8000` (Host) -> Forward ke `finsight_php:80`.
    *   `finsight_php` butuh data -> Resolve DNS `mysql` -> Request ke `finsight_mysql:3306`.
    *   `finsight_mysql` membalas query -> `finsight_php` merender HTML -> Kirim balik ke User.

---

## 3. Daftar Implementasi Fitur

Berikut adalah modul-modul yang telah berhasil dideploy di atas arsitektur jaringan ini:

### A. Core System (Backend & Database)
1.  **Manajemen Koneksi Database**: Menggunakan PHP PDO dengan koneksi persisten ke container MySQL.
2.  **Autentikasi (Security Layer)**: Sistem Login/Register dengan enkripsi `password_hash` (Bcrypt) dan Tokenisasi sesi.
3.  **RESTful API Router**: Membangun endpoint terstruktur (`/wallets`, `/transactions`, `/budgets`) untuk komunikasi data yang efisien.

### B. Fitur Aplikasi (Frontend Consumption)
1.  **Multi-Wallet Management**:
    *   CRUD (Create, Read, Update, Delete) data dompet (Bank, E-Wallet, Cash).
    *   Visualisasi saldo realtime.
2.  **Transaction Recording (ACID Compliant)**:
    *   Pencatatan Pemasukan/Pengeluaran.
    *   Database Triggers/Logic: Otomatis memotong/menambah saldo Wallet saat transaksi terjadi.
3.  **Budgeting System**:
    *   Penetapan limit pengeluaran per kategori.
    *   Monitoring visual via Progress Bar (Hijau/Kuning/Merah) di Dashboard.
4.  **Dashboard Integration**:
    *   Agregasi total kekayaan (Total Balance).
    *   Ringkasan Cash Flow (Income vs Expense).

---

## 4. Kesimpulan untuk Presentasi

Proyek ini telah memenuhi standar tugas Sistem Jaringan Komputer dengan:
1.  ✅ **Virtualization**: Menggunakan Docker Container.
2.  ✅ **Segregation**: Database dan Web Server berjalan di *user-space* yang berbeda.
3.  ✅ **Networking**: Menggunakan konsep Port Forwarding dan Internal DNS Resolution untuk komunikasi antar node.

**Siap didemokan!** 🚀
