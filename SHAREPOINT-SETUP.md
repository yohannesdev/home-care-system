# 📊 Microsoft 365 SharePoint Integration Guide
## FOR ALL HOME CARE AND AGENCY LLC

---

## 🎯 **Why SharePoint Lists?**

✅ **Already included** in your Microsoft 365 subscription  
✅ **No SQL Server** setup needed  
✅ **Access anywhere** - web, mobile, desktop  
✅ **Built-in security** and permissions  
✅ **HIPAA compliant** (with proper Microsoft 365 plan)  
✅ **Easy to view** data in SharePoint interface  
✅ **Power Automate** integration for workflows  
✅ **Automatic backups** by Microsoft  

---

## 🚀 **Setup Steps (30 minutes)**

### **Step 1: Create SharePoint Site**

1. Go to **SharePoint** in Microsoft 365
2. Click **"+ Create site"**
3. Select **"Team site"**
4. Name it: **"Home Care System"**
5. Description: **"Appointment and Evaluation Management"**
6. Click **"Finish"**

📝 **Note your site URL:** `https://yourcompany.sharepoint.com/sites/HomeCare`

---

### **Step 2: Create SharePoint Lists**

#### **A. Create Appointments List**

1. In your new site, click **"+ New"** → **"List"**
2. Choose **"Blank list"**
3. Name: **"Appointments"**
4. Click **"Create"**

5. **Add these columns** (click "+ Add column"):

| Column Name | Type | Required? |
|------------|------|-----------|
| AppointmentId | Single line of text | Yes |
| EvaluatorName | Single line of text | Yes |
| EvaluatorSignature | Single line of text | No |
| ParentGuardianName | Single line of text | Yes |
| ClientName | Single line of text | Yes |
| ServiceProviderName | Single line of text | Yes |
| Email | Single line of text | Yes |
| Phone | Single line of text | Yes |
| Address | Multiple lines of text | Yes |
| AppointmentDate | Date and time | Yes |
| AppointmentTime | Single line of text | Yes |
| ServiceTypes | Multiple lines of text | Yes |
| Notes | Multiple lines of text | No |
| Status | Choice (Pending, Approved, Declined) | Yes, Default: Pending |

#### **B. Create Evaluations List**

1. Click **"+ New"** → **"List"**
2. Name: **"Evaluations"**
3. Click **"Create"**

4. **Add these columns:**

| Column Name | Type | Required? |
|------------|------|-----------|
| EvaluationId | Single line of text | Yes |
| AppointmentId | Single line of text | Yes |
| EvaluationType | Choice (staff, parental) | Yes |
| EvaluatorName | Single line of text | Yes |
| ParentGuardianName | Single line of text | Yes |
| ClientName | Single line of text | Yes |
| ServiceProviderName | Single line of text | Yes |
| ServiceTypes | Multiple lines of text | Yes |
| Email | Single line of text | Yes |
| Responses | Multiple lines of text (Plain text) | Yes |

---

### **Step 3: Register Azure AD Application**

This allows your app to access SharePoint.

1. Go to **Azure Portal**: https://portal.azure.com
2. Navigate to **Azure Active Directory** → **App registrations**
3. Click **"+ New registration"**

**Fill in:**
- **Name:** `Home Care System API`
- **Supported account types:** `Accounts in this organizational directory only`
- **Redirect URI:** Leave blank for now
- Click **"Register"**

