document.addEventListener('DOMContentLoaded', () => {
    const weeklyAvgEl = document.getElementById('weekly-avg');
    const monthlyAvgEl = document.getElementById('monthly-avg');

    const getHabits = () => {
        return JSON.parse(localStorage.getItem('habits')) || [];
    };

    const calculateAverages = () => {
        const habits = getHabits();
        const now = new Date();
        
        // --- Weekly Average ---
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
        
        const weeklyHabits = habits.filter(h => {
            const habitDate = new Date(h.createdAt);
            return habitDate >= startOfWeek && habitDate <= endOfWeek;
        });
        
        const weeklyCompleted = weeklyHabits.filter(h => h.completed).length;
        const weeklyTotal = weeklyHabits.length;
        const weeklyAverage = weeklyTotal > 0 ? ((weeklyCompleted / weeklyTotal) * 100).toFixed(1) : 0;
        
        weeklyAvgEl.textContent = `${weeklyAverage}%`;

        // --- Monthly Average ---
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const monthlyHabits = habits.filter(h => {
            const habitDate = new Date(h.createdAt);
            return habitDate >= startOfMonth && habitDate <= endOfMonth;
        });

        const monthlyCompleted = monthlyHabits.filter(h => h.completed).length;
        const monthlyTotal = monthlyHabits.length;
        const monthlyAverage = monthlyTotal > 0 ? ((monthlyCompleted / monthlyTotal) * 100).toFixed(1) : 0;

        monthlyAvgEl.textContent = `${monthlyAverage}%`;
    };

    calculateAverages();
});
