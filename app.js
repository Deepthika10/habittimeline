import { getTodayHabits, updateHabitStatus, getStatistics } from './habits.js';

// DOM elements
const todayHabitsContainer = document.getElementById('today-habits');
const currentStreakEl = document.getElementById('current-streak');
const todayProgressEl = document.getElementById('today-progress');
const totalHabitsEl = document.getElementById('total-habits');
const currentDateEl = document.getElementById('current-date');

// Initialize date display
function initDateDisplay() {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  currentDateEl.textContent = new Date().toLocaleDateString(undefined, options);
}

// Load today's habits
async function loadTodayHabits() {
  const habits = await getTodayHabits();
  const stats = await getStatistics();
  
  updateStats(stats);
  renderHabits(habits);
}

// Update statistics display
function updateStats(stats) {
  currentStreakEl.textContent = `${stats.currentStreak} days`;
  todayProgressEl.textContent = `${stats.completedToday}/${stats.totalHabits}`;
  totalHabitsEl.textContent = stats.totalHabits;
}

// Render habits
function renderHabits(habits) {
  todayHabitsContainer.innerHTML = '';
  
  if (habits.length === 0) {
    todayHabitsContainer.innerHTML = `
      <div class="no-habits-message">
        <p>No habits for today. <a href="create.html">Create a new habit</a> to get started!</p>
      </div>
    `;
    return;
  }
  
  habits.forEach(habit => {
    const habitCard = document.createElement('div');
    habitCard.className = `habit-card ${habit.completed ? 'completed' : ''}`;
    habitCard.innerHTML = `
      <div class="habit-card-header">
        <div>
          <h3 class="habit-name">${habit.name}</h3>
          <p class="habit-frequency">${formatFrequency(habit.frequency)}</p>
        </div>
        <div class="habit-actions">
          <button class="btn-icon toggle-complete" data-habit-id="${habit.id}">
            <i class="fas fa-${habit.completed ? 'check-circle' : 'circle'}"></i>
          </button>
          <a href="details.html?id=${habit.id}" class="btn-icon">
            <i class="fas fa-ellipsis-h"></i>
          </a>
        </div>
      </div>
      ${habit.notes ? `<p class="habit-notes">${habit.notes}</p>` : ''}
      ${habit.mood ? `<div class="habit-mood">Mood: ${getMoodEmoji(habit.mood)}</div>` : ''}
    `;
    
    todayHabitsContainer.appendChild(habitCard);
  });
  
  // Add event listeners to toggle buttons
  document.querySelectorAll('.toggle-complete').forEach(button => {
    button.addEventListener('click', async (e) => {
      const habitId = e.currentTarget.getAttribute('data-habit-id');
      const habitCard = e.currentTarget.closest('.habit-card');
      const isCompleted = habitCard.classList.contains('completed');
      
      const { success } = await updateHabitStatus(habitId, !isCompleted);
      
      if (success) {
        habitCard.classList.toggle('completed');
        const icon = e.currentTarget.querySelector('i');
        icon.classList.toggle('fa-circle');
        icon.classList.toggle('fa-check-circle');
        
        // Reload stats
        const stats = await getStatistics();
        updateStats(stats);
      }
    });
  });
}

// Format frequency for display
function formatFrequency(frequency) {
  const frequencyMap = {
    daily: 'Daily',
    weekly: 'Weekly',
    custom: 'Custom'
  };
  
  return frequencyMap[frequency] || frequency;
}

// Get mood emoji
function getMoodEmoji(mood) {
  const moodEmojis = {
    happy: '😊',
    good: '🙂',
    neutral: '😐',
    bad: '😕',
    terrible: '😞'
  };
  
  return moodEmojis[mood.toLowerCase()] || mood;
}

// Initialize theme toggle
function initThemeToggle() {
  const themeToggle = document.createElement('button');
  themeToggle.className = 'theme-toggle';
  themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
  document.body.appendChild(themeToggle);
  
  // Check for saved theme preference or use preferred color scheme
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
  }
  
  // Toggle theme
  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    
    if (currentTheme === 'dark') {
      document.documentElement.removeAttribute('data-theme');
      themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
      localStorage.setItem('theme', 'dark');
    }
  });
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  initDateDisplay();
  initThemeToggle();
  
  // Load habits if authenticated
  const authOnlyElements = document.querySelectorAll('.auth-only');
  if (authOnlyElements.length > 0) {
    loadTodayHabits();
  }
});
