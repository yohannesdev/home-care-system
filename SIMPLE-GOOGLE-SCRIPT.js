/**
 * Google Apps Script for FOR ALL HOME CARE
 * SIMPLE VERSION - Copy this entire file
 */

function doGet(e) {
  const action = e.parameter.action;
  
  if (action === 'health') {
    return jsonResponse({ status: 'ok', message: 'API is running' });
  }
  
  if (action === 'getAppointments') {
    return jsonResponse({ appointments: getAllAppointments() });
  }
  
  if (action === 'getEvaluations') {
    return jsonResponse({ evaluations: getAllEvaluations() });
  }
  
  return jsonResponse({ error: 'Invalid GET action' });
}

function doPost(e) {
  const action = e.parameter.action;
  const data = JSON.parse(e.postData.contents);
  
  if (action === 'submitAppointment') {
    saveAppointment(data);
    return jsonResponse({ success: true, message: 'Saved successfully' });
  }
  
  if (action === 'updateStatus') {
    updateStatus(data.id, data.status);
    return jsonResponse({ success: true });
  }
  
  if (action === 'deleteAppointment') {
    deleteRow('Appointments', data.id);
    return jsonResponse({ success: true });
  }
  
  if (action === 'deleteEvaluation') {
    deleteRow('Evaluations', data.id);
    return jsonResponse({ success: true });
  }
  
  return jsonResponse({ error: 'Invalid POST action' });
}

function saveAppointment(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Appointments');
  
  if (!sheet) {
    sheet = ss.insertSheet('Appointments');
    sheet.appendRow(['ID', 'Evaluator', 'Parent/Guardian', 'Client', 'Provider', 'Email', 'Phone', 'Address', 'Date', 'Time', 'Services', 'Notes', 'Status', 'Submitted']);
  }
  
  sheet.appendRow([
    data.appointmentId,
    data.evaluatorName,
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
  
  if (data.evaluation) {
    let evalSheet = ss.getSheetByName('Evaluations');
    if (!evalSheet) {
      evalSheet = ss.insertSheet('Evaluations');
      evalSheet.appendRow(['ID', 'Appointment ID', 'Type', 'Evaluator', 'Client', 'Email', 'Responses', 'Submitted']);
    }
    
    evalSheet.appendRow([
      data.evaluation.id,
      data.evaluation.appointmentId,
      data.evaluation.evaluationType,
      data.evaluation.evaluatorName,
      data.evaluation.clientName,
      data.evaluation.email,
      JSON.stringify(data.evaluation.responses || []),
      new Date().toISOString()
    ]);
  }
}

function getAllAppointments() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Appointments');
  
  if (!sheet) return [];
  
  const data = sheet.getDataRange().getValues();
  const appointments = [];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) {
      appointments.push({
        id: data[i][0],
        evaluatorName: data[i][1],
        parentGuardianName: data[i][2],
        clientName: data[i][3],
        serviceProviderName: data[i][4],
        email: data[i][5],
        phone: data[i][6],
        address: data[i][7],
        appointmentDate: data[i][8],
        appointmentTime: data[i][9],
        serviceType: data[i][10] ? data[i][10].split(', ') : [],
        notes: data[i][11],
        status: data[i][12] || 'pending',
        submittedAt: data[i][13]
      });
    }
  }
  
  return appointments;
}

function getAllEvaluations() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Evaluations');
  
  if (!sheet) return [];
  
  const data = sheet.getDataRange().getValues();
  const evaluations = [];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) {
      evaluations.push({
        id: data[i][0],
        appointmentId: data[i][1],
        evaluationType: data[i][2],
        evaluatorName: data[i][3],
        clientName: data[i][4],
        email: data[i][5],
        responses: JSON.parse(data[i][6] || '[]'),
        submittedAt: data[i][7]
      });
    }
  }
  
  return evaluations;
}

function updateStatus(id, status) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Appointments');
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == id) {
      sheet.getRange(i + 1, 13).setValue(status);
      return;
    }
  }
}

function deleteRow(sheetName, id) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return;
  
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == id) {
      sheet.deleteRow(i + 1);
      return;
    }
  }
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
