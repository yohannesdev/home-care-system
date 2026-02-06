import React, { useState, useEffect } from 'react';
import { Calendar, ClipboardList, CheckCircle, XCircle, Download, Trash2, Users, FileText, Info, Cloud, Shield, Zap } from 'lucide-react';

export default function HomeCareAgencySystem() {
  // Check if admin mode is enabled via URL parameter
  const isAdmin = new URLSearchParams(window.location.search).get('admin') === 'true';
  
  const [activeTab, setActiveTab] = useState('appointments');
  const [showForm, setShowForm] = useState(true);
  
  // Client form state
  const [clientInfo, setClientInfo] = useState({
    evaluatorName: '',
    evaluatorSignature: '',
    parentGuardianName: '',
    clientName: '',
    serviceProviderName: '',
    email: '',
    phone: '',
    address: '',
    appointmentDate: '',
    appointmentTime: '',
    serviceType: [],
    notes: ''
  });
  
  const [evaluationType, setEvaluationType] = useState('staff'); // 'staff' or 'parental'
  const [evaluationData, setEvaluationData] = useState({});
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  
  // Data storage
  const [appointments, setAppointments] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [showPowerAppsInfo, setShowPowerAppsInfo] = useState(true);

  // Load data from localStorage on mount
  useEffect(() => {
    const storedAppointments = localStorage.getItem('homeCareAppointments');
    const storedEvaluations = localStorage.getItem('homeCareEvaluations');
    
    if (storedAppointments) setAppointments(JSON.parse(storedAppointments));
    if (storedEvaluations) setEvaluations(JSON.parse(storedEvaluations));
  }, []);

  const serviceTypes = [
    'Homemaker',
    'Personal Care',
    'Community Connection',
    'Supported Community Connection',
    'Respite',
    'Mentorship'
  ];

  // STAFF/SERVICE EVALUATION FORM (exact questions from PDF)
  const staffServiceQuestions = [
    { id: 'q1', question: 'Was the staff punctual and consistent with scheduled visits?', type: 'yesnosometimes' },
    { id: 'q2', question: 'Was the staff respectful, kind, and professional during visits?', type: 'yesnosometimes' },
    { id: 'q3', question: 'Did the staff complete all assigned duties (cleaning, laundry, cooking, outings, etc.) as expected?', type: 'yesnopartially' },
    { id: 'q4', question: 'Does the staff communicate well and follow instructions or care plans?', type: 'yesnosometimes' },
    { id: 'q5', question: 'Is the staff dressed cleanly and appropriately to provide services?', type: 'yesnosometimes' },
    { id: 'q6', question: 'Do you feel comfortable and safe having this staff in your home?', type: 'yesnosomewhat' },
    { id: 'q7', question: 'Do you feel your loved one is benefiting from the services being provided?', type: 'yesnonotsure' },
    { id: 'q8', question: 'How would you rate the quality of services received?', type: 'rating5' },
    { id: 'q9', question: 'Is your coordinator responsive and helpful in resolving any concerns?', type: 'yesnosometimes' },
    { id: 'q10', question: 'Has there been any previous incident or concern involving this staff that remains unresolved?', type: 'yesnonotsure', hasDescription: true },
    { id: 'q10_desc', question: 'If yes, please describe:', type: 'textarea', conditional: true },
    { id: 'q11', question: 'Has any inappropriate incident or behavior been reported involving this staff?', type: 'yesnonotsure', hasDescription: true },
    { id: 'q11_desc', question: 'If yes, please describe:', type: 'textarea', conditional: true },
    { id: 'q12', question: 'Has the staff failed to follow instructions or complete assigned tasks as expected?', type: 'yesnosometimes', hasDescription: true },
    { id: 'q12_desc', question: 'If yes, please describe:', type: 'textarea', conditional: true },
    { id: 'q13', question: 'Would you like to continue services with this staff?', type: 'yesnonotsure' },
    { id: 'q14', question: 'Any concerns, complaints, or suggestions for improvement?', type: 'textarea' }
  ];

  // PARENTAL PROVIDER EVALUATION FORM (exact questions from PDF)
  const parentalProviderQuestions = [
    { id: 'q1', question: 'Do you feel the services you provide are helping your child/family reach goals and maintain daily stability?', type: 'yesnosomewhat' },
    { id: 'q2', question: 'Since you began providing these services, have you noticed improvement in your child\'s or family\'s overall well-being?', type: 'yesnonotsure', hasDescription: true },
    { id: 'q2_desc', question: 'If yes, please describe briefly:', type: 'textarea', conditional: true },
    { id: 'q3', question: 'Does our agency provide the support, guidance, and resources you need to continue your role as a parental provider?', type: 'alwayssometimesrarely' },
    { id: 'q4', question: 'Is your assigned coordinator helpful and available when you have questions or need assistance?', type: 'yesnosometimes' },
    { id: 'q5', question: 'Are your questions about timesheets, billing, or EVV check-in/check-out answered promptly?', type: 'yesnosometimes' },
    { id: 'q6', question: 'Do you find the EVV app (check-in/check-out process) easy to use?', type: 'evvrating' },
    { id: 'q7', question: 'How would you describe your compensation?', type: 'compensation' },
    { id: 'q8', question: 'Do you believe the allotted service hours are enough to meet your client\'s needs?', type: 'yesnonotsure' },
    { id: 'q9', question: 'Would you like to continue providing services as a parental provider?', type: 'yesnoundecided' },
    { id: 'q10', question: 'Overall, how would you rate the quality of services and agency support?', type: 'rating5' },
    { id: 'q11', question: 'Do you have any complaints, challenges, or areas where the agency could improve?', type: 'textarea' },
    { id: 'q12', question: 'What suggestions or feedback would you like to share to improve the program?', type: 'textarea' }
  ];

  const currentQuestions = evaluationType === 'staff' ? staffServiceQuestions : parentalProviderQuestions;

  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  const validateForm = () => {
    const newErrors = {};
    
    // Client info validation
    if (!clientInfo.evaluatorName.trim()) newErrors.evaluatorName = 'Evaluator name is required';
    if (!clientInfo.parentGuardianName.trim()) newErrors.parentGuardianName = 'Parent/Guardian name is required';
    if (!clientInfo.clientName.trim()) newErrors.clientName = 'Client name is required';
    if (!clientInfo.serviceProviderName.trim()) newErrors.serviceProviderName = 'Service provider name is required';
    if (!clientInfo.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(clientInfo.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!clientInfo.phone.trim()) newErrors.phone = 'Phone is required';
    if (!clientInfo.address.trim()) newErrors.address = 'Address is required';
    if (!clientInfo.appointmentDate) newErrors.appointmentDate = 'Date is required';
    if (!clientInfo.appointmentTime) newErrors.appointmentTime = 'Time is required';
    if (clientInfo.serviceType.length === 0) newErrors.serviceType = 'Select at least one service type';

    // Validate evaluation responses (only non-conditional questions)
    currentQuestions.forEach(q => {
      if (!q.conditional && !evaluationData[q.id] && q.type !== 'textarea') {
        newErrors[q.id] = 'This field is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const timestamp = new Date().toISOString();
      const appointmentId = Date.now();

      const newAppointment = {
        id: appointmentId,
        ...clientInfo,
        status: 'pending',
        submittedAt: timestamp
      };

      const newEvaluation = {
        id: Date.now() + 1,
        appointmentId,
        evaluationType,
        evaluatorName: clientInfo.evaluatorName,
        evaluatorSignature: clientInfo.evaluatorSignature,
        parentGuardianName: clientInfo.parentGuardianName,
        clientName: clientInfo.clientName,
        serviceProviderName: clientInfo.serviceProviderName,
        serviceType: clientInfo.serviceType,
        email: clientInfo.email,
        responses: currentQuestions.map(q => ({
          questionId: q.id,
          question: q.question,
          answer: evaluationData[q.id] || 'Not answered',
          type: q.type
        })),
        submittedAt: timestamp
      };

      const updatedAppointments = [...appointments, newAppointment];
      const updatedEvaluations = [...evaluations, newEvaluation];

      setAppointments(updatedAppointments);
      setEvaluations(updatedEvaluations);

      localStorage.setItem('homeCareAppointments', JSON.stringify(updatedAppointments));
      localStorage.setItem('homeCareEvaluations', JSON.stringify(updatedEvaluations));

      setSubmitted(true);
    }
  };

  const handleReset = () => {
    setClientInfo({
      evaluatorName: '',
      evaluatorSignature: '',
      parentGuardianName: '',
      clientName: '',
      serviceProviderName: '',
      email: '',
      phone: '',
      address: '',
      appointmentDate: '',
      appointmentTime: '',
      serviceType: [],
      notes: ''
    });
    setEvaluationData({});
    setErrors({});
    setSubmitted(false);
    setShowForm(true);
  };

  const updateAppointmentStatus = (id, newStatus) => {
    const updated = appointments.map(apt => 
      apt.id === id ? { ...apt, status: newStatus } : apt
    );
    setAppointments(updated);
    localStorage.setItem('homeCareAppointments', JSON.stringify(updated));
  };

  const deleteAppointment = (id) => {
    const updated = appointments.filter(apt => apt.id !== id);
    setAppointments(updated);
    localStorage.setItem('homeCareAppointments', JSON.stringify(updated));
    
    // Also delete associated evaluation
    const updatedEvals = evaluations.filter(ev => ev.appointmentId !== id);
    setEvaluations(updatedEvals);
    localStorage.setItem('homeCareEvaluations', JSON.stringify(updatedEvals));
  };

  const deleteEvaluation = (id) => {
    const updated = evaluations.filter(ev => ev.id !== id);
    setEvaluations(updated);
    localStorage.setItem('homeCareEvaluations', JSON.stringify(updated));
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDateTime = (isoString) => {
    return new Date(isoString).toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const toggleServiceType = (type) => {
    const current = clientInfo.serviceType;
    if (current.includes(type)) {
      setClientInfo({...clientInfo, serviceType: current.filter(t => t !== type)});
    } else {
      setClientInfo({...clientInfo, serviceType: [...current, type]});
    }
  };

  const exportToExcel = () => {
    let csvContent = '';
    
    if (activeTab === 'appointments') {
      const headers = ['ID', 'Evaluator Name', 'Parent/Guardian Name', 'Client Name', 'Service Provider', 'Email', 'Phone', 'Address', 'Service Types', 'Date', 'Time', 'Notes', 'Status', 'Submitted At'];
      const rows = appointments.map(apt => [
        apt.id,
        apt.evaluatorName,
        apt.parentGuardianName,
        apt.clientName,
        apt.serviceProviderName,
        apt.email,
        apt.phone,
        apt.address,
        apt.serviceType.join('; '),
        apt.appointmentDate,
        apt.appointmentTime,
        apt.notes || '',
        apt.status,
        formatDateTime(apt.submittedAt)
      ]);
      
      csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');
    } else {
      const headers = ['Evaluation ID', 'Appointment ID', 'Evaluator Name', 'Parent/Guardian', 'Client Name', 'Service Provider', 'Service Types', 'Email', 'Type', 'Question', 'Answer', 'Submitted At'];
      const rows = [];
      
      evaluations.forEach(ev => {
        ev.responses.forEach(resp => {
          rows.push([
            ev.id,
            ev.appointmentId,
            ev.evaluatorName,
            ev.parentGuardianName,
            ev.clientName,
            ev.serviceProviderName,
            ev.serviceType.join('; '),
            ev.email,
            ev.evaluationType === 'staff' ? 'Staff/Service Evaluation' : 'Parental Provider Evaluation',
            resp.question,
            resp.answer,
            formatDateTime(ev.submittedAt)
          ]);
        });
      });
      
      csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FOR_ALL_HOME_CARE_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const renderQuestionInput = (q) => {
    // Don't render conditional questions unless parent is "Yes"
    if (q.conditional) {
      const parentId = q.id.replace('_desc', '');
      if (evaluationData[parentId] !== 'Yes') {
        return null;
      }
    }

    switch (q.type) {
      case 'yesnosometimes':
      case 'yesnosomewhat':
      case 'yesnonotsure':
      case 'yesnoundecided':
        const options = q.type === 'yesnosomewhat' ? ['Yes', 'No', 'Somewhat'] :
                       q.type === 'yesnonotsure' ? ['Yes', 'No', 'Not sure'] :
                       q.type === 'yesnoundecided' ? ['Yes', 'No', 'Undecided'] :
                       ['Yes', 'No', 'Sometimes'];
        return (
          <div className="flex gap-3">
            {options.map(opt => (
              <button
                key={opt}
                type="button"
                onClick={() => setEvaluationData({...evaluationData, [q.id]: opt})}
                className={`flex-1 py-3 rounded-lg border-2 font-semibold transition-all ${
                  evaluationData[q.id] === opt
                    ? 'border-indigo-600 bg-indigo-600 text-white'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        );

      case 'yesnopartially':
        return (
          <div className="flex gap-3">
            {['Yes', 'No', 'Partially'].map(opt => (
              <button
                key={opt}
                type="button"
                onClick={() => setEvaluationData({...evaluationData, [q.id]: opt})}
                className={`flex-1 py-3 rounded-lg border-2 font-semibold transition-all ${
                  evaluationData[q.id] === opt
                    ? 'border-indigo-600 bg-indigo-600 text-white'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        );

      case 'alwayssometimesrarely':
        return (
          <div className="flex gap-3">
            {['Always', 'Sometimes', 'Rarely'].map(opt => (
              <button
                key={opt}
                type="button"
                onClick={() => setEvaluationData({...evaluationData, [q.id]: opt})}
                className={`flex-1 py-3 rounded-lg border-2 font-semibold transition-all ${
                  evaluationData[q.id] === opt
                    ? 'border-indigo-600 bg-indigo-600 text-white'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        );

      case 'evvrating':
        return (
          <div className="grid grid-cols-2 gap-3">
            {['Yes', 'No', 'Sometimes', 'Needs improvement'].map(opt => (
              <button
                key={opt}
                type="button"
                onClick={() => setEvaluationData({...evaluationData, [q.id]: opt})}
                className={`py-3 rounded-lg border-2 font-semibold transition-all ${
                  evaluationData[q.id] === opt
                    ? 'border-indigo-600 bg-indigo-600 text-white'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        );

      case 'compensation':
        return (
          <div className="grid grid-cols-2 gap-3">
            {['Great', 'Fair', 'Unfair', 'Needs improvement'].map(opt => (
              <button
                key={opt}
                type="button"
                onClick={() => setEvaluationData({...evaluationData, [q.id]: opt})}
                className={`py-3 rounded-lg border-2 font-semibold transition-all ${
                  evaluationData[q.id] === opt
                    ? 'border-indigo-600 bg-indigo-600 text-white'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        );

      case 'rating5':
        return (
          <div className="flex gap-2">
            {['1 (Poor)', '2', '3', '4', '5 (Excellent)'].map((rating, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setEvaluationData({...evaluationData, [q.id]: rating})}
                className={`flex-1 py-3 rounded-lg border-2 font-semibold transition-all ${
                  evaluationData[q.id] === rating
                    ? 'border-indigo-600 bg-indigo-600 text-white'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                {rating}
              </button>
            ))}
          </div>
        );

      case 'textarea':
        return (
          <textarea
            value={evaluationData[q.id] || ''}
            onChange={(e) => setEvaluationData({...evaluationData, [q.id]: e.target.value})}
            rows="3"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
            placeholder="Your response..."
          />
        );

      default:
        return null;
    }
  };

  // ADMIN PANEL
  if (isAdmin) {
    const pendingCount = appointments.filter(a => a.status === 'pending').length;
    const approvedCount = appointments.filter(a => a.status === 'approved').length;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">FOR ALL HOME CARE AND AGENCY LLC</h1>
            <p className="text-gray-600">Admin Dashboard - Manage appointments and evaluations</p>
          </div>

          {/* Power Apps Recommendation Banner */}
          {showPowerAppsInfo && (
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-6 mb-6 text-white">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Cloud className="w-6 h-6" />
                    <h2 className="text-2xl font-bold">Recommended Upgrade: Microsoft Power Apps + Dataverse</h2>
                  </div>
                  <p className="text-blue-100 mb-4">
                    For a professional home care agency system, consider upgrading to Microsoft Power Apps + Dataverse for enhanced security, compliance, and scalability.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="w-5 h-5" />
                        <h3 className="font-semibold">HIPAA Compliance</h3>
                      </div>
                      <p className="text-sm text-blue-100">HIPAA-compliant option available for patient data protection</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-5 h-5" />
                        <h3 className="font-semibold">Easy Management</h3>
                      </div>
                      <p className="text-sm text-blue-100">No coding required for admins to manage the system</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-5 h-5" />
                        <h3 className="font-semibold">Microsoft 365 Integration</h3>
                      </div>
                      <p className="text-sm text-blue-100">Part of Microsoft 365 (you may already have access)</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Cloud className="w-5 h-5" />
                        <h3 className="font-semibold">Secure & Automated</h3>
                      </div>
                      <p className="text-sm text-blue-100">Automatic backups, secure cloud storage, connects to Excel & email</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowPowerAppsInfo(false)}
                  className="ml-4 text-white/80 hover:text-white transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-yellow-50 p-5 rounded-xl border border-yellow-200">
              <p className="text-yellow-800 text-sm font-medium">Pending</p>
              <p className="text-3xl font-bold text-yellow-900">{pendingCount}</p>
            </div>
            <div className="bg-green-50 p-5 rounded-xl border border-green-200">
              <p className="text-green-800 text-sm font-medium">Approved</p>
              <p className="text-3xl font-bold text-green-900">{approvedCount}</p>
            </div>
            <div className="bg-blue-50 p-5 rounded-xl border border-blue-200">
              <p className="text-blue-800 text-sm font-medium">Total Evaluations</p>
              <p className="text-3xl font-bold text-blue-900">{evaluations.length}</p>
            </div>
            <div className="bg-purple-50 p-5 rounded-xl border border-purple-200">
              <p className="text-purple-800 text-sm font-medium">Total Appointments</p>
              <p className="text-3xl font-bold text-purple-900">{appointments.length}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-t-2xl shadow-xl">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('appointments')}
                className={`flex items-center gap-2 px-8 py-4 font-semibold transition-colors ${
                  activeTab === 'appointments'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Calendar className="w-5 h-5" />
                Appointments
              </button>
              <button
                onClick={() => setActiveTab('evaluations')}
                className={`flex items-center gap-2 px-8 py-4 font-semibold transition-colors ${
                  activeTab === 'evaluations'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <ClipboardList className="w-5 h-5" />
                Evaluations
              </button>
            </div>

            <div className="p-6">
              <button
                onClick={exportToExcel}
                className="mb-4 flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export to Excel
              </button>

              {/* Appointments Tab */}
              {activeTab === 'appointments' && (
                <div className="space-y-4">
                  {appointments.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">No appointments yet</h3>
                      <p className="text-gray-500">Appointments will appear here when clients submit requests</p>
                    </div>
                  ) : (
                    appointments.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)).map((apt) => (
                      <div key={apt.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-bold text-gray-800">{apt.clientName}</h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                apt.status === 'approved' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {apt.status.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500">Submitted: {formatDateTime(apt.submittedAt)}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm font-medium text-gray-700">Evaluator</p>
                            <p className="text-gray-900">{apt.evaluatorName}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Parent/Guardian</p>
                            <p className="text-gray-900">{apt.parentGuardianName}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Service Provider</p>
                            <p className="text-gray-900">{apt.serviceProviderName}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Appointment</p>
                            <p className="text-gray-900 font-semibold">{formatDate(apt.appointmentDate)}</p>
                            <p className="text-gray-900 font-semibold">{formatTime(apt.appointmentTime)}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Contact</p>
                            <p className="text-gray-900">{apt.email}</p>
                            <p className="text-gray-900">{apt.phone}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Service Types</p>
                            <p className="text-gray-900">{apt.serviceType.join(', ')}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-sm font-medium text-gray-700">Address</p>
                            <p className="text-gray-900">{apt.address}</p>
                          </div>
                          {apt.notes && (
                            <div className="col-span-2">
                              <p className="text-sm font-medium text-gray-700">Notes</p>
                              <p className="text-gray-900 bg-white p-3 rounded border">{apt.notes}</p>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          {apt.status === 'pending' && (
                            <>
                              <button
                                onClick={() => updateAppointmentStatus(apt.id, 'approved')}
                                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Approve
                              </button>
                              <button
                                onClick={() => updateAppointmentStatus(apt.id, 'declined')}
                                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                              >
                                <XCircle className="w-4 h-4" />
                                Decline
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => deleteAppointment(apt.id)}
                            className="ml-auto flex items-center gap-2 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors text-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Evaluations Tab */}
              {activeTab === 'evaluations' && (
                <div className="space-y-4">
                  {evaluations.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">No evaluations yet</h3>
                      <p className="text-gray-500">Evaluation forms will appear here when submitted</p>
                    </div>
                  ) : (
                    evaluations.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)).map((ev) => (
                      <div key={ev.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-800 mb-1">{ev.clientName}</h3>
                            <div className="grid grid-cols-2 gap-x-4 text-sm text-gray-600 mb-3">
                              <p><span className="font-medium">Evaluator:</span> {ev.evaluatorName}</p>
                              <p><span className="font-medium">Parent/Guardian:</span> {ev.parentGuardianName}</p>
                              <p><span className="font-medium">Service Provider:</span> {ev.serviceProviderName}</p>
                              <p><span className="font-medium">Email:</span> {ev.email}</p>
                              <p className="col-span-2"><span className="font-medium">Services:</span> {ev.serviceType.join(', ')}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-semibold">
                                {ev.evaluationType === 'staff' ? 'Staff/Service Evaluation' : 'Parental Provider Evaluation'}
                              </span>
                              <span className="text-sm text-gray-500">
                                {formatDateTime(ev.submittedAt)}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => deleteEvaluation(ev.id)}
                            className="flex items-center gap-2 bg-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-400 transition-colors text-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="space-y-3">
                          {ev.responses.filter(r => r.answer !== 'Not answered').map((resp, idx) => (
                            <div key={idx} className="bg-white p-4 rounded-lg border">
                              <p className="text-sm font-medium text-gray-700 mb-2">{resp.question}</p>
                              <p className="text-gray-900 font-semibold">{resp.answer}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // CLIENT SUBMISSION SUCCESS SCREEN
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full text-center">
          <div className="mb-6">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Thank You!</h2>
            <p className="text-gray-600">Your appointment request and evaluation have been submitted successfully to FOR ALL HOME CARE AND AGENCY LLC.</p>
          </div>

          <div className="bg-indigo-50 rounded-lg p-6 mb-6 text-left">
            <h3 className="font-semibold text-indigo-900 mb-3">Submission Summary</h3>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium text-gray-700">Client Name:</span> <span className="text-gray-600">{clientInfo.clientName}</span></p>
              <p><span className="font-medium text-gray-700">Parent/Guardian:</span> <span className="text-gray-600">{clientInfo.parentGuardianName}</span></p>
              <p><span className="font-medium text-gray-700">Service Provider:</span> <span className="text-gray-600">{clientInfo.serviceProviderName}</span></p>
              <p><span className="font-medium text-gray-700">Email:</span> <span className="text-gray-600">{clientInfo.email}</span></p>
              <p><span className="font-medium text-gray-700">Appointment:</span> <span className="text-gray-600">{formatDate(clientInfo.appointmentDate)} at {formatTime(clientInfo.appointmentTime)}</span></p>
              <p><span className="font-medium text-gray-700">Service Types:</span> <span className="text-gray-600">{clientInfo.serviceType.join(', ')}</span></p>
              <p><span className="font-medium text-gray-700">Evaluation Type:</span> <span className="text-gray-600">{evaluationType === 'staff' ? 'Staff/Service Evaluation' : 'Parental Provider Evaluation'}</span></p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              Our team will review your request and contact you at <strong>{clientInfo.email}</strong> or <strong>{clientInfo.phone}</strong> within 24 hours to confirm your appointment.
            </p>
          </div>

          <button
            onClick={handleReset}
            className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Submit Another Form
          </button>
        </div>
      </div>
    );
  }

  // CLIENT FORM
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Power Apps Information Card */}
        {showPowerAppsInfo && (
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-6 mb-6 text-white">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Info className="w-6 h-6" />
                  <h2 className="text-xl font-bold">System Information</h2>
                </div>
                <p className="text-blue-100 mb-3">
                  This agency is exploring Microsoft Power Apps + Dataverse for enhanced security and compliance.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">✓ HIPAA Compliant</span>
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">✓ Secure Cloud Storage</span>
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">✓ Microsoft 365 Integration</span>
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">✓ Automatic Backups</span>
                </div>
              </div>
              <button
                onClick={() => setShowPowerAppsInfo(false)}
                className="ml-4 text-white/80 hover:text-white transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">FOR ALL HOME CARE AND AGENCY LLC</h1>
            <p className="text-xl text-gray-700 mb-1">Appointment Request & Evaluation Form</p>
            <p className="text-gray-600">Complete your appointment request and evaluation in one form</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Form Information Section */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Form Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Evaluation Filled by (Your Name) *</label>
                  <input
                    type="text"
                    value={clientInfo.evaluatorName}
                    onChange={(e) => setClientInfo({...clientInfo, evaluatorName: e.target.value})}
                    className={`w-full px-4 py-3 border ${errors.evaluatorName ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none`}
                    placeholder="Your name"
                  />
                  {errors.evaluatorName && <p className="mt-1 text-sm text-red-600">{errors.evaluatorName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Signature</label>
                  <input
                    type="text"
                    value={clientInfo.evaluatorSignature}
                    onChange={(e) => setClientInfo({...clientInfo, evaluatorSignature: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Type your name as signature"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Parent/Guardian Name *</label>
                  <input
                    type="text"
                    value={clientInfo.parentGuardianName}
                    onChange={(e) => setClientInfo({...clientInfo, parentGuardianName: e.target.value})}
                    className={`w-full px-4 py-3 border ${errors.parentGuardianName ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none`}
                    placeholder="Parent or guardian name"
                  />
                  {errors.parentGuardianName && <p className="mt-1 text-sm text-red-600">{errors.parentGuardianName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Client Name *</label>
                  <input
                    type="text"
                    value={clientInfo.clientName}
                    onChange={(e) => setClientInfo({...clientInfo, clientName: e.target.value})}
                    className={`w-full px-4 py-3 border ${errors.clientName ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none`}
                    placeholder="Client receiving services"
                  />
                  {errors.clientName && <p className="mt-1 text-sm text-red-600">{errors.clientName}</p>}
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Service Provider Name *</label>
                  <input
                    type="text"
                    value={clientInfo.serviceProviderName}
                    onChange={(e) => setClientInfo({...clientInfo, serviceProviderName: e.target.value})}
                    className={`w-full px-4 py-3 border ${errors.serviceProviderName ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none`}
                    placeholder="Name of staff providing services"
                  />
                  {errors.serviceProviderName && <p className="mt-1 text-sm text-red-600">{errors.serviceProviderName}</p>}
                </div>
              </div>
            </div>

            {/* Service Types */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Service Type(s) *</h2>
              <div className="grid grid-cols-2 gap-3">
                {serviceTypes.map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleServiceType(type)}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      clientInfo.serviceType.includes(type)
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-semibold'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    <span className="text-sm">{clientInfo.serviceType.includes(type) ? '☑' : '☐'}</span> {type}
                  </button>
                ))}
              </div>
              {errors.serviceType && <p className="mt-2 text-sm text-red-600">{errors.serviceType}</p>}
            </div>

            {/* Contact Information */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Contact Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    value={clientInfo.email}
                    onChange={(e) => setClientInfo({...clientInfo, email: e.target.value})}
                    className={`w-full px-4 py-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none`}
                    placeholder="your@email.com"
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                  <input
                    type="tel"
                    value={clientInfo.phone}
                    onChange={(e) => setClientInfo({...clientInfo, phone: e.target.value})}
                    className={`w-full px-4 py-3 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none`}
                    placeholder="(555) 123-4567"
                  />
                  {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                  <textarea
                    value={clientInfo.address}
                    onChange={(e) => setClientInfo({...clientInfo, address: e.target.value})}
                    rows="2"
                    className={`w-full px-4 py-3 border ${errors.address ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none`}
                    placeholder="123 Main St, City, State, ZIP"
                  />
                  {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
                </div>
              </div>
            </div>

            {/* Appointment Details */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Appointment Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date of Evaluation *</label>
                  <input
                    type="date"
                    value={clientInfo.appointmentDate}
                    onChange={(e) => setClientInfo({...clientInfo, appointmentDate: e.target.value})}
                    min={today}
                    max={maxDateStr}
                    className={`w-full px-4 py-3 border ${errors.appointmentDate ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none`}
                  />
                  {errors.appointmentDate && <p className="mt-1 text-sm text-red-600">{errors.appointmentDate}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Time *</label>
                  <input
                    type="time"
                    value={clientInfo.appointmentTime}
                    onChange={(e) => setClientInfo({...clientInfo, appointmentTime: e.target.value})}
                    className={`w-full px-4 py-3 border ${errors.appointmentTime ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none`}
                  />
                  {errors.appointmentTime && <p className="mt-1 text-sm text-red-600">{errors.appointmentTime}</p>}
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                  <textarea
                    value={clientInfo.notes}
                    onChange={(e) => setClientInfo({...clientInfo, notes: e.target.value})}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                    placeholder="Any special requirements or information..."
                  />
                </div>
              </div>
            </div>

            {/* Evaluation Section */}
            <div className="bg-indigo-50 p-6 rounded-xl border-2 border-indigo-200">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Evaluation Form</h2>
              
              {/* Evaluation Type Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Select Evaluation Type *</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setEvaluationType('staff')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      evaluationType === 'staff'
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : 'border-gray-300 bg-white hover:border-gray-400'
                    }`}
                  >
                    <h3 className="font-bold">Staff / Service Evaluation</h3>
                    <p className="text-sm mt-1">For families evaluating staff who provide services in the home</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEvaluationType('parental')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      evaluationType === 'parental'
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : 'border-gray-300 bg-white hover:border-gray-400'
                    }`}
                  >
                    <h3 className="font-bold">Parental Provider Evaluation</h3>
                    <p className="text-sm mt-1">For parents or guardians who provide services through the agency</p>
                  </button>
                </div>
              </div>

              {/* Evaluation Questions */}
              <div className="space-y-5">
                {currentQuestions.map((q) => {
                  const input = renderQuestionInput(q);
                  if (!input) return null;

                  return (
                    <div key={q.id} className="bg-white p-5 rounded-lg border border-gray-200">
                      <label className="block text-sm font-medium text-gray-800 mb-3">
                        {q.question} {!q.conditional && q.type !== 'textarea' && '*'}
                      </label>
                      {input}
                      {errors[q.id] && <p className="mt-2 text-sm text-red-600">{errors[q.id]}</p>}
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-4 px-6 rounded-lg font-bold text-lg hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl"
            >
              Submit Appointment & Evaluation Form
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}