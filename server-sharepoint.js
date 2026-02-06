const express = require('express');
const cors = require('cors');
const axios = require('axios');
const msal = require('@azure/msal-node');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Microsoft Graph API Configuration
const msalConfig = {
  auth: {
    clientId: process.env.AZURE_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}`,
    clientSecret: process.env.AZURE_CLIENT_SECRET,
  }
};

const cca = new msal.ConfidentialClientApplication(msalConfig);

// SharePoint Configuration
const SHAREPOINT_SITE_URL = process.env.SHAREPOINT_SITE_URL; // e.g., yourcompany.sharepoint.com/sites/HomeCare
const APPOINTMENTS_LIST_NAME = process.env.APPOINTMENTS_LIST_NAME || 'Appointments';
const EVALUATIONS_LIST_NAME = process.env.EVALUATIONS_LIST_NAME || 'Evaluations';

// Get access token for Microsoft Graph
async function getAccessToken() {
  const tokenRequest = {
    scopes: ['https://graph.microsoft.com/.default'],
  };

  try {
    const response = await cca.acquireTokenByClientCredential(tokenRequest);
    return response.accessToken;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
}

// Make Graph API request
async function makeGraphRequest(method, endpoint, data = null) {
  const token = await getAccessToken();
  
  const config = {
    method,
    url: `https://graph.microsoft.com/v1.0${endpoint}`,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  if (data) {
    config.data = data;
  }

  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error('Graph API Error:', error.response?.data || error.message);
    throw error;
  }
}

// Submit appointment and evaluation
app.post('/api/appointments', async (req, res) => {
  try {
    const {
      appointmentId,
      evaluatorName,
      evaluatorSignature,
      parentGuardianName,
      clientName,
      serviceProviderName,
      email,
      phone,
      address,
      appointmentDate,
      appointmentTime,
      serviceType,
      notes,
      evaluation
    } = req.body;

    // Create appointment in SharePoint list
    const appointmentItem = {
      fields: {
        Title: clientName,
        AppointmentId: appointmentId.toString(),
        EvaluatorName: evaluatorName,
        EvaluatorSignature: evaluatorSignature || '',
        ParentGuardianName: parentGuardianName,
        ClientName: clientName,
        ServiceProviderName: serviceProviderName,
        Email: email,
        Phone: phone,
        Address: address,
        AppointmentDate: appointmentDate,
        AppointmentTime: appointmentTime,
        ServiceTypes: serviceType.join(', '),
        Notes: notes || '',
        Status: 'Pending'
      }
    };

    const appointmentResponse = await makeGraphRequest(
      'POST',
      `/sites/${SHAREPOINT_SITE_URL}/lists/${APPOINTMENTS_LIST_NAME}/items`,
      appointmentItem
    );

    // Create evaluation in SharePoint list
    const evaluationItem = {
      fields: {
        Title: `Evaluation - ${clientName}`,
        EvaluationId: evaluation.id.toString(),
        AppointmentId: appointmentId.toString(),
        EvaluationType: evaluation.evaluationType,
        EvaluatorName: evaluatorName,
        ParentGuardianName: parentGuardianName,
        ClientName: clientName,
        ServiceProviderName: serviceProviderName,
        ServiceTypes: serviceType.join(', '),
        Email: email,
        Responses: JSON.stringify(evaluation.responses)
      }
    };

    await makeGraphRequest(
      'POST',
      `/sites/${SHAREPOINT_SITE_URL}/lists/${EVALUATIONS_LIST_NAME}/items`,
      evaluationItem
    );

    res.status(201).json({
      success: true,
      message: 'Appointment and evaluation saved to SharePoint',
      appointmentId
    });

  } catch (error) {
    console.error('Error saving to SharePoint:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save to SharePoint',
      error: error.message
    });
  }
});

// Get all appointments
app.get('/api/appointments', async (req, res) => {
  try {
    const response = await makeGraphRequest(
      'GET',
      `/sites/${SHAREPOINT_SITE_URL}/lists/${APPOINTMENTS_LIST_NAME}/items?expand=fields`
    );

    const appointments = response.value.map(item => ({
      id: parseInt(item.fields.AppointmentId),
      evaluatorName: item.fields.EvaluatorName,
      evaluatorSignature: item.fields.EvaluatorSignature,
      parentGuardianName: item.fields.ParentGuardianName,
      clientName: item.fields.ClientName,
      serviceProviderName: item.fields.ServiceProviderName,
      email: item.fields.Email,
      phone: item.fields.Phone,
      address: item.fields.Address,
      appointmentDate: item.fields.AppointmentDate,
      appointmentTime: item.fields.AppointmentTime,
      serviceType: item.fields.ServiceTypes ? item.fields.ServiceTypes.split(', ') : [],
      notes: item.fields.Notes,
      status: item.fields.Status?.toLowerCase() || 'pending',
      submittedAt: item.fields.Created,
      sharePointId: item.id
    }));

    res.json({ success: true, appointments });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments',
      error: error.message
    });
  }
});

