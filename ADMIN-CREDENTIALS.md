# 🔐 Admin Login Credentials - Solvia Nova Portfolio

## 🚀 Default Admin Access

### **Login URL:**
- **Local Development:** `http://localhost:3000/login`
- **Production (Vercel):** `https://your-app.vercel.app/login`

### **Default Credentials:**
```
Username: admin
Password: solvia2024
```

## 🛡️ Security Features

### **Authentication System:**
- ✅ **JWT Tokens** - Secure token-based authentication
- ✅ **Password Hashing** - bcrypt with salt rounds
- ✅ **Rate Limiting** - Max 5 failed attempts per IP
- ✅ **Session Expiry** - 24 hour automatic logout
- ✅ **IP Lockout** - 15 minute lockout after failed attempts
- ✅ **Secure Headers** - Authorization Bearer tokens

### **Protection Mechanisms:**
- ✅ **Frontend Protection** - Redirect to login if not authenticated
- ✅ **Backend Protection** - All admin APIs require valid JWT
- ✅ **Token Validation** - Server-side token verification
- ✅ **Auto Logout** - Session cleanup on browser close
- ✅ **CSRF Protection** - Token-based request validation

## 🔧 How to Change Admin Password

### **Step 1: Generate New Password Hash**
```bash
# In your project directory
bun run -e "
import { generatePasswordHash } from './src/auth/admin-config.ts';
console.log(await generatePasswordHash('your-new-password'));
"
```

### **Step 2: Update Configuration**
Edit `src/auth/admin-config.ts`:
```typescript
export const ADMIN_CONFIG = {
  username: 'admin', // Change username if needed
  passwordHash: 'YOUR_NEW_HASH_HERE', // Replace with generated hash
  // ... rest of config
};
```

### **Step 3: Update Vercel Configuration**
Edit `api/index.js`:
```javascript
const ADMIN_CONFIG = {
  username: 'admin', // Change username if needed
  passwordHash: 'YOUR_NEW_HASH_HERE', // Replace with generated hash
  // ... rest of config
};
```

## 🚨 Security Best Practices

### **IMPORTANT - Change Default Credentials:**
1. **Never use default credentials in production**
2. **Use strong passwords (12+ characters)**
3. **Include numbers, symbols, uppercase/lowercase**
4. **Change JWT secret key**
5. **Enable HTTPS in production**

### **Recommended Password Policy:**
- Minimum 12 characters
- Mix of uppercase/lowercase letters
- Include numbers and symbols
- Avoid dictionary words
- Change regularly (every 90 days)

### **JWT Secret Security:**
Change the JWT secret in both files:
```typescript
// src/auth/admin-config.ts
jwtSecret: 'your-super-secure-random-string-here'

// api/index.js  
jwtSecret: 'your-super-secure-random-string-here'
```

## 📱 Usage Instructions

### **Login Process:**
1. Navigate to `/login`
2. Enter username and password
3. Click "Masuk ke Admin Panel"
4. Automatic redirect to `/admin` on success
5. Access all CMS features

### **Logout Process:**
1. Click "🚪 Logout" button in admin panel
2. Confirm logout in dialog
3. Automatic redirect to login page
4. Session tokens cleared

### **Session Management:**
- **Auto-expire:** 24 hours
- **Manual logout:** Click logout button
- **Browser close:** Tokens remain (until expiry)
- **Failed auth:** Redirect to login

## 🔍 Troubleshooting

### **Can't Login:**
1. Check username/password spelling
2. Wait 15 minutes if locked out
3. Clear browser localStorage
4. Check server logs for errors

### **Session Expired:**
1. Login again with credentials
2. Check system time/timezone
3. Verify JWT secret matches

### **Rate Limited:**
1. Wait 15 minutes for lockout to expire
2. Check IP address restrictions
3. Clear failed attempts cache

## 🌐 Production Deployment

### **Environment Variables (Optional):**
```bash
# Vercel Environment Variables
ADMIN_USERNAME=your-admin-username
ADMIN_PASSWORD_HASH=your-hashed-password
JWT_SECRET=your-jwt-secret-key
```

### **Security Headers:**
Ensure HTTPS is enabled in production for secure token transmission.

---

**⚠️ SECURITY WARNING:** Always change default credentials before deploying to production!