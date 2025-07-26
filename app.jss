document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENT REFERENCES ---
    const appContainer = document.getElementById('app-container');
    const authSection = document.getElementById('auth-section');
    const authForm = document.getElementById('auth-form');
    const emailInput = document.getElementById('email-input');
    const logoutButton = document.getElementById('logout-button');
    const habitForm = document.getElementById('add-habit-form');
    const habitList = document.getElementById('habit-list');
    
    // --- SUPABASE INITIALIZATION ---
    // FIX 1: The URL and Key must be strings (inside quotes).
    const supabaseUrl = 'https://duglbeirfwecjmpioztz.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1Z2xiZWlyZndlY2ptcGlvenR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMDIyNjYsImV4cCI6MjA2ODU3ODI2Nn0.EtKtxQWVm3p89h8QZxXSTVrw-3pY1WcYOKthpugDGUM';
    
    // FIX 2: Correctly create the client from the global 'supabase' object provided by the CDN script.
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

    // --- AUTHENTICATION ---
    // This part handles login, logout, and showing/hiding the correct sections.
    supabase.auth.onAuthStateChange((event, session) => {
        if (session && session.user) {
            // User is logged in
            authSection.style.display = 'none';
            appContainer.style.display = 'block';
            renderHabits(); // Fetch habits for the logged-in user
        } else {
            // User is logged out
            authSection.style.display = 'block';
            appContainer.style.display = 'none';
        }
    });

    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = emailInput.value;
        const { error } = await supabase.auth.signInWithOtp({ email });
        if (error) {
            alert('Error sending magic link: ' + error.message);
        } else {
            alert('Check your email for the magic link!');
            authForm.reset();
        }
    });

    logoutButton.addEventListener('click', () => {
        supabase.auth.signOut();
    });

    // --- DATABASE FUNCTIONS ---

    // Fetch habits for the LOGGED IN user
    const getHabits = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return []; // If no user, return empty array

        const { data, error } = await supabase
            .from('habits')
            .select('*')
            .eq('user_id', user.id) // IMPORTANT: Only get habits for this user
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Error fetching habits:', error);
            return [];
        }
        return data;
    };

    // Render habits to the page
    const renderHabits = async () => {
        const habits = await getHabits();
        habitList.innerHTML = ''; // Clear the list

        if (habits.length === 0) {
            habitList.innerHTML = '<p style="opacity: 0.7;">No habits yet. Add one to get started!</p>';
            return;
        }
        
        habits.forEach(habit => {
            const habitItem = createHabitElement(habit);
            habitList.appendChild(habitItem);
        });
    };

    // Helper function to create a single habit's HTML element
    const createHabitElement = (habit) => {
        const habitItem = document.createElement('div');
        habitItem.classList.add('habit-item');
        if (habit.completed) {
            habitItem.classList.add('completed');
        }
        // Use the color from the database, or a default
        habitItem.style.borderLeftColor = habit.color || '#667eea'; 
        habitItem.dataset.id = habit.id; // Set data-id for clicks
        habitItem.dataset.completed = habit.completed; // Store completion state

        habitItem.innerHTML = `
            <span>${habit.name}</span>
            <div class="habit-actions">
                <button class="btn-complete">✅</button>
                <button class="btn-delete">❌</button>
            </div>
        `;
        return habitItem;
    };
    
    // Add a new habit
    habitForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return; // Can't add habit if not logged in

        const newHabit = {
            name: document.getElementById('habit-name').value, // Matches our HTML
            user_id: user.id, // Associate habit with the user
            completed: false,
            // You can add frequency and color here if you add them to your DB table
        };

        const { data, error } = await supabase
            .from('habits')
            .insert(newHabit)
            .select()
            .single(); // Get the newly created habit back

        if (error) {
            console.error('Error saving habit:', error);
        } else {
            // More efficient: just add the new habit to the list
            const habitItem = createHabitElement(data);
            habitList.prepend(habitItem); // Add to the top of the list
            habitForm.reset();
        }
    });

    // Handle complete and delete actions using event delegation
    habitList.addEventListener('click', async (e) => {
        const habitItem = e.target.closest('.habit-item');
        if (!habitItem) return;

        const habitId = habitItem.dataset.id;
        
        if (e.target.classList.contains('btn-delete')) {
            const { error } = await supabase.from('habits').delete().eq('id', habitId);
            if (error) {
                console.error('Error deleting habit:', error);
            } else {
                habitItem.remove(); // Remove from UI instantly
            }
        }
        
        if (e.target.classList.contains('btn-complete')) {
            const isCompleted = habitItem.dataset.completed === 'true';
            const { error } = await supabase
                .from('habits')
                .update({ completed: !isCompleted })
                .eq('id', habitId);

            if (error) {
                console.error('Error updating habit:', error);
            } else {
                // Update UI instantly
                habitItem.dataset.completed = !isCompleted;
                habitItem.classList.toggle('completed');
            }
        }
    });

});
