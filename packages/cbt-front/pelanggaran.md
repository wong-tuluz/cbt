# Sistem Deteksi Pelanggaran Ujian di Browser

Dokumen ini menjelaskan bagaimana sistem ujian (frontend) mendeteksi berbagai aktivitas peserta yang dianggap sebagai pelanggaran, seperti meminimalkan browser, berpindah tab, serta bagaimana perilaku ini berinteraksi dengan perangkat seluler (HP).

## 1. Bagaimana Browser Mendeteksi Minimize dan Pindah Tab?

Browser modern dilengkapi dengan API (Application Programming Interface) yang memungkinkan sebuah halaman web mengetahui apakah halaman tersebut sedang aktif dilihat oleh pengguna atau tidak. Ada dua mekanisme utama yang digunakan:

### A. Page Visibility API (`visibilitychange`)
Browser akan memicu event `visibilitychange` ketika status visibilitas sebuah tab berubah.
- Jika pengguna membuka tab lain, atau meminimalkan (minimize) jendela browser, status dokumen akan berubah menjadi `hidden` (`document.hidden = true`).
- Sistem ujian mendengarkan event ini. Begitu terdeteksi `hidden`, sistem akan langsung mencatatnya sebagai pelanggaran (strike).

### B. Window Focus dan Blur (`focus` dan `blur`)
- **`blur`**: Terjadi ketika halaman web kehilangan fokus. Misalnya, pengguna mengklik aplikasi lain di desktop, membuka Start Menu, atau menekan tombol `Alt + Tab`.
- **`focus`**: Terjadi ketika halaman web kembali mendapatkan fokus.
- Sistem ujian menggunakan event `blur` untuk mendeteksi kapan pengguna berhenti berinteraksi dengan halaman ujian, meskipun halamannya mungkin masih terlihat di layar.

## 2. Mengapa Mode Tidur (Sleep) di HP Dianggap Pelanggaran?

Ketika layar HP dimatikan (baik karena perangkat dibiarkan terlalu lama tanpa interaksi atau karena tombol power ditekan), sistem operasi (seperti Android atau iOS) akan menempatkan aplikasi yang sedang berjalan ke mode siaga (standby) untuk menghemat baterai. 

Saat proses ini terjadi, browser akan merespon dengan:
1. Menyatakan aplikasi kehilangan fokus (memicu event `blur`).
2. Mengubah status visibilitas halaman menjadi tersembunyi (memicu event `visibilitychange` menjadi `hidden`).

Bagi sistem ujian, event yang diterima dari browser persis sama dengan event ketika pengguna sengaja berpindah ke aplikasi lain. Keduanya memberikan sinyal bahwa aplikasi ujian tidak lagi aktif di layar, sehingga sistem otomatis mencatatnya sebagai pelanggaran.

## 3. Apakah Notifikasi dan Panggilan Telepon Juga Dianggap Pelanggaran?

**Ya, notifikasi dan panggilan telepon sering kali dianggap sebagai pelanggaran.**

Berikut adalah alasannya:
- **Panggilan Telepon (Telepon Seluler biasa atau aplikasi seperti WhatsApp)**: Saat ada panggilan masuk, layar antarmuka panggilan dari sistem operasi akan langsung muncul dan mengambil alih layar. Hal ini secara otomatis menempatkan browser ke latar belakang (background), sehingga memicu event `blur` dan `visibilitychange` (hidden).
- **Notifikasi**: 
  - Jika notifikasi hanya muncul sekilas di bagian atas (heads-up banner) dan tidak mengambil alih layar sepenuhnya, *mungkin* browser tidak kehilangan fokus.
  - Namun, **jika pengguna mengklik atau membalas (reply) dari notifikasi tersebut**, atau jika notifikasi pop-up tersebut mencuri fokus dari sistem, maka browser akan mengalami `blur`. Sistem ujian akan menangkap event ini dan menghitungnya sebagai pelanggaran.

### Kesimpulan
Sistem pengawasan ujian berbasis browser berpatokan secara ketat pada **fokus** (focus) dan **keterlihatan** (visibility) halaman web. Apapun tindakan yang menyebabkan halaman ujian kehilangan fokus atau tertutup dari layar utama—termasuk berpindah tab, layar yang tertidur (sleep), menerima telepon, atau berinteraksi dengan notifikasi—akan ditangkap oleh browser dan diteruskan ke sistem sebagai indikasi pelanggaran.
