// API Client for Home Care System - Google Sheets Backend
// Fixed version with proper error handling and CORS support

const GOOGLE_SHEETS_API_URL = 'https://script.google.com/macros/s/AKfycbxjGyx9cIscN2_TB0T3_FZF6rC3UybgwVkuxHLqayQxI8hjnAxBkg8evMJ7LzHYRoqE1w/exec';

class HomeCareAPI {
  // Helper method to make requests with proper error handling
  static async makeRequest(action, data = null) {
    try {
      let url = `${GOOGLE_SHEETS_API_URL}?action=${action}`;
      
      // For Google Apps Script, we need to use GET with query params for all requests
      // because POST often triggers CORS issues
      if (data) {
        // Convert data to query parameters
        const params = new URLSearchParams();
        params.append('data', JSON.stringify(data));
        url += `&${params.toString()}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        mode: 'cors', // Explicitly set CORS mode
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      return result;
    } catch (error) {
      console.error(`❌ API Error (${action}):`, error.message);
      throw error;
    }
  }

  // Submit appointment with evaluation
  static async submitAppointment(appointmentData, evaluationData) {
    console.log('📤 Submitting appointment to Google Sheets...');
    return await this.makeRequest('submitAppointment', {
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
    const result = await this.makeRequest('getAppointments');
    return result.appointments || [];
  }

  // Get all evaluations
  static async getEvaluations() {
    console.log('📥 Fetching evaluations from Google Sheets...');
    const result = await this.makeRequest('getEvaluations');
    return result.evaluations || [];
  }

  // Update appointment status
  static async updateAppointmentStatus(id, status) {
    console.log(`📝 Updating appointment ${id} status to ${status}...`);
    return await this.makeRequest('updateStatus', { id, status });
  }

  // Delete appointment
  static async deleteAppointment(id) {
    console.log(`🗑️ Deleting appointment ${id}...`);
    return await this.makeRequest('deleteAppointment', { id });
  }

  // Delete evaluation
  static async deleteEvaluation(id) {
    console.log(`🗑️ Deleting evaluation ${id}...`);
    return await this.makeRequest('deleteEvaluation', { id });
  }

  // Health check
  static async healthCheck() {
    try {
      console.log('🏥 Checking Google Sheets API health...');
      const result = await this.makeRequest('health');
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
