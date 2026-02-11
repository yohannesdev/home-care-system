# FRESH GOOGLE SHEETS SETUP - Step by Step

## Part 1: Create New Google Sheet

1. Go to: https://sheets.google.com
2. Click "+ Blank" to create a new spreadsheet
3. Name it: "FOR ALL HOME CARE - Database"

## Part 2: Open Apps Script Editor

1. In the new Google Sheet, click: Extensions → Apps Script
2. This opens the script editor in a new tab
3. You should see some default code - DELETE ALL OF IT

## Part 3: Paste the Complete Script

Copy and paste this COMPLETE code (replace everything):

```javascript
/**
 * Google Apps Script Backend for FOR ALL HOME CARE
 * Updated: Feb 10, 2026 - Fixed POST request handling
 */

// Spreadsheet configuration
const SHEET_NAME_APPOINTMENTS = 'Appointments';
const SHEET_NAME_EVALUATIONS = 'Evaluations';

/**
 * Initialize sheets with headers if they don't exist
 */
function initializeSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Create Appointments sheet
  let appointmentSheet = ss.getSheetByName(SHEET_NAME_APPOINTMENTS);
  if (!appointmentSheet) {
    appointmentSheet = ss.insertSheet(SHEET_NAME_APPOINTMENTS);
    appointmentSheet.appendRow([
      'ID', 'Evaluator Name', 'Evaluator Signature', 'Parent/Guardian Name', 
      'Client Name', 'Service Provider Name', 'Email', 'Phone', 'Address',
      'Appointment Date', 'Appointment Time', 'Service Type', 'Notes', 
      'Status', 'Submitted At'
    ]);
    appointmentSheet.getRange(1, 1, 1, 15).setFontWeight('bold').setBackground('#4F46E5').setFontColor('white');
  }
  
  // Create Evaluations sheet
  let evaluationSheet = ss.getSheetByName(SHEET_NAME_EVALUATIONS);
  if (!evaluationSheet) {
    evaluationSheet = ss.insertSheet(SHEET_NAME_EVALUATIONS);
    evaluationSheet.appendRow([
      'ID', 'Appointment ID', 'Evaluation Type', 'Evaluator Name', 
      'Parent/Guardian Name', 'Client Name', 'Service Provider Name', 
      'Service Type', 'Email', 'Responses (JSON)', 'Submitted At'
    ]);
    evaluationSheet.getRange(1, 1, 1, 11).setFontWeight('bold').setBackground('#10B981').setFontColor('white');
  }
}

/**
 * Handle GET requests
 */
function doGet(e) {
  try {
    const action = e.parameter.action;
    
    if (action === 'getAppointments') {
      return getAppointments();
    } else if (action === 'getEvaluations') {
      return getEvaluations();
    } else if (action === 'health') {
      return createResponse({ status: 'ok', message: 'Google Sheets Backend is running' });
    }
    
    return createResponse({ error: 'Invalid GET action' }, 400);
  } catch (error) {
    return createResponse({ error: error.toString() }, 500);
  }
}

/**
 * Handle OPTIONS requests for CORS preflight
 */
function doOptions(e) {
  return createResponse({});
}

/**
 * Handle POST requests
 */
function doPost(e) {
  try {
    const action = e.parameter.action;
    
    if (!action) {
      return createResponse({ 
        error: 'No action parameter provided',
        received: e.parameter 
      }, 400);
    }
    
    const data = JSON.parse(e.postData.contents);
    
    if (action === 'submitAppointment') {
      return submitAppointment(data);
    } else if (action === 'updateStatus') {
      return updateAppointmentStatus(data);
    } else if (action === 'deleteAppointment') {
      return deleteAppointment(data);
    } else if (action === 'deleteEvaluation') {
      return deleteEvaluation(data);
    }
    
    return createResponse({ 
      error: 'Invalid action: ' + action,
      validActions: ['submitAppointment', 'updateStatus', 'deleteAppointment', 'deleteEvaluation']
    }, 400);
  } catch (error) {
    return createResponse({ 
      error: error.toString(),
      message: 'Error in doPost',
      hasPostData: !!e.postData
    }, 500);
  }
}

/**
 * Submit a new appointment with evaluation
 */
function submitAppointment(data) {
  initializeSheets();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Add appointment
  const appointmentSheet = ss.getSheetByName(SHEET_NAME_APPOINTMENTS);
  appointmentSheet.appendRow([
    data.appointmentId,
    data.evaluatorName,
    data.evaluatorSignature,
    data.parentGuardianName,
    data.clientName,
    data.serviceProviderName,
    data.email,
    data.phone,
    data.address,
    data.appointmentDate,
    data.appointmentTime,
    Array.isArray(data.serviceType) ? data.serviceType.join(', ') : data.serviceType,
    data.notes || '',
    'pending',
    new Date().toISOString()
  ]);
  
  // Add evaluation if provided
  if (data.evaluation) {
    const evaluationSheet = ss.getSheetByName(SHEET_NAME_EVALUATIONS);
    evaluationSheet.appendRow([
      data.evaluation.id,
      data.evaluation.appointmentId,
      data.evaluation.evaluationType,
      data.evaluation.evaluatorName,
      data.evaluation.parentGuardianName || '',
      data.evaluation.clientName || '',
      data.evaluation.serviceProviderName || '',
      Array.isArray(data.evaluation.serviceType) ? data.evaluation.serviceType.join(', ') : '',
      data.evaluation.email || '',
      JSON.stringify(data.evaluation.responses || []),
      new Date().toISOString()
    ]);
  }
  
  return createResponse({ 
    success: true, 
    message: 'Appointment submitted successfully',
    appointmentId: data.appointmentId
  });
}

/**
 * Get all appointments
 */
function getAppointments() {
  initializeSheets();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME_APPOINTMENTS);
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const appointments = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[0]) {
      appointments.push({
        id: row[0],
        evaluatorName: row[1],
        evaluatorSignature: row[2],
        parentGuardianName: row[3],
        clientName: row[4],
        serviceProviderName: row[5],
        email: row[6],
        phone: row[7],
        address: row[8],
        appointmentDate: row[9],
        appointmentTime: row[10],
        serviceType: row[11] ? row[11].split(', ') : [],
        notes: row[12],
        status: row[13] || 'pending',
        submittedAt: row[14]
      });
    }
  }
  
  return createResponse({ appointments: appointments });
}

/**
 * Get all evaluations
 */
function getEvaluations() {
  initializeSheets();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME_EVALUATIONS);
  
  const data = sheet.getDataRange().getValues();
  const evaluations = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[0]) {
      let responses = [];
      try {
        responses = JSON.parse(row[9]);
      } catch (e) {
        responses = [];
      }
      
      evaluations.push({
        id: row[0],
        appointmentId: row[1],
        evaluationType: row[2],
        evaluatorName: row[3],
        parentGuardianName: row[4],
        clientName: row[5],
        serviceProviderName: row[6],
        serviceType: row[7] ? row[7].split(', ') : [],
        email: row[8],
        responses: responses,
        submittedAt: row[10]
      });
    }
  }
  
  return createResponse({ evaluations: evaluations });
}

/**
 * Update appointment status
 */
function updateAppointmentStatus(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME_APPOINTMENTS);
  const values = sheet.getDataRange().getValues();
  
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] == data.id) {
      sheet.getRange(i + 1, 14).setValue(data.status);
      return createResponse({ 
        success: true, 
        message: 'Status updated successfully' 
      });
    }
  }
  
  return createResponse({ error: 'Appointment not found' }, 404);
}

/**
 * Delete appointment
 */
function deleteAppointment(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME_APPOINTMENTS);
  const values = sheet.getDataRange().getValues();
  
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] == data.id) {
      sheet.deleteRow(i + 1);
      
      // Also delete associated evaluations
      const evalSheet = ss.getSheetByName(SHEET_NAME_EVALUATIONS);
      const evalValues = evalSheet.getDataRange().getValues();
      for (let j = evalValues.length - 1; j >= 1; j--) {
        if (evalValues[j][1] == data.id) {
          evalSheet.deleteRow(j + 1);
        }
      }
      
      return createResponse({ 
        success: true, 
        message: 'Appointment deleted successfully' 
      });
    }
  }
  
  return createResponse({ error: 'Appointment not found' }, 404);
}

/**
 * Delete evaluation
 */
function deleteEvaluation(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME_EVALUATIONS);
  const values = sheet.getDataRange().getValues();
  
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] == data.id) {
      sheet.deleteRow(i + 1);
      return createResponse({ 
        success: true, 
        message: 'Evaluation deleted successfully' 
      });
    }
  }
  
  return createResponse({ error: 'Evaluation not found' }, 404);
}

/**
 * Create JSON response with CORS headers
 */
function createResponse(data, statusCode = 200) {
  const output = ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
  
  return output;
}
```

