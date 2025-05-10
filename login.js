document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.querySelector('.login-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            // Basic validation
            if (username.trim() === '' || password.trim() === '') {
                alert('Please enter both username and password');
                return;
            }
            // For demo purposes, we'll just set logged in state
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('username', username);
            
            // Redirect to main page
            window.location.href = 'index.html';
        });
    }
    initBackground();
});
function initBackground() {
}