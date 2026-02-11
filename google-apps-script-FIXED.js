/**
 * FIXED Google Apps Script Backend for FOR ALL HOME CARE
 * 
 * This version has proper CORS headers to work with GitHub Pages
 * 
 * SETUP INSTRUCTIONS:
 * 1. Open your Google Sheet
 * 2. Go to Extensions > Apps Script
 * 3. DELETE ALL existing code
 * 4. PASTE this entire file
 * 5. Click Deploy > New Deployment
 * 6. Select "Web app"
 * 7. Set "Execute as" to "Me"
 * 8. Set "Who has access" to "Anyone"
 * 9. Click Deploy
 * 10. Copy the deployment URL and update api-client-googlesheets.js
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
    
    return createResponse({ error: 'Invalid action' }, 400);
  } catch (error) {
    return createResponse({ error: error.toString() }, 500);
  }
}

/**
 * Handle OPTIONS requests for CORS preflight
 * This is CRITICAL for POST requests to work from browsers
 */
function doOptions(e) {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle POST requests
 */
function doPost(e) {
  try {
    const action = e.parameter.action;
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
    
    return createResponse({ error: 'Invalid action' }, 400);
  } catch (error) {
    return createResponse({ error: error.toString() }, 500);
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
  
  const appointments = [];
  // Skip header row (index 0)
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
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
      serviceType: typeof row[11] === 'string' ? row[11].split(', ') : [row[11]],
      notes: row[12],
      status: row[13],
      submittedAt: row[14]
    });
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
  // Skip header row (index 0)
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    evaluations.push({
      id: row[0],
      appointmentId: row[1],
      evaluationType: row[2],
      evaluatorName: row[3],
      parentGuardianName: row[4],
      clientName: row[5],
      serviceProviderName: row[6],
      serviceType: typeof row[7] === 'string' ? row[7].split(', ') : [row[7]],
      email: row[8],
      responses: JSON.parse(row[9]),
      submittedAt: row[10]
    });
  }
  
  return createResponse({ evaluations: evaluations });
}

/**
 * Update appointment status
 */
function updateAppointmentStatus(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME_APPOINTMENTS);
  const dataRange = sheet.getDataRange().getValues();
  
  for (let i = 1; i < dataRange.length; i++) {
    if (dataRange[i][0] == data.appointmentId) {
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
  const dataRange = sheet.getDataRange().getValues();
  
  for (let i = 1; i < dataRange.length; i++) {
    if (dataRange[i][0] == data.appointmentId) {
      sheet.deleteRow(i + 1);
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
  const dataRange = sheet.getDataRange().getValues();
  
  for (let i = 1; i < dataRange.length; i++) {
    if (dataRange[i][0] == data.evaluationId) {
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
 * This is critical for allowing requests from GitHub Pages
 */
function createResponse(data, statusCode = 200) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
