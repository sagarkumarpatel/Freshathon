document.addEventListener('DOMContentLoaded', function() {
    // Auth elements
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const goToLoginBtn = document.getElementById('go-to-login');
    const backToHomeBtn = document.getElementById('back-to-home');
    
    // Check authentication state
    function checkAuth() {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        document.body.classList.toggle('logged-in', isLoggedIn);
        
        if (loginBtn && logoutBtn) {
            if (isLoggedIn) {
                loginBtn.style.display = 'none';
                logoutBtn.style.display = 'block';
            } else {
                loginBtn.style.display = 'block';
                logoutBtn.style.display = 'none';
            }
        }
        
        // Enable/disable buttons
        const buttons = document.querySelectorAll('button:not(.auth-btn)');
        buttons.forEach(btn => {
            if (btn.id !== 'go-to-login') {
                btn.disabled = !isLoggedIn;
            }
        });
    }
    
    // Login navigation
    if (loginBtn) loginBtn.addEventListener('click', () => window.location.href = 'login.html');
    if (goToLoginBtn) goToLoginBtn.addEventListener('click', () => window.location.href = 'login.html');
    
    // Logout handler
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.setItem('isLoggedIn', 'false');
            checkAuth();
            window.location.reload();
        });
    }
    
    // Back to home
    if (backToHomeBtn) {
        backToHomeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'index.html';
        });
    }
    
    // Initial check
    checkAuth();
});