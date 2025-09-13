// import axios from 'axios';

// // Create an Axios instance with a base URL
// const apiClient = axios.create({
//   baseURL: 'http://localhost:3001/api', // Your backend URL
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // Define API functions
// export const getProducts = () => {
//   return apiClient.get('/products');
// };

// export const createInvoice = (invoiceData) => {
//   return apiClient.post('/invoices', invoiceData);
// };

import axios from 'axios';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// const apiClient = axios.create({
//   baseURL: 'http://localhost:3001/api',
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// --- Auth APIs ---
export const register = (userData) => apiClient.post('/users/register', userData);
export const login = (userData) => apiClient.post('/users/login', userData);

// --- Product APIs ---
export const getProducts = () => apiClient.get('/products');

export const addProduct = (productData, token) => {
  return apiClient.post('/products', productData, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const updateProduct = (id, productData, token) => {
  return apiClient.put(`/products/${id}`, productData, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const deleteProduct = (id, token) => {
  return apiClient.delete(`/products/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};



export const getCategories = () => apiClient.get('/categories');

export const getInvoices = (token) => {
  return apiClient.get('/invoices', {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const createInvoice = (invoiceData) => {
    // This could also be protected if needed
    return apiClient.post('/invoices', invoiceData);
};

export const getInvoiceById = (id, token) => {
  return apiClient.get(`/invoices/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const downloadInvoicePDF = (id, token) => {
  return apiClient.get(`/invoices/${id}/pdf`, {
    headers: { Authorization: `Bearer ${token}` },
    // Important: Tell Axios to expect binary data (a blob)
    responseType: 'blob', 
  });
};

export const resendInvoiceEmail = (id, token) => {
  return apiClient.post(`/invoices/${id}/resend`, {}, { // POST request may need an empty body
    headers: { Authorization: `Bearer ${token}` }
  });
};

// In /frontend/src/services/api.js
// ... other functions
export const sendWhatsAppMessage = (id, driveLink, token) => {
  return apiClient.post(`/invoices/${id}/send-whatsapp`, { driveLink }, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

// In /frontend/src/services/api.js
export const uploadInvoiceToDrive = (id, token) => {
  return apiClient.post(`/invoices/${id}/upload`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
};


// === Dashboard APIs ===
export const getDashboardKpis = (token) => apiClient.get('/dashboard/kpis', { headers: { Authorization: `Bearer ${token}` } });
export const getTopProducts = (by, token) => apiClient.get(`/dashboard/top-products?by=${by}`, { headers: { Authorization: `Bearer ${token}` } });
export const getCategorySales = (token) => apiClient.get('/dashboard/category-sales', { headers: { Authorization: `Bearer ${token}` } });
export const getRecentInvoices = (token) => apiClient.get('/dashboard/recent-invoices', { headers: { Authorization: `Bearer ${token}` } });
export const getRevenueTrend = (period, token) => apiClient.get(`/dashboard/revenue-trend?period=${period}`, { headers: { Authorization: `Bearer ${token}` } });
