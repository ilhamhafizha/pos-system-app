# POS System Application

**POS System Application** adalah sistem Point of Sale (POS) yang dibangun dengan teknologi **React**, **Express**, dan **PostgreSQL**. Aplikasi ini menyediakan fitur untuk kasir dan admin dengan autentikasi berbasis JWT dan peran (role-based) untuk memastikan kontrol akses yang tepat.

Proyek ini bertujuan untuk memudahkan proses transaksi di restoran atau toko dengan menyediakan fitur seperti penambahan menu, pencatatan transaksi, laporan penjualan, dan pengelolaan profil.

## Fitur Utama

### 1. **Autentikasi Pengguna**

* Login dan logout untuk kasir dan admin menggunakan **JWT**.
* Proteksi rute berdasarkan peran (admin, cashier).

### 2. **Dashboard Kasir**

* **Tambah, Update, Hapus Menu**: Kasir dapat memilih menu yang ingin dipesan, mengatur jumlah, dan menambahkan catatan.
* **Histori Transaksi**: Kasir dapat melihat daftar transaksi sebelumnya.
* **Ringkasan Transaksi**: Menampilkan subtotal dan total harga, termasuk perhitungan **PPN 10%**.
* **Fitur Export**: Export laporan transaksi dalam format **PDF/Excel**.

### 3. **Dashboard Admin**

* **Manajemen Menu**: Admin dapat mengelola daftar menu (tambah, edit, hapus).
* **Laporan Penjualan**: Admin dapat melihat semua transaksi dari semua kasir dan mengekspor laporan penjualan.

### 4. **Pengaturan Profil**

* **Edit Profil**: Pengguna dapat mengubah email, username, dan avatar.
* **Ganti Password**: Fitur untuk mengubah password pengguna.
* **Pengaturan Avatar**: Upload atau hapus avatar pengguna.

### 5. **Pengelolaan Transaksi**

* **Riwayat Transaksi**: Menampilkan daftar transaksi yang telah dilakukan oleh kasir.
* **Filter Laporan**: Admin dan kasir dapat memfilter laporan transaksi berdasarkan kriteria tertentu (tanggal, kategori, tipe order, dll).

### 6. **Logout dan Session Handling**

* **Logout dengan SweetAlert2**: Menggunakan SweetAlert2 untuk konfirmasi logout agar pengguna lebih berhati-hati sebelum keluar dari sistem.
* **Session Expiration**: Menangani sesi pengguna dengan memastikan bahwa pengguna tidak dapat mengakses halaman yang tidak memiliki role sebelum login.

---

## Teknologi yang Digunakan

* **Frontend**:

  * React
  * React Router
  * TailwindCSS
  * Axios
  * SweetAlert2

* **Backend**:

  * Express.js
  * Sequelize (ORM)
  * PostgreSQL
  * Multer (untuk upload file)

* **Autentikasi**:

  * JWT (JSON Web Token)
  * Role-based access control (RBAC)

---

## Fitur Pengguna

### 1. **Kasir**

* Login dan logout dengan autentikasi JWT.
* Akses ke dashboard kasir untuk mengelola menu, melihat histori transaksi, dan melakukan transaksi baru.
* Laporan transaksi yang dapat diekspor ke format PDF atau Excel.
* Pengaturan profil kasir (ganti password, upload avatar).

### 2. **Admin**

* Akses ke dashboard admin untuk mengelola menu dan laporan penjualan.
* Melihat transaksi dari semua kasir.
* Pengaturan profil admin (ganti password, upload avatar).

---

## Setup dan Instalasi

### 1. **Persyaratan**

* Node.js dan npm
* PostgreSQL
* React.js

### 2. **Instalasi Backend (Express + PostgreSQL)**

1. Clone repository ini:

   ```bash
   git clone https://github.com/ilhamhafizha/pos-system-app.git
   ```

