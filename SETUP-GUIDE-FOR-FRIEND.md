# 🚀 Solvia Nova Portfolio - Setup Guide

Halo! Ini adalah panduan lengkap untuk menjalankan website Solvia Nova Portfolio di komputer Anda.

## 📋 Yang Anda Butuhkan

### 1. Install Bun (JavaScript Runtime)
```bash
# Windows (PowerShell as Administrator)
powershell -c "irm bun.sh/install.ps1 | iex"

# Atau download dari: https://bun.sh/
```

### 2. Text Editor (Pilih salah satu)
- **VS Code** (Recommended): https://code.visualstudio.com/
- **Sublime Text**: https://www.sublimetext.com/
- **Notepad++**: https://notepad-plus-plus.org/

## 🚀 Cara Menjalankan Website

### Step 1: Extract Files
1. Extract file ZIP yang diberikan
2. Buka folder hasil extract

### Step 2: Install Dependencies
```bash
# Buka terminal/command prompt di folder project
# Jalankan perintah ini:
bun install
```

### Step 3: Jalankan Server
```bash
# Jalankan development server
bun run dev

# Atau alternatif:
bun run start
```

### Step 4: Buka Website
- Buka browser (Chrome, Firefox, Edge)
- Kunjungi: **http://localhost:3000**

## 🎯 Apa yang Akan Anda Lihat

✅ **Hero Section** - Dengan animasi partikel biru
✅ **About Section** - Informasi perusahaan
✅ **Services Section** - 4 paket layanan
✅ **Portfolio Section** - 6 contoh project
✅ **Testimonials** - Carousel testimoni klien
✅ **Contact Form** - Form kontak yang berfungsi
✅ **Social Media Icons** - LinkedIn, GitHub, Twitter

## 🛠️ Cara Edit Konten

### Mengubah Nama Perusahaan
**File**: `public/index.html`
```html
<!-- Cari dan ganti: -->
<div class="nav-brand">Solvia Nova</div>
<h1 class="hero-title">Solvia Nova</h1>

<!-- Dengan nama perusahaan Anda -->
```

### Mengubah Informasi Kontak
**File**: `public/index.html` (bagian contact-info)
```html
<p><strong>Email:</strong> <a href="mailto:email@anda.com">email@anda.com</a></p>
<p><strong>Phone:</strong> <a href="tel:+628123456789">+62 812-345-6789</a></p>
<p><strong>Address:</strong> Kota Anda, Indonesia</p>
```

### Mengubah Layanan
**File**: `data/services.json`
```json
{
  "id": "web-development",
  "name": "Nama Layanan Anda",
  "description": "Deskripsi layanan...",
  "features": ["Fitur 1", "Fitur 2", "Fitur 3"],
  "price": "Mulai dari Rp 5.000.000"
}
```

### Mengubah Portfolio
**File**: `data/portfolio.json`
```json
{
  "id": "project-1",
  "title": "Nama Project Anda",
  "description": "Deskripsi project...",
  "technologies": ["React", "Node.js", "MongoDB"],
  "category": "web"
}
```

### Mengubah Testimoni
**File**: `data/testimonials.json`
```json
{
  "id": "testimonial-1",
  "clientName": "Nama Klien",
  "company": "Nama Perusahaan",
  "text": "Testimoni klien...",
  "rating": 5
}
```

## 🎨 Mengubah Warna Tema

**File**: `public/css/styles.css`
```css
:root {
  /* Ganti warna-warna ini: */
  --color-primary: #1A1F3A;        /* Biru gelap utama */
  --color-accent: #00D9FF;         /* Cyan accent */
  --color-accent-secondary: #7B2FFF; /* Purple accent */
}
```

## 📁 Struktur Folder

```
solvia-nova-portfolio/
├── 📁 src/
│   ├── index.ts              # Server utama
│   └── 📁 api/              # API endpoints
├── 📁 public/
│   ├── index.html           # Halaman utama
│   ├── 📁 css/             # File CSS
│   └── 📁 js/              # File JavaScript
├── 📁 data/
│   ├── services.json        # Data layanan
│   ├── portfolio.json       # Data portfolio
│   └── testimonials.json    # Data testimoni
└── package.json             # Dependencies
```

## 🚨 Troubleshooting

### Website Tidak Muncul?
1. **Cek terminal** - Pastikan server running
2. **Hard refresh** - Tekan Ctrl+Shift+R
3. **Cek port** - Pastikan port 3000 tidak dipakai aplikasi lain
4. **Restart server** - Ctrl+C lalu `bun run dev` lagi

### Error saat Install?
1. **Update Bun**: `bun upgrade`
2. **Clear cache**: Hapus folder `node_modules` lalu `bun install` lagi
3. **Check internet**: Pastikan koneksi internet stabil

### Perubahan Tidak Terlihat?
1. **Save file** setelah edit
2. **Hard refresh browser** (Ctrl+Shift+R)
3. **Restart server** jika perlu

## 📞 Butuh Bantuan?

Jika ada masalah atau pertanyaan:
1. **Screenshot error** yang muncul
2. **Copy paste** pesan error dari terminal
3. **Hubungi** yang memberikan project ini

## 🎯 Tips Pengembangan

### Untuk Development:
- Gunakan `bun run dev` - Auto reload saat file berubah
- Buka Developer Tools (F12) untuk debug
- Edit file dan save, browser akan otomatis refresh

### Untuk Production:
- Jalankan `bun run build` untuk optimize files
- Deploy ke Vercel, Netlify, atau hosting lain

## 🚀 Next Steps

Setelah berhasil menjalankan:
1. **Customize konten** sesuai kebutuhan Anda
2. **Ganti gambar** portfolio dengan project Anda
3. **Update contact info** dengan info Anda
4. **Deploy online** agar bisa diakses publik

---

**Selamat mencoba! 🎉**

Semoga website portfolio ini bermanfaat untuk bisnis Anda!