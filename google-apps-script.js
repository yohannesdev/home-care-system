/**
 * Google Apps Script Backend for FOR ALL HOME CARE
 * 
 * This script creates a REST API using Google Sheets as the database
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a new Google Sheet
 * 2. Go to Extensions > Apps Script
 * 3. Delete any code and paste this entire file
 * 4. Click Deploy > New Deployment
 * 5. Select "Web app", set access to "Anyone"
 * 6. Copy the deployment URL
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
  const headers = data[0];
  const appointments = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[0]) { // If ID exists
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
    if (row[0]) { // If ID exists
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
      sheet.getRange(i + 1, 14).setValue(data.status); // Status column
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
        if (evalValues[j][1] == data.id) { // appointmentId column
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
  
  // Add CORS headers to allow requests from GitHub Pages
  return output;
}
