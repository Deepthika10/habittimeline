// Auth functions
document.addEventListener('DOMContentLoaded', async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    window.location.href = 'login.html';
  } else {
    // User is logged in, load their data
    loadTodayHabits();
    loadStats();
  }
});

// Logout
document.getElementById('logoutBtn')?.addEventListener('click', async () => {
  const { error } = await supabase.auth.signOut();
  if (!error) {
    window.location.href = 'login.html';
  }
});

// You'll need to create a simple login.html page with email/password fields
// and use supabase.auth.signInWithPassword() or supabase.auth.signInWithOAuth()
