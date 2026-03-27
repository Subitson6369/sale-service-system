// ========================================
// SIDEBAR RESPONSIVE TOGGLE
// ========================================

function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  if (sidebar) sidebar.classList.toggle('active');
  if (overlay) overlay.classList.toggle('active');
}

function closeSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  if (sidebar) sidebar.classList.remove('active');
  if (overlay) overlay.classList.remove('active');
}

// Close sidebar when Escape key is pressed
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeSidebar();
});

// ========================================
// NAVBAR MOBILE MENU TOGGLE
// ========================================

function toggleNavMenu() {
  const menu = document.querySelector('.navbar-menu, .navbar-links');
  if (menu) menu.classList.toggle('open');
}

// Close menu when a nav link is clicked on mobile
document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll('.navbar-menu a, .navbar-links a');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      const menu = document.querySelector('.navbar-menu, .navbar-links');
      if (menu) menu.classList.remove('open');
    });
  });
});
