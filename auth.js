// Login form submission
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) {
    showNotification('Login failed: ' + error.message, 'error');
  } else {
    window.location.href = 'index.html';
  }
});

// Google login
document.getElementById('googleLogin')?.addEventListener('click', async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + '/index.html'
    }
  });
  
  if (error) {
    showNotification('Google login failed: ' + error.message, 'error');
  }
});