4. **Note these values** (you'll need them):
   - **Application (client) ID** - Copy this
   - **Directory (tenant) ID** - Copy this

5. **Create a Client Secret:**
   - Click **"Certificates & secrets"** (left menu)
   - Click **"+ New client secret"**
   - Description: `Home Care API Secret`
   - Expires: `24 months` (or your preference)
   - Click **"Add"**
   - **COPY THE SECRET VALUE NOW** (you won't see it again!)

6. **Set API Permissions:**
   - Click **"API permissions"** (left menu)
   - Click **"+ Add a permission"**
   - Select **"SharePoint"**
   - Select **"Application permissions"**
   - Check these permissions:
     - ✅ `Sites.ReadWrite.All`
   - Click **"Add permissions"**
   - Click **"✓ Grant admin consent for [Your Organization]"**
   - Click **"Yes"**

---

### **Step 4: Configure Your Application**

1. Open the folder: `C:\Users\yohan\OneDrive\Desktop\Forallhomecare`

2. Create `.env` file from template:
```powershell
Copy-Item .env.sharepoint.example .env
```

3. Edit `.env` file with your values:
```env
# From Azure AD App Registration
AZURE_CLIENT_ID=your-client-id-from-step-3
AZURE_TENANT_ID=your-tenant-id-from-step-3
AZURE_CLIENT_SECRET=your-client-secret-from-step-3

# From your SharePoint site
SHAREPOINT_SITE_URL=yourcompany.sharepoint.com:/sites/HomeCare
APPOINTMENTS_LIST_NAME=Appointments
EVALUATIONS_LIST_NAME=Evaluations

PORT=3000
```

---

### **Step 5: Install New Dependencies**

```powershell
npm install @azure/msal-node axios
```

---

### **Step 6: Start the Server**

```powershell
npm run start:sharepoint
```

You should see:
```
🚀 Server running on http://localhost:3000
📋 Client form: http://localhost:3000/index.html
👨‍💼 Admin dashboard: http://localhost:3000/index.html?admin=true
📊 Using SharePoint Lists for data storage
```

---

## 🎯 **How It Works**

1. **Client submits form** → Data goes to SharePoint Lists
2. **Admin views dashboard** → Data loads from SharePoint
3. **Admin changes status** → Updates SharePoint
4. **View in SharePoint** → Go to your site and see all data
5. **Export from SharePoint** → Built-in Excel export

---

## 📊 **View Data in SharePoint**

Go to: `https://yourcompany.sharepoint.com/sites/HomeCare`

You'll see:
- **Appointments** list - All appointment requests
- **Evaluations** list - All evaluation responses

You can:
- ✅ Filter and sort
- ✅ Export to Excel
- ✅ Create views
- ✅ Set up alerts
- ✅ Grant permissions to team members

---

## 🔔 **Bonus: Set Up Notifications with Power Automate**

1. Go to **Power Automate**: https://make.powerautomate.com
2. Click **"+ Create"** → **"Automated cloud flow"**
3. Name: `New Appointment Notification`
4. Trigger: **"When an item is created"** (SharePoint)
5. Select your site and **Appointments** list
6. Add action: **"Send an email (V2)"**
7. Configure email to admin
8. Save and test!

---

## 🔐 **Security & Permissions**

**SharePoint List Permissions:**
- Give admin team **"Edit"** access
- Keep lists **private** (not public)
- Use **item-level permissions** if needed

**Azure App Permissions:**
- Uses **Application permissions** (no user login needed)
- Runs as service account
- Secure the client secret!

---

## 🆘 **Troubleshooting**

### "Failed to get access token"
- ✅ Check client ID, tenant ID, and secret in .env
- ✅ Verify admin consent was granted in Azure AD
- ✅ Wait 5 minutes after granting consent

### "List not found"
- ✅ Check list names match exactly (case-sensitive)
- ✅ Verify site URL format: `company.sharepoint.com:/sites/SiteName`
- ✅ Ensure app has Sites.ReadWrite.All permission

### "Access denied"
- ✅ Grant admin consent in Azure AD
- ✅ Wait a few minutes for permissions to propagate
- ✅ Check SharePoint site permissions

---

## 📈 **Next Steps**

1. ✅ Test submitting an appointment
2. ✅ Check SharePoint list to see the data
3. ✅ Test admin dashboard
4. ✅ Set up Power Automate notifications
5. ✅ Deploy to Azure for public access

---

## 🌐 **Deploy to Azure (Optional)**

For public access:
1. Deploy Node.js app to **Azure App Service**
2. Configure environment variables
3. Enable HTTPS
4. Share the public URL with clients

---

**Need help with any step? Let me know!** 🚀
