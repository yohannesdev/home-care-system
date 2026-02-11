// API Client for Home Care System - Google Sheets Backend
// Fixed version with proper error handling and CORS support

const GOOGLE_SHEETS_API_URL = 'https://script.google.com/macros/s/AKfycbykLGCIdCutBrNpFV0FtObBGF4RxiciNqKYl2OtOnP-RXGcB3UVF8k5mQ-LXDrVkZfGXA/exec';

class HomeCareAPI {
  // GET request for read operations
  static async makeGetRequest(action) {
    try {
      const url = `${GOOGLE_SHEETS_API_URL}?action=${action}`;
      
      console.log(`🔵 Making GET request to: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        mode: 'cors',
      });

      console.log(`📥 Response status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ HTTP Error Response:`, errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log(`✅ Response data:`, result);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      return result;
    } catch (error) {
      console.error(`❌ API Error (${action}):`, error.message);
      console.error(`❌ Full error:`, error);
      throw error;
    }
  }

  // POST request for write operations
  static async makePostRequest(action, data) {
    try {
      const url = `${GOOGLE_SHEETS_API_URL}?action=${action}`;
      
      console.log(`🔵 Making POST request to: ${url}`);
      console.log(`📦 Sending data:`, data);
      
      const response = await fetch(url, {
        method: 'POST',
        redirect: 'follow',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      console.log(`📥 Response status: ${response.status} ${response.statusText}`);
      console.log(`📥 Response headers:`, response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ HTTP Error Response Body:`, errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error(`❌ Non-JSON response:`, text);
        throw new Error(`Expected JSON response but got: ${contentType}`);
      }

      const result = await response.json();
      console.log(`✅ Response data:`, result);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      return result;
    } catch (error) {
      console.error(`❌ API Error (${action}):`, error.message);
      console.error(`❌ Full error:`, error);
      throw error;
    }
  }

  // Submit appointment with evaluation
  static async submitAppointment(appointmentData, evaluationData) {
    console.log('📤 Submitting appointment to Google Sheets...');
    return await this.makePostRequest('submitAppointment', {
      appointmentId: appointmentData.id,
      evaluatorName: appointmentData.evaluatorName,
      evaluatorSignature: appointmentData.evaluatorSignature || '',
      parentGuardianName: appointmentData.parentGuardianName,
      clientName: appointmentData.clientName,
      serviceProviderName: appointmentData.serviceProviderName,
      email: appointmentData.email,
      phone: appointmentData.phone,
      address: appointmentData.address,
      appointmentDate: appointmentData.appointmentDate,
      appointmentTime: appointmentData.appointmentTime,
      serviceType: Array.isArray(appointmentData.serviceType) 
        ? appointmentData.serviceType.join(', ') 
        : appointmentData.serviceType,
      notes: appointmentData.notes || '',
      status: appointmentData.status || 'pending',
      submittedAt: appointmentData.submittedAt,
      evaluation: evaluationData
    });
  }

  // Get all appointments
  static async getAppointments() {
    console.log('📥 Fetching appointments from Google Sheets...');
    const result = await this.makeGetRequest('getAppointments');
    return result.appointments || [];
  }

  // Get all evaluations
  static async getEvaluations() {
    console.log('📥 Fetching evaluations from Google Sheets...');
    const result = await this.makeGetRequest('getEvaluations');
    return result.evaluations || [];
  }

  // Update appointment status
  static async updateAppointmentStatus(id, status) {
    console.log(`📝 Updating appointment ${id} status to ${status}...`);
    return await this.makePostRequest('updateStatus', { id, status });
  }

  // Delete appointment
  static async deleteAppointment(id) {
    console.log(`🗑️ Deleting appointment ${id}...`);
    return await this.makePostRequest('deleteAppointment', { id });
  }

  // Delete evaluation
  static async deleteEvaluation(id) {
    console.log(`🗑️ Deleting evaluation ${id}...`);
    return await this.makePostRequest('deleteEvaluation', { id });
  }

  // Health check
  static async healthCheck() {
    try {
      console.log('🏥 Checking Google Sheets API health...');
      const result = await this.makeGetRequest('health');
      console.log('✅ Google Sheets API is healthy:', result);
      return result;
    } catch (error) {
      console.warn('⚠️ Google Sheets API health check failed:', error.message);
      return { status: 'error', message: error.message };
    }
  }

  // Test if API is accessible
  static async isAvailable() {
    try {
      const health = await this.healthCheck();
      return health.status === 'ok' || health.status === 'healthy';
    } catch (error) {
      return false;
    }
  }
}

// Initialize and check configuration
if (typeof window !== 'undefined') {
  window.HomeCareAPI = HomeCareAPI;
  
  if (GOOGLE_SHEETS_API_URL.includes('YOUR_GOOGLE_APPS_SCRIPT_URL_HERE')) {
    console.warn('⚠️ Google Sheets API URL not configured. Using localStorage only mode.');
    console.warn('📋 Follow GOOGLE-SHEETS-SETUP.md to set up cloud storage.');
  } else {
    console.log('✅ Google Sheets API URL configured');
    
    // Test connection on load (non-blocking)
    HomeCareAPI.healthCheck()
      .then(result => {
        if (result.status === 'ok' || result.status === 'healthy') {
          console.log('✅ Google Sheets connection successful');
        }
      })
      .catch(err => {
        console.warn('⚠️ Google Sheets connection failed. App will use localStorage only.');
        console.warn('Error:', err.message);
      });
  }
}
