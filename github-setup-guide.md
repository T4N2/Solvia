# 🐙 GitHub Setup Guide - Solvia Nova Portfolio

## 📋 Persiapan

### 1. Buat Akun GitHub (jika belum punya)
- Kunjungi: https://github.com
- Daftar dengan email
- Verifikasi email

### 2. Install Git (jika belum ada)
- Download: https://git-scm.com/download/win
- Install dengan setting default

## 🚀 Upload Project ke GitHub

### Step 1: Buat Repository Baru
1. Login ke GitHub
2. Klik tombol **"New"** atau **"+"** → **"New repository"**
3. Isi form:
   - **Repository name**: `solvia-nova-portfolio`
   - **Description**: `Modern portfolio website for Solvia Nova software house`
   - **Visibility**: Public (atau Private jika tidak ingin publik)
   - ✅ Centang **"Add a README file"**
   - ✅ Centang **"Add .gitignore"** → pilih **"Node"**
4. Klik **"Create repository"**

### Step 2: Clone Repository ke Local
```bash
# Buka terminal/command prompt
# Navigate ke folder parent (bukan di dalam folder solvia)
cd C:\path\to\parent\folder

# Clone repository
git clone https://github.com/USERNAME/solvia-nova-portfolio.git
```

### Step 3: Copy Files ke Repository
1. Copy semua file dari folder Solvia yang sekarang
2. Paste ke folder `solvia-nova-portfolio` yang baru di-clone
3. **JANGAN copy folder ini:**
   - `node_modules/`
   - `.git/` (jika ada)
   - `bun.lockb`

### Step 4: Upload ke GitHub
```bash
# Masuk ke folder repository
cd solvia-nova-portfolio

# Add semua files
git add .

# Commit dengan message
git commit -m "Initial commit: Solvia Nova Portfolio Website"

# Push ke GitHub
git push origin main
```

## 🎯 Cara Kawan Anda Download

### Opsi 1: Download ZIP
1. Buka repository di GitHub
2. Klik tombol **"Code"** (hijau)
3. Klik **"Download ZIP"**
4. Extract ZIP
5. Buka terminal di folder hasil extract
6. Run: `bun install`
7. Run: `bun run dev`

### Opsi 2: Git Clone
```bash
git clone https://github.com/USERNAME/solvia-nova-portfolio.git
cd solvia-nova-portfolio
bun install
bun run dev
```

## 📝 Buat README.md yang Bagus

Buat file `README.md` di root folder dengan isi:

```markdown
# 🚀 Solvia Nova Portfolio

Modern portfolio website for software house agency built with Bun and Elysia.js.

## ✨ Features

- 🎨 Modern futuristic midnight blue theme
- 📱 Fully responsive design
- ⚡ Fast performance with Bun runtime
- 🎭 Smooth animations and effects
- 📧 Working contact form
- 🔧 Easy to customize

## 🛠️ Tech Stack

- **Runtime**: Bun
- **Backend**: Elysia.js
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Styling**: Custom CSS with CSS Variables
- **Email**: Nodemailer

## 🚀 Quick Start

1. **Install Bun** (if not installed):
   ```bash
   # Windows
   powershell -c "irm bun.sh/install.ps1 | iex"
   ```

2. **Clone and install**:
   ```bash
   git clone https://github.com/USERNAME/solvia-nova-portfolio.git
   cd solvia-nova-portfolio
   bun install
   ```

3. **Run development server**:
   ```bash
   bun run dev
   ```

4. **Open browser**: http://localhost:3000

## 📁 Project Structure

```
solvia-nova-portfolio/
├── src/
│   ├── index.ts          # Main server file
│   └── api/              # API endpoints
├── public/
│   ├── index.html        # Main HTML file
│   ├── css/              # Stylesheets
│   └── js/               # JavaScript files
├── data/
│   ├── services.json     # Services data
│   ├── portfolio.json    # Portfolio data
│   └── testimonials.json # Testimonials data
└── package.json
```

## 🎨 Customization

### Change Company Info
Edit `public/index.html`:
- Company name in navigation and hero
- Contact information
- Social media links

### Update Services
Edit `data/services.json` to modify service packages.

### Update Portfolio
Edit `data/portfolio.json` to add/modify projects.

### Update Testimonials
Edit `data/testimonials.json` to manage client testimonials.

## 📧 Contact Form Setup

The contact form requires email configuration. Update `src/api/contact.ts` with your email settings.

## 🚀 Deployment

### Vercel (Recommended)
1. Connect GitHub repository to Vercel
2. Deploy automatically

### Netlify
1. Connect GitHub repository to Netlify
2. Build command: `bun run build`
3. Publish directory: `public`

## 📄 License

MIT License - feel free to use for your projects!

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

---

Made with ❤️ by [Your Name]
```

## 🎯 Keuntungan GitHub

✅ **Version control** - Track semua perubahan
✅ **Collaboration** - Kawan bisa contribute
✅ **Backup** - Data aman di cloud
✅ **Professional** - Portfolio untuk developer
✅ **Easy sharing** - Cukup share link
✅ **Free hosting** - GitHub Pages gratis

## 📞 Need Help?

Jika ada masalah dengan setup GitHub, beri tahu saya!