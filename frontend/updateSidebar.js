const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname);

const files = ['admin-dashboard.html', 'products.html', 'spares.html', 'sales.html', 'services.html', 'billing.html', 'payments.html', 'customers.html'];

const getSidebar = (active) => `      <nav class="sidebar-nav">
        <a href="admin-dashboard.html" class="nav-item ${active === 'admin-dashboard.html' ? 'active' : ''}">
          <i class="fa-solid fa-chart-pie"></i> Dashboard
        </a>
        <a href="products.html" class="nav-item ${active === 'products.html' ? 'active' : ''}">
          <i class="fa-solid fa-box"></i> Products
        </a>
        <a href="services.html" class="nav-item ${active === 'services.html' ? 'active' : ''}">
          <i class="fa-solid fa-screwdriver-wrench"></i> Services
        </a>
        <a href="engineers.html" class="nav-item ${active === 'engineers.html' ? 'active' : ''}">
          <i class="fa-solid fa-user-gear"></i> Service Engineers
        </a>
        <a href="assign-service.html" class="nav-item ${active === 'assign-service.html' ? 'active' : ''}">
          <i class="fa-solid fa-clipboard-list"></i> Assign Service
        </a>
        <a href="billing.html" class="nav-item ${active === 'billing.html' ? 'active' : ''}">
          <i class="fa-solid fa-file-invoice-dollar"></i> Billing
        </a>
        <a href="payments.html" class="nav-item ${active === 'payments.html' ? 'active' : ''}">
          <i class="fa-solid fa-credit-card"></i> Payments
        </a>
      </nav>`;

files.forEach(file => {
  const filepath = path.join(dir, file);
  if (fs.existsSync(filepath)) {
    let content = fs.readFileSync(filepath, 'utf8');
    content = content.replace(/<nav class="sidebar-nav">[\s\S]*?<\/nav>/, getSidebar(file));
    fs.writeFileSync(filepath, content);
  }
});
console.log('Admin sidebars updated!');
