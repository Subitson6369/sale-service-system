// ========================================
// SALE SERVICE SYSTEM - JAVASCRIPT
// ========================================

// API Base URL
const API_BASE = 'http://localhost:5000/api';

// ========================================
// AUTHENTICATION
// ========================================

/**
 * Handle user login
 */
async function login() {
  const email = document.getElementById('loginEmail')?.value;
  const password = document.getElementById('loginPassword')?.value;

  if (!email || !password) {
    showAlert('Please enter email and password', 'error');
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('userEmail', email);
      
      if (data.role === 'admin') {
        window.location.href = 'admin.html';
      } else {
        window.location.href = 'customer.html';
      }
    } else {
      showAlert(data.message || 'Login failed', 'error');
    }
  } catch (error) {
    showAlert('Login failed. Please try again.', 'error');
    console.error('Login error:', error);
  }
}

/**
 * Handle user registration
 */
async function register() {
  const name = document.getElementById('registerName')?.value;
  const email = document.getElementById('registerEmail')?.value;
  const password = document.getElementById('registerPassword')?.value;
  

  if (!name || !email || !password) {
    showAlert('Please fill all fields', 'error');
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    const data = await response.json();

    if (response.ok) {
      showAlert('Registration successful! Please login.', 'success');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 2000);
    } else {
      showAlert(data.message || 'Registration failed', 'error');
    }
  } catch (error) {
    showAlert('Registration failed. Please try again.', 'error');
    console.error('Register error:', error);
  }
}

/**
 * Logout user
 */
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('userEmail');
  window.location.href = 'index.html';
}

/**
 * Check if user is authenticated
 */
function isAuthenticated() {
  return localStorage.getItem('token') !== null;
}

/**
 * Check if user is admin
 */
function isAdmin() {
  return localStorage.getItem('role') === 'admin';
}

// ========================================
// PRODUCTS
// ========================================

/**
 * Load all products from API
 */
async function loadProducts() {
  const grid = document.getElementById('productsGrid');
  
  if (!grid) return;

  try {
    const response = await fetch(`${API_BASE}/products`);
    const products = await response.json();

    if (products.length === 0) {
      grid.innerHTML = '<div class="card text-center"><p>No products available yet.</p></div>';
      return;
    }

    grid.innerHTML = products.map(product => `
      <div class="product-card slide-up">
        ${product.image ? `<img src="${API_BASE.replace('/api', '/uploads/products')}/${product.image}" alt="${product.name}" class="product-image" onerror="this.style.display='none'">` : ''}
        <h3>${product.name}</h3>
        <div class="category"><i class="fas fa-tag"></i> ${product.category}</div>
        <div class="price">₹${product.price.toLocaleString()}</div>
        <div class="stock">
          <i class="fas fa-box"></i> Stock: ${product.stock}
        </div>
        <p class="mt-1">${product.description || 'Quality product with warranty'}</p>
        <div class="actions">
          <button class="btn btn-primary" onclick="openPurchaseModal('${product._id}')">
            <i class="fas fa-shopping-cart"></i> Buy Now
          </button>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading products:', error);
    grid.innerHTML = '<div class="alert alert-error">Error loading products. Make sure backend is running.</div>';
  }
}

/**
 * Add new product (Admin)
 */
async function addProduct(event) {
  event.preventDefault();
  
  const token = localStorage.getItem('token');
  if (!token) {
    showAlert('Please login as admin', 'error');
    return;
  }

  const name = document.getElementById('productName')?.value;
  const category = document.getElementById('productCategory')?.value;
  const price = parseInt(document.getElementById('productPrice')?.value);
  const stock = parseInt(document.getElementById('productStock')?.value);
  const description = document.getElementById('productDescription')?.value;

  if (!name || !category || !price || !stock) {
    showAlert('Please fill all required fields', 'error');
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/products/add`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name, category, price, stock, description })
    });

    const data = await response.json();

    if (response.ok) {
      showAlert('Product added successfully!', 'success');
      event.target.reset();
      loadProducts();
    } else {
      showAlert(data.message || 'Failed to add product', 'error');
    }
  } catch (error) {
    showAlert('Failed to add product', 'error');
    console.error('Add product error:', error);
  }
}

// ========================================
// ORDERS
// ========================================

/**
 * Place order from form (consistent API call)
 */