2. Masuk ke folder proyek:

   ```bash
   cd pos-system-app
   ```

3. Instal semua dependensi backend:

   ```bash
   cd backend
   npm install
   ```

4. Konfigurasi **PostgreSQL** dan buat database yang sesuai. Pastikan untuk mengatur koneksi database di file konfigurasi backend.

5. Jalankan server backend:

   ```bash
   npm run start
   ```

### 3. **Instalasi Frontend (React)**

1. Masuk ke folder frontend:

   ```bash
   cd frontend
   ```

2. Instal semua dependensi frontend:

   ```bash
   npm install
   ```

3. Jalankan server frontend:

   ```bash
   npm start
   ```

---

## Cara Menggunakan

1. **Login**:

   * Masuk ke halaman login dan masukkan email dan password untuk kasir atau admin.
   * Setelah berhasil login, akan diarahkan ke dashboard sesuai dengan peran (cashier atau admin).

2. **Manajemen Menu**:

   * Admin dapat menambah, mengedit, dan menghapus menu di dashboard admin.
   * Kasir dapat memilih menu untuk transaksi di dashboard kasir.

3. **Logout**:

   * Klik icon logout di header untuk keluar dari aplikasi.

---

## Tampilan Aplikasi

### **Login, Register, dan Reset Password**

| **Fitur**          | **Screenshot**                                                                                     |
| ------------------ | -------------------------------------------------------------------------------------------------- |
| **Login**          | ![Login](https://github.com/user-attachments/assets/5a2530b0-aba8-47e5-a0f3-6f162d2832a4)          |
| **Register**       | ![Register](https://github.com/user-attachments/assets/818a0939-6500-418a-92b4-ab1dbcf4d398)       |
| **Reset Password** | ![Reset Password](https://github.com/user-attachments/assets/0b2c2275-9450-4fe9-8eaa-55b422ad52ad) |

### **Dashboard Kasir**

| **Fitur**                  | **Screenshot**                                                                                             |
| -------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Dashboard Kasir**        | ![Kasir Dashboard](https://github.com/user-attachments/assets/865f2181-3ac7-49d8-8e9a-c6ab759570ae)        |
| **Sales Report Kasir**     | ![Sales Report Kasir](https://github.com/user-attachments/assets/e9d46c19-b4d6-4dae-86f9-959021c2c6e1)     |
| **Settings Kasir**         | ![Settings Kasir](https://github.com/user-attachments/assets/a20414e1-2ffc-4351-bd5c-e870d349e8b2)         |
| **Transaksi Kasir**        | ![Transaksi Kasir](https://github.com/user-attachments/assets/53d1971f-b3c4-4f8f-ae7e-79f76a3e9283)        |
| **Struk Pembayaran Kasir** | ![Struk Pembayaran Kasir](https://github.com/user-attachments/assets/a8ca3dee-d926-4e58-a903-7e023d87dd5c) |

### **Dashboard Admin**

| **Fitur**                  | **Screenshot**                                                                                             |
| -------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Admin Dashboard**        | ![Admin Dashboard](https://github.com/user-attachments/assets/2656e5d0-068b-4e39-b0e2-e5d8b50594f6)        |
| **List Menu Admin**        | ![List Menu Admin](https://github.com/user-attachments/assets/a3104933-b0b4-4065-919f-05c15914e034)        |
| **Sales Report Admin**     | ![Sales Report Admin](https://github.com/user-attachments/assets/277db879-ffb8-4dc6-9ee8-19d2d80b6032)     |
| **Settings Admin**         | ![Settings Admin](https://github.com/user-attachments/assets/d5e9e146-0a8a-466c-9da0-eb82245fdc76)         |
| **Struk Pembayaran Admin** | ![Struk Pembayaran Admin](https://github.com/user-attachments/assets/7e68dab9-aa3c-4eca-8d9d-ed96436948d6) |

---
 Slide https://shorturl.at/ehg1z
