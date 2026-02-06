// API Client for Home Care System - Google Sheets Backend
// Replace YOUR_GOOGLE_APPS_SCRIPT_URL_HERE with your actual deployment URL

const GOOGLE_SHEETS_API_URL = 'https://script.google.com/macros/s/AKfycbwpCEVZ7cJBBEHV8SYlWmyv9XROGNYlwL-TGWu9ctlUCRTDOTVnCZ2boqzMwlvCKlzvfVw/exec';

class HomeCareAPI {
  // Submit appointment with evaluation
  static async submitAppointment(appointmentData, evaluationData) {
    try {
      const response = await fetch(`${GOOGLE_SHEETS_API_URL}?action=submitAppointment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appointmentId: appointmentData.id,
          evaluatorName: appointmentData.evaluatorName,
          evaluatorSignature: appointmentData.evaluatorSignature,
          parentGuardianName: appointmentData.parentGuardianName,
          clientName: appointmentData.clientName,
          serviceProviderName: appointmentData.serviceProviderName,
          email: appointmentData.email,
          phone: appointmentData.phone,
          address: appointmentData.address,
          appointmentDate: appointmentData.appointmentDate,
          appointmentTime: appointmentData.appointmentTime,
          serviceType: appointmentData.serviceType,
          notes: appointmentData.notes,
          evaluation: evaluationData
        }),
        redirect: 'follow'
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Get all appointments
  static async getAppointments() {
    try {
      const response = await fetch(`${GOOGLE_SHEETS_API_URL}?action=getAppointments`, {
        method: 'GET',
        redirect: 'follow'
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      return data.appointments || [];
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Get all evaluations
  static async getEvaluations() {
    try {
      const response = await fetch(`${GOOGLE_SHEETS_API_URL}?action=getEvaluations`, {
        method: 'GET',
        redirect: 'follow'
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      return data.evaluations || [];
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Update appointment status
  static async updateAppointmentStatus(id, status) {
    try {
      const response = await fetch(`${GOOGLE_SHEETS_API_URL}?action=updateStatus`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status }),
        redirect: 'follow'
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Delete appointment
  static async deleteAppointment(id) {
    try {
      const response = await fetch(`${GOOGLE_SHEETS_API_URL}?action=deleteAppointment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
        redirect: 'follow'
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Delete evaluation
  static async deleteEvaluation(id) {
    try {
      const response = await fetch(`${GOOGLE_SHEETS_API_URL}?action=deleteEvaluation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
        redirect: 'follow'
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Health check
  static async healthCheck() {
    try {
      const response = await fetch(`${GOOGLE_SHEETS_API_URL}?action=health`, {
        method: 'GET',
        redirect: 'follow'
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }
}

// Check if Google Sheets API is configured
if (typeof window !== 'undefined') {
  window.HomeCareAPI = HomeCareAPI;
  
  if (GOOGLE_SHEETS_API_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
    console.warn('⚠️ Google Sheets API URL not configured. Using localStorage only mode.');
    console.warn('📋 Follow GOOGLE-SHEETS-SETUP.md to set up cloud storage.');
  } else {
    console.log('✅ Google Sheets API configured');
  }
}
