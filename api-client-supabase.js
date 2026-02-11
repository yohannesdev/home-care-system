/**
 * Supabase API Client for FOR ALL HOME CARE
 * This replaces the Google Sheets backend with a proper Supabase PostgreSQL database
 */

// Supabase Configuration
const SUPABASE_URL = 'https://gwpxmrasgdpbvocupcmh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_aB9hkpYwia6VdFY7k2qVRg_h1PXi318';

// Initialize Supabase client (requires @supabase/supabase-js loaded from CDN)
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Home Care API wrapper for Supabase
 */
const HomeCareAPI = {
  /**
   * Submit a new appointment with evaluation
   */
  async submitAppointment(appointmentData) {
    try {
      console.log('Submitting appointment to Supabase:', appointmentData);
      
      // Insert appointment
      const { data: appointment, error: appointmentError } = await supabaseClient
        .from('appointments')
        .insert([{
          id: appointmentData.appointmentId,
          evaluator_name: appointmentData.evaluatorName,
          evaluator_signature: appointmentData.evaluatorSignature,
          parent_guardian_name: appointmentData.parentGuardianName,
          client_name: appointmentData.clientName,
          service_provider_name: appointmentData.serviceProviderName,
          email: appointmentData.email,
          phone: appointmentData.phone,
          address: appointmentData.address,
          appointment_date: appointmentData.appointmentDate,
          appointment_time: appointmentData.appointmentTime,
          service_type: Array.isArray(appointmentData.serviceType) 
            ? appointmentData.serviceType.join(', ') 
            : appointmentData.serviceType,
          notes: appointmentData.notes || '',
          status: 'pending'
        }])
        .select();
      
      if (appointmentError) {
        console.error('Appointment insert error:', appointmentError);
        throw appointmentError;
      }
      
      console.log('Appointment inserted successfully:', appointment);
      
      // Insert evaluation if provided
      if (appointmentData.evaluation) {
        const { data: evaluation, error: evaluationError } = await supabaseClient
          .from('evaluations')
          .insert([{
            id: appointmentData.evaluation.id,
            appointment_id: appointmentData.evaluation.appointmentId,
            evaluation_type: appointmentData.evaluation.evaluationType,
            evaluator_name: appointmentData.evaluation.evaluatorName,
            parent_guardian_name: appointmentData.evaluation.parentGuardianName || '',
            client_name: appointmentData.evaluation.clientName || '',
            service_provider_name: appointmentData.evaluation.serviceProviderName || '',
            service_type: Array.isArray(appointmentData.evaluation.serviceType) 
              ? appointmentData.evaluation.serviceType.join(', ') 
              : '',
            email: appointmentData.evaluation.email || '',
            responses: appointmentData.evaluation.responses || []
          }])
          .select();
        
        if (evaluationError) {
          console.error('Evaluation insert error:', evaluationError);
          throw evaluationError;
        }
        
        console.log('Evaluation inserted successfully:', evaluation);
      }
      
      return {
        success: true,
        message: 'Appointment submitted successfully',
        appointmentId: appointmentData.appointmentId
      };
    } catch (error) {
      console.error('Error in submitAppointment:', error);
      throw error;
    }
  },

  /**
   * Get all appointments
   */
  async getAppointments() {
    try {
      console.log('Fetching appointments from Supabase...');
      
      const { data, error } = await supabaseClient
        .from('appointments')
        .select('*')
        .order('submitted_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching appointments:', error);
        throw error;
      }
      
      console.log('Appointments fetched:', data);
      
      // Transform data to match expected format
      const appointments = data.map(row => ({
        id: row.id,
        evaluatorName: row.evaluator_name,
        evaluatorSignature: row.evaluator_signature,
        parentGuardianName: row.parent_guardian_name,
        clientName: row.client_name,
        serviceProviderName: row.service_provider_name,
        email: row.email,
        phone: row.phone,
        address: row.address,
        appointmentDate: row.appointment_date,
        appointmentTime: row.appointment_time,
        serviceType: typeof row.service_type === 'string' 
          ? row.service_type.split(', ') 
          : [row.service_type],
        notes: row.notes,
        status: row.status,
        submittedAt: row.submitted_at
      }));
      
      return { appointments };
    } catch (error) {
      console.error('Error in getAppointments:', error);
      throw error;
    }
  },

  /**
   * Get all evaluations
   */
  async getEvaluations() {
    try {
      console.log('Fetching evaluations from Supabase...');
      
      const { data, error } = await supabaseClient
        .from('evaluations')
        .select('*')
        .order('submitted_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching evaluations:', error);
        throw error;
      }
      
      console.log('Evaluations fetched:', data);
      
      // Transform data to match expected format
      const evaluations = data.map(row => ({
        id: row.id,
        appointmentId: row.appointment_id,
        evaluationType: row.evaluation_type,
        evaluatorName: row.evaluator_name,
        parentGuardianName: row.parent_guardian_name,
        clientName: row.client_name,
        serviceProviderName: row.service_provider_name,
        serviceType: typeof row.service_type === 'string' 
          ? row.service_type.split(', ') 
          : [row.service_type],
        email: row.email,
        responses: row.responses,
        submittedAt: row.submitted_at
      }));
      
      return { evaluations };
    } catch (error) {
      console.error('Error in getEvaluations:', error);
      throw error;
    }
  },

  /**
   * Update appointment status
   */
  async updateAppointmentStatus(appointmentId, newStatus) {
    try {
      console.log('Updating appointment status:', { appointmentId, newStatus });
      
      const { data, error } = await supabaseClient
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', appointmentId)
        .select();
      
      if (error) {
        console.error('Error updating status:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        throw new Error('Appointment not found');
      }
      
      console.log('Status updated successfully:', data);
      
      return {
        success: true,
        message: 'Status updated successfully'
      };
    } catch (error) {
      console.error('Error in updateAppointmentStatus:', error);
      throw error;
    }
  },

  /**
   * Delete an appointment
   */
  async deleteAppointment(appointmentId) {
    try {
      console.log('Deleting appointment:', appointmentId);
      
      const { data, error } = await supabaseClient
        .from('appointments')
        .delete()
        .eq('id', appointmentId)
        .select();
      
      if (error) {
        console.error('Error deleting appointment:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        throw new Error('Appointment not found');
      }
      
      console.log('Appointment deleted successfully:', data);
      
      return {
        success: true,
        message: 'Appointment deleted successfully'
      };
    } catch (error) {
      console.error('Error in deleteAppointment:', error);
      throw error;
    }
  },

  /**
   * Delete an evaluation
   */
  async deleteEvaluation(evaluationId) {
    try {
      console.log('Deleting evaluation:', evaluationId);
      
      const { data, error } = await supabaseClient
        .from('evaluations')
        .delete()
        .eq('id', evaluationId)
        .select();
      
      if (error) {
        console.error('Error deleting evaluation:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        throw new Error('Evaluation not found');
      }
      
      console.log('Evaluation deleted successfully:', data);
      
      return {
        success: true,
        message: 'Evaluation deleted successfully'
      };
    } catch (error) {
      console.error('Error in deleteEvaluation:', error);
      throw error;
    }
  }
};

console.log('Supabase API Client loaded successfully');
console.log('Supabase URL:', SUPABASE_URL);
