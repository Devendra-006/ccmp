// Centralized API client connecting frontend to Express backend /api/v1
const API_BASE = '/api/v1';

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('csms_auth_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

// Authentication
export const apiLogin = (email, password, role) => 
  apiRequest('/auth/login', { method: 'POST', body: JSON.stringify({ email, password, role }) });

export const apiRegister = (userData) => 
  apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(userData) });

export const apiGetMe = () => 
  apiRequest('/auth/me');

// Academics
export const apiGetDepartments = () => 
  apiRequest('/departments');

export const apiCreateDepartment = (data) => 
  apiRequest('/departments', { method: 'POST', body: JSON.stringify(data) });

export const apiGetProgrammes = () => 
  apiRequest('/programmes');

export const apiCreateProgramme = (data) => 
  apiRequest('/programmes', { method: 'POST', body: JSON.stringify(data) });

export const apiGetSubjects = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiRequest(`/subjects${query ? `?${query}` : ''}`);
};

export const apiCreateSubject = (data) => 
  apiRequest('/subjects', { method: 'POST', body: JSON.stringify(data) });

// Students
export const apiGetStudents = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiRequest(`/students${query ? `?${query}` : ''}`);
};

export const apiEnrollStudent = (data) => 
  apiRequest('/students', { method: 'POST', body: JSON.stringify(data) });

// Attendance
export const apiGetAttendance = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiRequest(`/attendance${query ? `?${query}` : ''}`);
};

export const apiMarkAttendance = (data) => 
  apiRequest('/attendance/mark', { method: 'POST', body: JSON.stringify(data) });

export const apiGetAttendanceSummary = (studentId) => 
  apiRequest(`/attendance/summary/${studentId}`);

// Exams & Marks
export const apiGetExams = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiRequest(`/exams${query ? `?${query}` : ''}`);
};

export const apiCreateExam = (data) => 
  apiRequest('/exams', { method: 'POST', body: JSON.stringify(data) });

export const apiPublishExam = (examId) => 
  apiRequest(`/exams/${examId}/publish`, { method: 'POST' });

export const apiEnterMarks = (examId, marksList) => 
  apiRequest(`/exams/${examId}/marks`, { method: 'POST', body: JSON.stringify({ marksList }) });

export const apiGetResults = (studentId) => 
  apiRequest(`/results/${studentId}`);

// Fees
export const apiGetFeeStructures = () => 
  apiRequest('/fees/structures');

export const apiCreateFeeStructure = (data) => 
  apiRequest('/fees/structures', { method: 'POST', body: JSON.stringify(data) });

export const apiGetFeeDues = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiRequest(`/fees/dues${query ? `?${query}` : ''}`);
};

export const apiCreateFeeDue = (data) => 
  apiRequest('/fees/dues', { method: 'POST', body: JSON.stringify(data) });

export const apiPaySandbox = (dueId) => 
  apiRequest('/fees/pay-sandbox', { method: 'POST', body: JSON.stringify({ dueId }) });

export const apiCreateRazorpayOrder = (dueId) => 
  apiRequest('/fees/create-razorpay-order', { method: 'POST', body: JSON.stringify({ dueId }) });

export const apiVerifyRazorpayPayment = (data) => 
  apiRequest('/fees/verify-razorpay-payment', { method: 'POST', body: JSON.stringify(data) });

export const apiGetFeeReceipt = (receiptNo) => 
  apiRequest(`/fees/receipt/${receiptNo}`);

// Notices
export const apiGetNotices = () => 
  apiRequest('/notices');

export const apiCreateNotice = (data) => 
  apiRequest('/notices', { method: 'POST', body: JSON.stringify(data) });
