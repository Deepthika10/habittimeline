import supabase from './supabase.js';

// Check if user is logged in
async function checkAuth() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Handle login
async function handleLogin(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) {
    console.error('Login error:', error.message);
    return { success: false, error: error.message };
  }
  
  return { success: true, user: data.user };
}

// Handle signup
async function handleSignup(email, password, name) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name
      }
    }
  });
  
  if (error) {
    console.error('Signup error:', error.message);
    return { success: false, error: error.message };
  }
  
  return { success: true, user: data.user };
}

// Handle logout
async function handleLogout() {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error('Logout error:', error.message);
    return false;
  }
  
  return true;
}

// Update UI based on auth state
function updateAuthUI(user) {
  if (user) {
    document.getElementById('user-name').textContent = user.user_metadata?.name || user.email;
    document.getElementById('greeting-name').textContent = user.user_metadata?.name || 'Friend';
    
    // Show authenticated UI
    document.querySelectorAll('.auth-only').forEach(el => el.style.display = 'block');
    document.querySelectorAll('.no-auth').forEach(el => el.style.display = 'none');
  } else {
    // Show unauthenticated UI
    document.querySelectorAll('.auth-only').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.no-auth').forEach(el => el.style.display = 'block');
  }
}

// Initialize auth listener
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    updateAuthUI(session.user);
    loadTodayHabits();
  } else if (event === 'SIGNED_OUT') {
    updateAuthUI(null);
  }
});

// Initialize auth on page load
document.addEventListener('DOMContentLoaded', async () => {
  const user = await checkAuth();
  updateAuthUI(user);
  
  if (user) {
    loadTodayHabits();
  }
});

export { handleLogin, handleSignup, handleLogout, checkAuth };
