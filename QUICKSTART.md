# 🚀 QUICK START GUIDE
## FOR ALL HOME CARE AND AGENCY LLC

---

## ⚡ Fast Setup (5 minutes)

### Step 1: Run Setup Script
```powershell
.\setup.ps1
```
This installs all dependencies automatically.

### Step 2: Configure Database
Edit `.env` file:
```
DB_USER=your_sql_username
DB_PASSWORD=your_password
DB_SERVER=localhost
```

### Step 3: Start Server
```powershell
.\start.ps1
```
OR
```powershell
npm start
```

### Step 4: Open in Browser
- **Client Form:** http://localhost:3000/index.html
- **Admin Panel:** http://localhost:3000/index.html?admin=true

---

## 📋 What You Get

### ✅ Complete System Features:
- Appointment request form
- Staff/Service evaluation
- Parental provider evaluation
- Admin dashboard
- Automatic email notifications
- Export to Excel/CSV
- SQL Server database storage
- Microsoft 365 integration ready

---

## 🗄️ Database Options

### Option 1: Local SQL Server (Recommended for Testing)
1. Install SQL Server Express (free)
2. Use `localhost` as server
3. Run `database-setup.sql` in SSMS

### Option 2: Azure SQL Database (Recommended for Production)
1. Create Azure SQL Database
2. Set server: `your-server.database.windows.net`
3. Add your IP to firewall
4. Update `.env` with Azure credentials

---

## 📧 Email Setup (Optional)

### Microsoft 365:
```env
EMAIL_USER=yourname@yourdomain.com
EMAIL_PASSWORD=your_app_password
ADMIN_EMAIL=admin@yourdomain.com
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
```

**Get App Password:**
1. Go to Microsoft Account Security
2. Enable 2-factor authentication
3. Create App Password
4. Use that in `.env`

---

## 🔧 Common Issues & Solutions

### "Cannot connect to database"
✅ Check SQL Server is running  
✅ Verify username/password in `.env`  
✅ For Azure: Add IP to firewall rules  

### "Port 3000 already in use"
✅ Change PORT=3001 in `.env`  

### "Email not sending"
✅ Use App Password, not regular password  
✅ Enable "Less secure apps" or App Password  

---

## 📊 How Data Flows

1. **Client submits form** → Saves to SQL Server
2. **Server sends email** → Admin gets notification
3. **Admin reviews** → Approves/declines in dashboard
4. **Export data** → Download as CSV/Excel

---

## 🔐 Production Checklist

Before going live:
- [ ] Use strong database password
- [ ] Enable HTTPS/SSL
- [ ] Set up proper backup schedule
- [ ] Add admin authentication
- [ ] Configure firewall rules
- [ ] Test email notifications
- [ ] Review HIPAA compliance requirements

---

## 🆘 Need Help?

**Check these files:**
- `README.md` - Full documentation
- `database-setup.sql` - Manual database setup
- `server.js` - Backend code
- `api-client.js` - Frontend API integration

**Test server:**
```powershell
curl http://localhost:3000/api/health
```

---

## 🔄 Upgrading to Microsoft Power Apps

For full HIPAA compliance:
1. Export data to CSV from admin dashboard
2. Create Power Apps account
3. Set up Dataverse tables
4. Import CSV data
5. Build Power Apps interface

**Benefits:**
- HIPAA BAA included
- No server maintenance
- Automatic backups
- Microsoft 365 integration
- Mobile apps included

---

## 📱 File Structure

```
Forallhomecare/
├── index.html          ← Main app (open this)
├── server.js           ← Backend API
├── api-client.js       ← API integration
├── package.json        ← Dependencies
├── .env                ← Your configuration
├── database-setup.sql  ← Database script
├── setup.ps1           ← Setup script
├── start.ps1           ← Start script
└── README.md           ← Full docs
```

---

## ✨ You're All Set!

Your home care system is ready to use. Start with the client form to test submissions, then check the admin dashboard to manage them.

**Questions?** See README.md for detailed documentation.
