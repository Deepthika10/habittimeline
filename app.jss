document.addEventListener('DOMContentLoaded', () => {
    const habitForm = document.getElementById('add-habit-form');
    const habitList = document.getElementById('habit-list');

    // Load habits from local storage
    const getHabits = () => {
        return JSON.parse(localStorage.getItem('habits')) || [];
    };

    // Save habits to local storage
    const saveHabits = (habits) => {
        localStorage.setItem('habits', JSON.stringify(habits));
    };

    // Render habits to the page
    const renderHabits = () => {
        const habits = getHabits();
        habitList.innerHTML = ''; // Clear the list before rendering

        if (habits.length === 0) {
            habitList.innerHTML = '<p>No habits added for today yet. Add one above!</p>';
            return;
        }
        
        habits.forEach((habit, index) => {
            const habitItem = document.createElement('div');
            habitItem.classList.add('habit-item');
            if (habit.completed) {
                habitItem.classList.add('completed');
            }
            habitItem.style.borderLeftColor = habit.color;

            habitItem.innerHTML = `
                <span>${habit.title}</span>
                <div class="habit-actions">
                    <button class="btn-complete" data-index="${index}">✔</button>
                    <button class="btn-delete" data-index="${index}">✖</button>
                </div>
            `;
            habitList.appendChild(habitItem);
        });
    };
    
    // Add a new habit
    habitForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const title = document.getElementById('habit-title').value;
        const frequency = document.getElementById('habit-frequency').value;
        const color = document.getElementById('habit-color').value;

        const newHabit = {
            title,
            frequency,
            color,
            completed: false,
            createdAt: new Date().toISOString()
        };

        const habits = getHabits();
        habits.push(newHabit);
        saveHabits(habits);

        habitForm.reset();
        renderHabits();
    });

    // Handle complete and delete actions
    habitList.addEventListener('click', (e) => {
        const habits = getHabits();
        const index = e.target.dataset.index;

        if (e.target.classList.contains('btn-complete')) {
            habits[index].completed = !habits[index].completed;
        }
        
        if (e.target.classList.contains('btn-delete')) {
            habits.splice(index, 1); // Remove the habit from the array
        }

        saveHabits(habits);
        renderHabits();
    });

    // Initial render
    renderHabits();
});
