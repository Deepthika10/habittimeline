document.addEventListener('DOMContentLoaded', () => {
    const habitForm = document.getElementById('add-habit-form');
    const habitList = document.getElementById('habit-list');

    // Initialize Supabase client
    const supabaseUrl = 'YOUR_SUPABASE_URL';
    const supabaseKey = 'YOUR_SUPABASE_PUBLIC_KEY';
    const supabase = supabase.createClient(supabaseUrl, supabaseKey);

    // Get habits from Supabase
    const getHabits = async () => {
        const { data, error } = await supabase
            .from('habits')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Error fetching habits:', error);
            return [];
        }
        
        return data;
    };

    // Save a new habit to Supabase
    const saveHabit = async (habit) => {
        const { data, error } = await supabase
            .from('habits')
            .insert([habit])
            .select();
        
        if (error) {
            console.error('Error saving habit:', error);
        }
        
        return data;
    };

    // Update habit completion status in Supabase
    const updateHabit = async (id, updates) => {
        const { data, error } = await supabase
            .from('habits')
            .update(updates)
            .eq('id', id)
            .select();
        
        if (error) {
            console.error('Error updating habit:', error);
        }
        
        return data;
    };

    // Delete habit from Supabase
    const deleteHabit = async (id) => {
        const { error } = await supabase
            .from('habits')
            .delete()
            .eq('id', id);
        
        if (error) {
            console.error('Error deleting habit:', error);
        }
    };

    // Render habits to the page
    const renderHabits = async () => {
        const habits = await getHabits();
        habitList.innerHTML = ''; // Clear the list before rendering

        if (habits.length === 0) {
            habitList.innerHTML = '<p>No habits added for today yet. Add one above!</p>';
            return;
        }
        
        habits.forEach((habit) => {
            const habitItem = document.createElement('div');
            habitItem.classList.add('habit-item');
            if (habit.completed) {
                habitItem.classList.add('completed');
            }
            habitItem.style.borderLeftColor = habit.color;

            habitItem.innerHTML = `
                <span>${habit.title}</span>
                <div class="habit-actions">
                    <button class="btn-complete" data-id="${habit.id}">✔</button>
                    <button class="btn-delete" data-id="${habit.id}">✖</button>
                </div>
            `;
            habitList.appendChild(habitItem);
        });
    };
    
    // Add a new habit
    habitForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const title = document.getElementById('habit-title').value;
        const frequency = document.getElementById('habit-frequency').value;
        const color = document.getElementById('habit-color').value;

        const newHabit = {
            title,
            frequency,
            color,
            completed: false,
            created_at: new Date().toISOString()
        };

        await saveHabit(newHabit);
        habitForm.reset();
        await renderHabits();
    });

    // Handle complete and delete actions
    habitList.addEventListener('click', async (e) => {
        const habitId = e.target.dataset.id;

        if (e.target.classList.contains('btn-complete')) {
            // Get current completion status
            const habits = await getHabits();
            const habit = habits.find(h => h.id == habitId);
            
            if (habit) {
                await updateHabit(habitId, { completed: !habit.completed });
            }
        }
        
        if (e.target.classList.contains('btn-delete')) {
            await deleteHabit(habitId);
        }

        await renderHabits();
    });

    // Initial render
    renderHabits();
});
