// Application Logic and Role Management
document.addEventListener('DOMContentLoaded', () => {
  const currentPath = window.location.pathname.split('/').pop();
  
  // Public pages
  const publicPages = ['login.html', 'signup.html', 'index.html', ''];
  
  if (!publicPages.includes(currentPath)) {
    const role = localStorage.getItem('userRole');
    if (!role) {
      window.location.href = 'login.html';
      return;
    }
    
    // Enforce Dashboard Access
    if ((currentPath.startsWith('admin') || currentPath === 'engineers.html' || currentPath === 'assign-service.html') && role !== 'admin') {
      window.location.href = role === 'engineer' ? 'engineer-dashboard.html' : 'customer-dashboard.html';
      return;
    }
    
    // Specifically target engineer dashboards to prevent catching 'engineers.html'
    if ((currentPath.startsWith('engineer-') || currentPath === 'my-services.html') && role !== 'engineer') {
      window.location.href = role === 'admin' ? 'admin-dashboard.html' : 'customer-dashboard.html';
      return;
    }

    // Apply role classes
    document.body.classList.add('role-' + role);
  }

  // Setup generic modal closing
  document.querySelectorAll('.modal-close, .close-modal-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modal = e.target.closest('.modal');
      if (modal) {
        modal.classList.remove('active');
      }
    });
  });
});

// Modal specific logic
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
  }
}

// Authentication handlers
async function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  try {
    // Call the real backend login API
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await res.json();
    
    if (res.ok) {
      const selectedRole = data.role || data.user?.role || 'customer';
      localStorage.setItem('userToken', data.token);
      localStorage.setItem('userRole', selectedRole); 
      localStorage.setItem('userId', data.userId); 
      if(selectedRole === 'admin') window.location.href = 'admin-dashboard.html';
      else if(selectedRole === 'engineer') window.location.href = 'engineer-dashboard.html';
      else window.location.href = 'customer-dashboard.html';
    } else {
      alert(data.message || 'Login failed - Please check your credentials');
    }
  } catch (err) {
    console.error('Login error:', err);
    alert('Failed to connect to the authentication server.');
  }
}

async function handleSignup(event) {
  event.preventDefault();
  const name = document.getElementById('fullname').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const role = document.getElementById('role').value;
  
  try {
    // Call the real backend register API
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role })
    });

    
    const data = await res.json();
    
    if (res.ok) {
      alert('Account created successfully! Please log in.');
      window.location.href = 'login.html';
    } else {
      alert(data.message || data.error || 'Registration failed');
    }
  } catch (err) {
    console.error('Signup error:', err);
    alert('Failed to connect to the registration server.');
  }
}

function logout() {
  localStorage.removeItem('userRole');
  localStorage.removeItem('userToken');
  localStorage.removeItem('userId');
  window.location.href = 'login.html';
}
