# 🚀 QUICK START - Google Sheets Setup

## FOR ALL HOME CARE - Make it work from anywhere!

Follow these steps to enable cloud storage so clients can submit from ANY device/network and you can see it everywhere.

---

## ⏱️ 10-Minute Setup

### **Step 1: Create Google Sheet** (2 minutes)

1. Go to https://sheets.google.com
2. Click **+ Blank** 
3. Rename to: **FOR ALL HOME CARE Database**

---

### **Step 2: Add the Backend Code** (3 minutes)

1. In your sheet: **Extensions** → **Apps Script**
2. Delete the default code
3. Open this file on your PC:
   ```
   C:\Users\yohan\OneDrive\Desktop\Forallhomecare\google-apps-script.js
   ```
4. Copy ALL the code
5. Paste into Apps Script
6. Click **Save** (💾)

---

### **Step 3: Deploy** (3 minutes)

1. Click **Deploy** → **New deployment**
2. Click ⚙️ → Select **Web app**
3. Settings:
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Click **Deploy**
5. **Authorize** (click Advanced → Go to... → Allow)
6. **COPY THE WEB APP URL** (looks like https://script.google.com/macros/s/...)

---

### **Step 4: Connect to Your Site** (2 minutes)

1. Open this file on your PC:
   ```
   C:\Users\yohan\OneDrive\Desktop\Forallhomecare\api-client-googlesheets.js
   ```
2. Find line 4:
   ```javascript
   const GOOGLE_SHEETS_API_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';
   ```
3. Replace `YOUR_GOOGLE_APPS_SCRIPT_URL_HERE` with the URL you copied
4. Save the file

---

### **Step 5: Deploy to GitHub** (1 minute)

Open PowerShell in your project folder and run:
```powershell
cd "C:\Users\yohan\OneDrive\Desktop\Forallhomecare"
git add api-client-googlesheets.js
git commit -m "Configure Google Sheets API URL"
git push
```

---

### **Step 6: Test It!** ✅

Wait 2 minutes for GitHub Pages to update, then:

1. **Submit from mobile:**
   ```
   https://yohannesdev.github.io/home-care-system/
   ```

2. **Check your Google Sheet** - New data should appear!

3. **Check admin on PC:**
   ```
   https://yohannesdev.github.io/home-care-system/?admin=true
   ```

4. **See the same data everywhere!** 🎉

---

## ✅ Success Checklist

- [ ] Google Sheet created
- [ ] Apps Script code added
- [ ] Web app deployed and authorized
- [ ] URL copied
- [ ] api-client-googlesheets.js updated with URL
- [ ] Changes pushed to GitHub
- [ ] Tested submission from mobile
- [ ] Data appears in Google Sheet
- [ ] Data appears in admin dashboard

---

## 🆘 Need Help?

**Can't find the file?**
- Use File Explorer to navigate to: `C:\Users\yohan\OneDrive\Desktop\Forallhomecare`
- Right-click the file → Open with → Notepad

**Forgot the URL?**
- Apps Script → Deploy → Manage deployments → Copy URL

**Not seeing data?**
- Check Apps Script logs: View → Logs
- Make sure URL is correct in api-client-googlesheets.js
- Wait 2-3 minutes after pushing to GitHub

---

📖 **Full Documentation:** See [GOOGLE-SHEETS-SETUP.md](GOOGLE-SHEETS-SETUP.md)
