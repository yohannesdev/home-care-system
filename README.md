# FOR ALL HOME CARE AND AGENCY LLC - System Setup

## 🎯 Overview
Complete home care agency system with appointment booking, staff/parental evaluations, and admin dashboard.

## 🚀 Quick Start Guide

### Option 1: Local File (No Backend)
Simply double-click `index.html` - data saves to browser localStorage

### Option 2: Node.js + SQL Server Backend (Recommended)

## 📋 Prerequisites
- Node.js (v14 or higher)
- SQL Server (Local or Azure SQL)
- Microsoft 365 account (optional, for email notifications)

## 🔧 Installation Steps

### 1. Install Dependencies
```bash
cd "c:\Users\yohan\OneDrive\Desktop\Forallhomecare"
npm install
```

### 2. Configure Database

#### For Local SQL Server:
1. Open SQL Server Management Studio (SSMS)
2. Create a new database named `HomeCareDB`:
   ```sql
   CREATE DATABASE HomeCareDB;
   ```
3. Tables will be created automatically on first run

#### For Azure SQL:
1. Create an Azure SQL Database
2. Note the server name: `your-server.database.windows.net`
3. Configure firewall to allow your IP

### 3. Setup Environment Variables
1. Copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env
   ```
2. Edit `.env` with your database credentials:
   ```
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_NAME=HomeCareDB
   DB_SERVER=localhost
   ```

### 4. Configure Email (Optional)
For Microsoft 365 email notifications, add to `.env`:
```
EMAIL_USER=yourname@yourdomain.com
EMAIL_PASSWORD=your_password
ADMIN_EMAIL=admin@yourdomain.com
```

**Note:** For Microsoft 365, you may need to create an App Password:
1. Go to https://account.microsoft.com/security
2. Enable 2-factor authentication
3. Create an App Password
4. Use that password in `.env`

### 5. Start the Server
```bash
npm start
```

Or for development with auto-restart:
```bash
npm run dev
```

## 🌐 Access the System

### Client Form (Public)
http://localhost:3000/index.html

### Admin Dashboard
http://localhost:3000/index.html?admin=true

## 🗄️ Database Schema

### Appointments Table
- Stores all appointment requests
- Status: pending, approved, declined

### Evaluations Table
- Links to appointments
- Stores evaluation type (staff or parental)

### EvaluationResponses Table
- Stores all Q&A pairs from evaluations

## 📧 Email Notifications
When configured, admin receives email for:
- New appointment submissions
- Contains client details and evaluation type

## 🔐 Security Recommendations

### For Production:
1. **Use Environment Variables** - Never commit `.env` file
2. **Enable SSL/TLS** - Use HTTPS for production
3. **Secure Database** - Use strong passwords, enable encryption
4. **Add Authentication** - Protect admin dashboard with login
5. **Rate Limiting** - Prevent spam submissions
6. **Input Validation** - Server-side validation implemented
7. **HIPAA Compliance** - Consider Microsoft Power Apps + Dataverse

## 🔄 Migrating to Microsoft Power Apps + Dataverse

For HIPAA compliance and enterprise features:

### Benefits:
✅ HIPAA-compliant BAA available  
✅ Part of Microsoft 365  
✅ No coding for admins  
✅ Automatic backups  
✅ Integration with Excel, Teams, Outlook  

### Steps:
1. Sign up for Power Apps (comes with Microsoft 365)
2. Create Dataverse tables matching our schema
3. Import data from SQL Server
4. Build Power Apps interface
5. Configure Power Automate for workflows

## 📊 Data Export
Admin can export to CSV/Excel from dashboard

## 🛠️ Troubleshooting

### Cannot connect to database
- Check SQL Server is running
- Verify credentials in `.env`
- Check firewall settings
- For Azure SQL: Add your IP to firewall rules

### Email not sending
- Verify Microsoft 365 credentials
- Use App Password instead of regular password
- Check SMTP settings

### Port 3000 already in use
Change port in `.env`:
```
PORT=3001
```

## 📱 Future Enhancements
- SMS notifications via Twilio
- Calendar integration
- Document uploads
- Digital signatures
- Mobile app (React Native)

## 📞 Support
For issues or questions, contact your system administrator.

## 📄 License
Proprietary - FOR ALL HOME CARE AND AGENCY LLC
