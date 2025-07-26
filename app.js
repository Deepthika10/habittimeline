// js/app.js
document.addEventListener('DOMContentLoaded', () => {
    const habitsList = document.getElementById('habits-list');
    const addHabitBtn = document.getElementById('add-habit-btn');
    const modal = document.getElementById('habit-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const habitForm = document.getElementById('habit-form');
    const habitTitleInput = document.getElementById('habit-title');
    const habitColorInput = document.getElementById('habit-color');
    const currentDateEl = document.getElementById('current-date');

    // Set current date
    currentDateEl.textContent = new Date().toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // --- Data Functions ---
    const fetchHabits = async () => {
        const { data, error } = await supabase.from('habits').select('*').order('created_at');
        if (error) console.error('Error fetching habits:', error);
        else renderHabits(data);
    };

    const addHabit = async (title, color) => {
        const { error } = await supabase.from('habits').insert([{ title, color }]);
        if (error) console.error('Error adding habit:', error);
        else {
            fetchHabits();
            closeModal();
        }
    };

    const toggleHabitCompletion = async (habit) => {
        const completedDates = habit.completed_dates || [];
        const isCompleted = completedDates.includes(today);
        
        const updatedDates = isCompleted
            ? completedDates.filter(date => date !== today)
            : [...completedDates, today];

        const { error } = await supabase
            .from('habits')
            .update({ completed_dates: updatedDates })
            .eq('id', habit.id);
        
        if (error) console.error('Error updating habit:', error);
        else fetchHabits();
    };


    // --- Render Functions ---
    const renderHabits = (habits) => {
        habitsList.innerHTML = '';
        if (habits.length === 0) {
            habitsList.innerHTML = '<p>No habits yet. Add one to get started!</p>';
            return;
        }
        habits.forEach(habit => {
            const isCompleted = habit.completed_dates && habit.completed_dates.includes(today);
            const habitEl = document.createElement('div');
            habitEl.classList.add('habit-item');
            habitEl.style.borderLeftColor = habit.color;

            habitEl.innerHTML = `
                <p>${habit.title}</p>
                <button class="completion-btn ${isCompleted ? 'completed' : ''}">✓</button>
            `;
            
            // Event listener for completing a habit
            habitEl.querySelector('.completion-btn').addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent navigating to summary
                toggleHabitCompletion(habit);
            });

            // Event listener to go to summary page
            habitEl.addEventListener('click', () => {
                window.location.href = `summary.html?id=${habit.id}`;
            });

            habitsList.appendChild(habitEl);
        });
    };

    // --- Modal Functions ---
    const openModal = () => {
        habitForm.reset();
        modal.style.display = 'flex';
    };
    const closeModal = () => modal.style.display = 'none';

    // --- Event Listeners ---
    addHabitBtn.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);
    habitForm.addEventListener('submit', (e) => {
        e.preventDefault();
        addHabit(habitTitleInput.value, habitColorInput.value);
    });

    // Initial fetch
    fetchHabits();
});
