// frontend/src/lib/api.js

const apiFetch = async (url, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
    const error = new Error(errorData.message || `HTTP error! status: ${response.status}`);
    error.status = response.status;
    error.data = errorData;
    throw error;
  }
  
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  } else {
    return {};
  }
};

export const login = (username, password) => apiFetch('/api/login', {
  method: 'POST',
  body: JSON.stringify({ username, password }),
});

export const logout = () => apiFetch('/api/logout', { method: 'POST' });

export const checkAuthStatus = () => apiFetch('/api/status');

export const getProductByBarcode = (barcode) => apiFetch(`/api/products/${barcode}`);

// --- FUNCTIONS FOR PRODUCT MANAGEMENT ---
export const getAllProducts = () => apiFetch('/api/products');

export const addProduct = (productData) => apiFetch('/api/products', {
  method: 'POST',
  body: JSON.stringify(productData)
});

export const updateProduct = (productId, productData) => apiFetch(`/api/products/${productId}`, {
  method: 'PUT',
  body: JSON.stringify(productData)
});

export const deleteProduct = (productId) => apiFetch(`/api/products/${productId}`, {
  method: 'DELETE'
});
// --- END OF PRODUCT FUNCTIONS ---

export const createSale = (saleData) => apiFetch('/api/sales', {
  method: 'POST',
  body: JSON.stringify(saleData),
});

export const getSalesHistory = () => apiFetch('/api/sales');

export const getSaleDetails = (saleId) => apiFetch(`/api/sales/${saleId}`);

export const processRefund = (saleId) => apiFetch(`/api/sales/${saleId}/refund`, {
  method: 'POST'
});

// --- REPORTING FUNCTION ---
export const getSalesReport = (startDate, endDate) => {
    const params = new URLSearchParams({ start: startDate, end: endDate });
    return apiFetch(`/api/reports/sales?${params}`);
};