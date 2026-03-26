// UI Interactions
function toggleSidebar() {
  document.querySelector('.sidebar').classList.toggle('active');
}

function scrollTo(id) {
  document.querySelector(id).scrollIntoView({ behavior: 'smooth' });
  toggleSidebar();
}

// Auto close sidebar on mobile
window.addEventListener('resize', () => {
  if (window.innerWidth > 768) document.querySelector('.sidebar').classList.remove('active');
});

