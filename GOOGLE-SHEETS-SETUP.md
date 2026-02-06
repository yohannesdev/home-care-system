# 📊 Google Sheets Backend Setup Guide

## FOR ALL HOME CARE - Google Sheets Integration

This guide will help you set up Google Sheets as your cloud database so clients can submit from anywhere and you can see submissions on any device.

---

## 🎯 What You'll Get

✅ **Cloud-based storage** - Data accessible from any device  
✅ **Free forever** - No costs, uses your Google account  
✅ **Familiar interface** - View/manage data in Google Sheets  
✅ **Automatic backups** - Google handles it  
✅ **Works from anywhere** - Mobile data, WiFi, any network  

---

## 📝 Step-by-Step Setup (10 minutes)

### **Step 1: Create Google Sheet**

1. Go to [Google Sheets](https://sheets.google.com)
2. Click **+ Blank** to create a new spreadsheet
3. Rename it to: **FOR ALL HOME CARE - Database**
4. Keep this tab open

---

### **Step 2: Add Apps Script**

1. In your Google Sheet, click **Extensions** → **Apps Script**
2. You'll see a code editor with some default code
3. **Delete all the default code**
4. Open the file `google-apps-script.js` from your project folder
5. **Copy ALL the code** from that file
6. **Paste it** into the Apps Script editor
7. Click the **Save** icon (💾) or press `Ctrl+S`
8. Name the project: **Home Care API**

---

### **Step 3: Deploy as Web App**

1. In the Apps Script editor, click **Deploy** → **New deployment**
2. Click the **⚙️ gear icon** next to "Select type"
3. Choose **Web app**
4. Fill in the settings:
   - **Description:** `Home Care Backend API`
   - **Execute as:** `Me (your email)`
   - **Who has access:** `Anyone`
   
5. Click **Deploy**
6. Click **Authorize access**
7. Choose your Google account
8. Click **Advanced** → **Go to Home Care API (unsafe)**
9. Click **Allow**

---

### **Step 4: Copy Your Web App URL**

After deployment, you'll see a **Web app URL** like:
```
https://script.google.com/macros/s/AKfycbz.../exec
```

✅ **COPY THIS URL** - You'll need it in the next step!

---

### **Step 5: Update Your Frontend**

1. Open your project folder: `C:\Users\yohan\OneDrive\Desktop\Forallhomecare`
2. Open `api-client-googlesheets.js` (I'll create this for you)
3. Replace `YOUR_GOOGLE_APPS_SCRIPT_URL_HERE` with the URL you copied
4. Save the file

---

### **Step 6: Test It**

1. Go to your GitHub Pages site:
   ```
   https://yohannesdev.github.io/home-care-system/
   ```
2. Submit a test appointment
3. Go back to your Google Sheet
4. You should see **two new tabs:**
   - **Appointments** - with your submission
   - **Evaluations** - with evaluation data

✅ **If you see the data in Google Sheets, it's working!**

---

## 🎨 Google Sheet Features

Your Google Sheet will automatically:
- ✅ Create "Appointments" and "Evaluations" tabs
- ✅ Add headers with nice formatting
- ✅ Store all submissions with timestamps
- ✅ Update when you approve/decline appointments

### View/Manage Data:
- **Filter:** Use Google Sheets filters to find specific clients
- **Export:** Download as Excel, CSV, PDF
- **Share:** Share with staff (read-only or edit access)
- **Charts:** Create graphs/reports

---

## 🔧 Troubleshooting

### "Authorization required" error
- Go back to Apps Script → Deploy → Manage deployments
- Click ✏️ Edit → New version → Deploy
- Authorize again

### Data not appearing in sheets
- Check the Apps Script logs: View → Logs
- Make sure you deployed as "Anyone" can access

### Can't find the deployment URL
- Apps Script editor → Deploy → Manage deployments
- Copy the Web app URL

---

## 🔄 How to Update Later

If you need to modify the backend:
1. Edit the code in Apps Script
2. Click **Deploy** → **Manage deployments**
3. Click **✏️ Edit**
4. Under "Version," select **New version**
5. Click **Deploy**

Your URL stays the same!

---

## 🔐 Security Notes

- ✅ Google handles all security (HTTPS, authentication)
- ✅ Only you can edit the sheet (unless you share it)
- ✅ API is public but requires your specific URL
- ✅ For HIPAA compliance, use Google Workspace Business

---

## 📞 Next Steps

After setup:
1. Test from your mobile phone
2. Test from another PC
3. Share the client form URL with actual clients
4. Check submissions in your Google Sheet

**Need help?** Check the logs in Apps Script or ask for assistance.
