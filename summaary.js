// js/summary.js
document.addEventListener('DOMContentLoaded', () => {
    const habitTitleEl = document.getElementById('summary-habit-title');
    const historyList = document.getElementById('completion-history');
    const deleteBtn = document.getElementById('delete-habit-btn');

    const params = new URLSearchParams(window.location.search);
    const habitId = params.get('id');

    if (!habitId) {
        window.location.href = 'app.html';
        return;
    }

    const fetchHabitDetails = async () => {
        const { data, error } = await supabase
            .from('habits')
            .select('*')
            .eq('id', habitId)
            .single(); // We expect only one result

        if (error || !data) {
            console.error('Error fetching habit details:', error);
            habitTitleEl.textContent = 'Habit not found';
            return;
        }
        renderHabitDetails(data);
    };

    const renderHabitDetails = (habit) => {
        habitTitleEl.textContent = habit.title;
        habitTitleEl.style.color = habit.color;

        const completedDates = habit.completed_dates || [];
        historyList.innerHTML = '';

        if (completedDates.length === 0) {
            historyList.innerHTML = '<p>This habit has not been completed yet.</p>';
        } else {
            completedDates
                .sort((a, b) => new Date(b) - new Date(a)) // Sort dates descending
                .forEach(date => {
                    const p = document.createElement('p');
                    p.textContent = `Completed on: ${new Date(date).toLocaleDateString()}`;
                    historyList.appendChild(p);
                });
        }
    };

    const deleteHabit = async () => {
        const isConfirmed = confirm('Are you sure you want to delete this habit? This cannot be undone.');
        if (isConfirmed) {
            const { error } = await supabase
                .from('habits')
                .delete()
                .eq('id', habitId);

            if (error) {
                console.error('Error deleting habit:', error);
                alert('Could not delete the habit.');
            } else {
                alert('Habit deleted successfully.');
                window.location.href = 'app.html';
            }
        }
    };

    deleteBtn.addEventListener('click', deleteHabit);

    fetchHabitDetails();
});