async function placeOrder() {
  const customerName = document.getElementById("customerName")?.value;
  const paymentMethod = document.getElementById("paymentMethod")?.value;
  
  if (!customerName || !paymentMethod) {
    showAlert('Please fill all fields', 'error');
    return;
  }

  // Get product info from data attribute or form
  const productId = document.getElementById("productId")?.value || '';
  
  try {
    const response = await fetch(`${API_BASE}/orders/add`, {
      method: "POST",
      headers: {
        "Content-Type":"application/json"
      },
      body: JSON.stringify({
        customerName,
        productId,
        quantity: 1,
        paymentMethod
      })
    });

    const data = await response.json();

    if (response.ok) {
      showAlert("Order placed successfully! Invoice generated.", 'success');
      // Clear form
      document.querySelector("#orderForm")?.reset();
      loadProducts(); // Update stock display
    } else {
      showAlert("Failed to place order: " + (data.message || data.error), 'error');
    }
  } catch (error) {
    showAlert("Network error - ensure backend is running", 'error');
    console.error('Order error:', error);
  }
}

/**
 * Place an order (modal version)
 */
async function placeOrderModal() {
  const productId = document.getElementById('purchaseProductId')?.value;
  const quantity = parseInt(document.getElementById('purchaseQuantity')?.value);
  const customerName = document.getElementById('customerName')?.value;

  if (!productId || !quantity || !customerName) {
    showAlert('Please fill all fields', 'error');
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/orders/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity, customerName })
    });

    const data = await response.json();

    if (response.ok) {
      showAlert('Order placed successfully! Invoice generated.', 'success');
      setTimeout(() => {
        window.location.href = 'invoices.html';
      }, 2000);
    } else {
      showAlert(data.message || 'Failed to place order', 'error');
    }
  } catch (error) {
    showAlert('Failed to place order', 'error');
    console.error('Order error:', error);
  }
}

// Removed hardcoded buyProduct - use openPurchaseModal() consistently


/**
 * Load all orders
 */
async function loadOrders() {
  const tbody = document.getElementById('ordersTableBody');
  if (!tbody) return;
  
  try {
    const response = await fetch(`${API_BASE}/orders`);
    const orders = await response.json();

    if (orders.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center">No orders found</td></tr>';
      return;
    }

    tbody.innerHTML = orders.map(order => `
      <tr>
        <td>${order._id.substring(0, 8)}...</td>
        <td>${order.customerName}</td>
        <td>${order.product?.name || 'N/A'}</td>
        <td>${order.quantity}</td>
        <td>₹${order.totalAmount.toLocaleString()}</td>
        <td><span class="status-${order.status.toLowerCase()}">${order.status}</span></td>
        <td>${new Date(order.createdAt).toLocaleDateString()}</td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Error loading orders:', error);
    tbody.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Error loading orders</td></tr>';
  }
}

// ========================================
// SERVICES
// ========================================

/**
 * Submit service request
 */
async function submitService() {
  const name = document.getElementById('serviceName')?.value;
  const email = document.getElementById('serviceEmail')?.value;
  const phone = document.getElementById('servicePhone')?.value;
  const serviceType = document.getElementById('serviceType')?.value;
  const description = document.getElementById('serviceDescription')?.value;

  if (!name || !email || !phone || !serviceType || !description) {
    showAlert('Please fill all fields', 'error');
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/services/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, serviceType, description })
    });

    const data = await response.json();

    if (response.ok) {
      showAlert('Service request submitted successfully!', 'success');
      document.querySelector('form')?.reset();
    } else {
      showAlert(data.message || 'Failed to submit request', 'error');
    }
  } catch (error) {
    showAlert('Failed to submit request', 'error');
    console.error('Service error:', error);
  }
}

/**
 * Check service status
 */
async function checkServiceStatus() {
  const tbody = document.getElementById('serviceTableBody');
  const userEmail = localStorage.getItem('userEmail');
  
  if (!tbody) return;

  try {
    const response = await fetch(`${API_BASE}/services`);
    const services = await response.json();
    
    const myServices = services.filter(s => s.email === userEmail);
    
    if (myServices.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center">No service requests found</td></tr>';
      return;
    }

    tbody.innerHTML = myServices.map(service => `
      <tr>
        <td>${service._id.substring(0, 8)}...</td>
        <td>${service.serviceType}</td>
        <td>${service.description.substring(0, 50)}...</td>
        <td><span class="status-${service.status.toLowerCase().replace(' ', '-')}">${service.status}</span></td>
        <td>${new Date(service.createdAt).toLocaleDateString()}</td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Error loading services:', error);
    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Error loading services</td></tr>';
  }
}

/**
 * Load all services
 */
async function loadServices() {
  const tbody = document.getElementById('servicesTableBody');
  if (!tbody) return;
  
  try {
    const response = await fetch(`${API_BASE}/services`);
    const services = await response.json();

    if (services.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center">No service requests</td></tr>';
      return;
    }

    tbody.innerHTML = services.map(service => `
      <tr>
        <td>${service._id.substring(0, 8)}...</td>
        <td>${service.name}</td>
        <td>${service.serviceType}</td>
        <td>${service.description.substring(0, 30)}...</td>
        <td><span class="status-${service.status.toLowerCase().replace(' ', '-')}">${service.status}</span></td>
        <td>
          <select onchange="updateServiceStatus('${service._id}', this.value)" style="padding: 5px; border-radius: 4px;">
            <option value="Pending" ${service.status === 'Pending' ? 'selected' : ''}>Pending</option>
            <option value="In Progress" ${service.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
            <option value="Completed" ${service.status === 'Completed' ? 'selected' : ''}>Completed</option>
          </select>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Error loading services:', error);
    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Error loading services</td></tr>';
  }
}

/**
 * Update service status
 */
async function updateServiceStatus(id, status) {
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch(`${API_BASE}/services/update/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });

    if (response.ok) {
      showAlert('Service status updated', 'success');
      loadServices();
    }
  } catch (error) {
    console.error('Error updating service:', error);
  }
}