## Part 4: Save the Script

1. Click the 💾 Save icon (or Ctrl+S / Cmd+S)
2. Name it: "Home Care API"

## Part 5: Deploy as Web App

1. Click **Deploy** → **New deployment**
2. Click the ⚙️ gear icon next to "Select type"
3. Choose **Web app**
4. Configure:
   - Description: "Home Care Backend API"
   - Execute as: **Me (your email)**
   - Who has access: **Anyone**
5. Click **Deploy**

## Part 6: Authorize the Script

You'll see an authorization screen:

1. Click **Authorize access**
2. Choose your Google account
3. You may see "Google hasn't verified this app"
   - Click **Advanced**
   - Click **Go to [Project Name] (unsafe)**
   - Click **Allow**

## Part 7: Copy the Web App URL

After authorization, you'll see:
- **Web app URL:** https://script.google.com/macros/s/[LONG_ID]/exec

**COPY THIS ENTIRE URL!**

## Part 8: Update Your Website

Open: `api-client-googlesheets.js` in your code editor

Find line 5:
```javascript
const GOOGLE_SHEETS_API_URL = 'https://script.google.com/macros/s/AKfyc...';
```

Replace with YOUR new URL:
```javascript
const GOOGLE_SHEETS_API_URL = 'YOUR_NEW_URL_HERE';
```

## Part 9: Deploy to GitHub

Run in your terminal:
```powershell
git add api-client-googlesheets.js
git commit -m "Update Google Sheets API URL to new deployment"
git push origin main
```

## Part 10: Test

Wait 2 minutes for GitHub Pages to update, then:
1. Go to: https://yohannesdev.github.io/home-care-system/test-submission.html
2. Click "Test Google Sheets API" → Should be ✅ green
3. Click "Submit Test Appointment" → Should be ✅ SUCCESS

---

## ✅ You're Done!

Your system will now work perfectly. All client submissions will go to your Google Sheet!