// Get all evaluations
app.get('/api/evaluations', async (req, res) => {
  try {
    const response = await makeGraphRequest(
      'GET',
      `/sites/${SHAREPOINT_SITE_URL}/lists/${EVALUATIONS_LIST_NAME}/items?expand=fields`
    );

    const evaluations = response.value.map(item => ({
      id: parseInt(item.fields.EvaluationId),
      appointmentId: parseInt(item.fields.AppointmentId),
      evaluationType: item.fields.EvaluationType,
      evaluatorName: item.fields.EvaluatorName,
      parentGuardianName: item.fields.ParentGuardianName,
      clientName: item.fields.ClientName,
      serviceProviderName: item.fields.ServiceProviderName,
      serviceType: item.fields.ServiceTypes ? item.fields.ServiceTypes.split(', ') : [],
      email: item.fields.Email,
      responses: JSON.parse(item.fields.Responses || '[]'),
      submittedAt: item.fields.Created,
      sharePointId: item.id
    }));

    res.json({ success: true, evaluations });
  } catch (error) {
    console.error('Error fetching evaluations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch evaluations',
      error: error.message
    });
  }
});

// Update appointment status
app.patch('/api/appointments/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Find the SharePoint item
    const listItems = await makeGraphRequest(
      'GET',
      `/sites/${SHAREPOINT_SITE_URL}/lists/${APPOINTMENTS_LIST_NAME}/items?expand=fields&$filter=fields/AppointmentId eq '${id}'`
    );

    if (listItems.value.length === 0) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const itemId = listItems.value[0].id;

    // Update the item
    await makeGraphRequest(
      'PATCH',
      `/sites/${SHAREPOINT_SITE_URL}/lists/${APPOINTMENTS_LIST_NAME}/items/${itemId}/fields`,
      { Status: status.charAt(0).toUpperCase() + status.slice(1) }
    );

    res.json({ success: true, message: 'Status updated' });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update status',
      error: error.message
    });
  }
});

// Delete appointment
app.delete('/api/appointments/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete appointment
    const appointmentItems = await makeGraphRequest(
      'GET',
      `/sites/${SHAREPOINT_SITE_URL}/lists/${APPOINTMENTS_LIST_NAME}/items?expand=fields&$filter=fields/AppointmentId eq '${id}'`
    );

    if (appointmentItems.value.length > 0) {
      await makeGraphRequest(
        'DELETE',
        `/sites/${SHAREPOINT_SITE_URL}/lists/${APPOINTMENTS_LIST_NAME}/items/${appointmentItems.value[0].id}`
      );
    }

    // Find and delete related evaluations
    const evaluationItems = await makeGraphRequest(
      'GET',
      `/sites/${SHAREPOINT_SITE_URL}/lists/${EVALUATIONS_LIST_NAME}/items?expand=fields&$filter=fields/AppointmentId eq '${id}'`
    );

    for (const item of evaluationItems.value) {
      await makeGraphRequest(
        'DELETE',
        `/sites/${SHAREPOINT_SITE_URL}/lists/${EVALUATIONS_LIST_NAME}/items/${item.id}`
      );
    }

    res.json({ success: true, message: 'Appointment deleted' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete appointment',
      error: error.message
    });
  }
});

// Delete evaluation
app.delete('/api/evaluations/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const evaluationItems = await makeGraphRequest(
      'GET',
      `/sites/${SHAREPOINT_SITE_URL}/lists/${EVALUATIONS_LIST_NAME}/items?expand=fields&$filter=fields/EvaluationId eq '${id}'`
    );

    if (evaluationItems.value.length > 0) {
      await makeGraphRequest(
        'DELETE',
        `/sites/${SHAREPOINT_SITE_URL}/lists/${EVALUATIONS_LIST_NAME}/items/${evaluationItems.value[0].id}`
      );
    }

    res.json({ success: true, message: 'Evaluation deleted' });
  } catch (error) {
    console.error('Error deleting evaluation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete evaluation',
      error: error.message
    });
  }
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await getAccessToken();
    res.json({
      success: true,
      message: 'Server is running',
      sharepoint: 'connected'
    });
  } catch (error) {
    res.status(500).json({
      success: true,
      message: 'Server is running',
      sharepoint: 'disconnected',
      error: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📋 Client form: http://localhost:${PORT}/index.html`);
  console.log(`👨‍💼 Admin dashboard: http://localhost:${PORT}/index.html?admin=true`);
  console.log(`📊 Using SharePoint Lists for data storage`);
});
