// API Client for Home Care System
// This replaces localStorage with backend API calls

const API_BASE_URL = 'http://localhost:3000/api';

class HomeCareAPI {
  // Submit appointment with evaluation
  static async submitAppointment(appointmentData, evaluationData) {
    try {
      const response = await fetch(`${API_BASE_URL}/appointments`, {
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
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit appointment');
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
      const response = await fetch(`${API_BASE_URL}/appointments`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch appointments');
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
      const response = await fetch(`${API_BASE_URL}/evaluations`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch evaluations');
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
      const response = await fetch(`${API_BASE_URL}/appointments/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update status');
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
      const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete appointment');
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
      const response = await fetch(`${API_BASE_URL}/evaluations/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete evaluation');
      }
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Health check
  static async checkHealth() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Health Check Failed:', error);
      return { success: false, message: 'Cannot connect to server' };
    }
  }
}

// Export for use in HTML
if (typeof window !== 'undefined') {
  window.HomeCareAPI = HomeCareAPI;
}