// ========================================
// INVOICES / BILLING
// ========================================

/**
 * Load invoices
 */
async function loadInvoices() {
  const container = document.getElementById('invoicesList');
  const token = localStorage.getItem('token');
  const userEmail = localStorage.getItem('userEmail');

  if (!container) return;

  if (!token) {
    container.innerHTML = '<div class="card"><p>Please login to view your invoices.</p><a href="login.html" class="btn btn-primary">Login</a></div>';
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/billing`, {
      headers: { 'Authorization': token }
    });
    const bills = await response.json();

    if (!bills || bills.length === 0) {
      container.innerHTML = '<div class="card text-center"><p>No invoices found.</p></div>';
      return;
    }

    container.innerHTML = bills.map(bill => `
      <div class="card slide-up">
        <div class="d-flex justify-between align-center">
          <div>
            <h3><i class="fas fa-file-invoice"></i> Invoice #${bill._id.substring(0, 8)}</h3>
            <p class="mt-1">
              <strong>Customer:</strong> ${bill.customerName}<br>
              <strong>Type:</strong> ${bill.type}<br>
              <strong>Date:</strong> ${new Date(bill.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div class="text-right">
            <div class="price" style="font-size: 1.5rem;">₹${bill.totalAmount.toLocaleString()}</div>
            <p class="text-success"><i class="fas fa-check-circle"></i> Paid</p>
          </div>
        </div>
        <div class="mt-2">
          <button class="btn btn-primary" onclick="viewInvoice('${bill._id}')">
            <i class="fas fa-eye"></i> View
          </button>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading invoices:', error);
    container.innerHTML = '<div class="alert alert-error">Error loading invoices.</div>';
  }
}

// ========================================
// DASHBOARD & STATS
// ========================================

/**
 * Load dashboard statistics
 */
async function loadStats() {
  const token = localStorage.getItem('token');
  
  try {
    // Load billing stats
    const billingResponse = await fetch(`${API_BASE}/billing/stats`, {
      headers: { 'Authorization': token }
    });
    const billingData = await billingResponse.json();
    
    if (document.getElementById('totalRevenue')) {
      document.getElementById('totalRevenue').textContent = '₹' + (billingData.totalRevenue || 0).toLocaleString();
    }
    if (document.getElementById('totalInvoices')) {
      document.getElementById('totalInvoices').textContent = billingData.totalInvoices || 0;
    }

    // Load products count
    const productsResponse = await fetch(`${API_BASE}/products`);
    const products = await productsResponse.json();
    if (document.getElementById('totalProducts')) {
      document.getElementById('totalProducts').textContent = products.length;
    }

    // Load services count
    const servicesResponse = await fetch(`${API_BASE}/services`);
    const services = await servicesResponse.json();
    if (document.getElementById('totalServices')) {
      document.getElementById('totalServices').textContent = services.length;
    }
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

/**
 * Load revenue chart
 */
async function loadRevenueChart() {
  const token = localStorage.getItem('token');
  const canvas = document.getElementById('revenueChart');
  
  if (!canvas) return;

  try {
    const response = await fetch(`${API_BASE}/billing`, {
      headers: { 'Authorization': token }
    });
    const bills = await response.json();

    // Group bills by month
    const monthlyRevenue = {};
    bills.forEach(bill => {
      const date = new Date(bill.createdAt);
      const month = date.toLocaleString('default', { month: 'short' });
      monthlyRevenue[month] = (monthlyRevenue[month] || 0) + bill.totalAmount;
    });

    const ctx = canvas.getContext('2d');
    
    // Check if Chart is available
    if (typeof Chart !== 'undefined') {
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: Object.keys(monthlyRevenue),
          datasets: [{
            label: 'Revenue (₹)',
            data: Object.values(monthlyRevenue),
            backgroundColor: 'rgba(37, 99, 235, 0.8)',
            borderColor: 'rgba(37, 99, 235, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
  } catch (error) {
    console.error('Error loading chart:', error);
  }
}

// ========================================
// UI HELPERS
// ========================================

/**
 * Toggle dark mode
 */
function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  
  // Save preference
  const isDark = document.body.classList.contains('dark-mode');
  localStorage.setItem('darkMode', isDark);
  
  // Update icon
  const icon = document.querySelector('.theme-toggle i');
  if (icon) {
    icon.classList.toggle('fa-moon', !isDark);
    icon.classList.toggle('fa-sun', isDark);
  }
}

/**
 * Show alert message
 */
function showAlert(message, type = 'info') {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type}`;
  alertDiv.textContent = message;
  
  const container = document.querySelector('.container') || document.body;
  container.insertBefore(alertDiv, container.firstChild);
  
  setTimeout(() => {
    alertDiv.remove();
  }, 5000);
}

/**
 * Print invoice
 */
function printInvoice(button) {
  const invoice = button.parentElement;
  const printWindow = window.open('', '', 'height=600,width=800');
  printWindow.document.write('<html><head><title>Invoice</title>');
  printWindow.document.write('<style>body{font-family:Arial;padding:20px;}</style>');
  printWindow.document.write('</head><body>');
  printWindow.document.write(invoice.innerHTML);
  printWindow.document.write('</body></html>');
  printWindow.document.close();
  printWindow.print();
}

/**
 * Download invoice as PDF (requires jsPDF or html2pdf CDN)
 */
async function downloadPDF(invoiceId) {
  if (typeof html2pdf !== 'undefined') {
    const element = document.getElementById(`invoice-${invoiceId}`) || document.querySelector('.invoice-box');
    if (element) {
      const opt = {
        margin: 10,
        filename: `invoice_${invoiceId.substring(0,8)}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      html2pdf().set(opt).from(element).save();
    }
  } else if (typeof jsPDF !== 'undefined') {
    // Fallback jsPDF logic
    showAlert('PDF library not loaded', 'warning');
  } else {
    showAlert('PDF download requires html2pdf CDN', 'warning');
  }
}

// ========================================
// MODAL HELPERS
// ========================================

/**
 * Open purchase modal
 */
function openPurchaseModal(productId) {
  const modal = document.getElementById('purchaseModal');
  if (modal) {
    modal.style.display = 'flex';
  }
}

/**
 * Close modal
 */
function closeModal() {
  const modal = document.getElementById('purchaseModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

// ========================================
/* Navbar Auth Display - Fixed confusing "Logout" */
function updateNavbarAuth() {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const authLink = document.getElementById('authLink');
  
  if (!authLink) return;
  
  if (token) {
    if (role === 'admin') {
      authLink.innerHTML = '<i class="fas fa-user-shield"></i> Admin Dashboard';
      authLink.href = 'admin.html';
    } else {
      authLink.innerHTML = '<i class="fas fa-shopping-bag"></i> My Orders';
      authLink.href = 'customer.html';
    }
    authLink.onclick = null; // href nav, logout separate
  } else {
    authLink.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
    authLink.href = 'login.html';
    authLink.onclick = null;
  }
}

// ========================================
// INITIALIZATION
// ========================================

// Apply dark mode preference on load
document.addEventListener('DOMContentLoaded', () => {
  const darkMode = localStorage.getItem('darkMode') === 'true';
  if (darkMode) {
    document.body.classList.add('dark-mode');
    const icon = document.querySelector('.theme-toggle i');
    if (icon) {
      icon.classList.remove('fa-moon');
      icon.classList.add('fa-sun');
    }
  }
  updateNavbarAuth(); // Call on load for all pages
});

// Close modals when clicking outside
window.onclick = function(event) {
  const modals = document.querySelectorAll('.modal');
  modals.forEach(modal => {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });
};

