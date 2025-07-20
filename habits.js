// Habit CRUD operations
const habitForm = document.getElementById('habit-form');
const addHabitBtn = document.getElementById('add-habit-btn');
const addHabitModal = document.getElementById('add-habit-modal');
const closeModal = document.querySelector('.close');

// Modal handling
addHabitBtn?.addEventListener('click', () => {
  addHabitModal.style.display = 'block';
  document.getElementById('habit-start-date').value = getToday();
});

closeModal?.addEventListener('click', () => {
  addHabitModal.style.display = 'none';
});

window.addEventListener('click', (event) => {
  if (event.target === addHabitModal) {
    addHabitModal.style.display = 'none';
  }
});

// Create habit
habitForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const name = document.getElementById('habit-name').value;
  const frequency = document.getElementById('habit-frequency').value;
  const startDate = document.getElementById('habit-start-date').value;
  const color = document.getElementById('habit-color').value;
  const reminder = document.getElementById('habit-reminder').value;
  
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('habits')
    .insert([
      { 
        user_id: user.id,
        name,
        frequency,
        start_date: startDate,
        color,
        reminder_time: reminder || null
      }
    ])
    .select();
  
  if (error) {
    showNotification('Error creating habit: ' + error.message, 'error');
  } else {
    showNotification('Habit created successfully!', 'success');
    addHabitModal.style.display = 'none';
    habitForm.reset();
    loadTodayHabits();
    loadStats();
  }
});

// Load today's habits
async function loadTodayHabits() {
  const today = getToday();
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data: habits, error } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', user.id)
    .lte('start_date', today);
  
  if (error) {
    console.error('Error loading habits:', error);
    return;
  }
  
  const habitsContainer = document.getElementById('habits-container');
  habitsContainer.innerHTML = '';
  
  for (const habit of habits) {
    // Check if habit is due today based on frequency
    const isDueToday = checkIfHabitIsDueToday(habit, today);
    
    if (isDueToday) {
      const habitCard = createHabitCard(habit, today);
      habitsContainer.appendChild(habitCard);
    }
  }
}

function checkIfHabitIsDueToday(habit, today) {
  if (habit.frequency === 'daily') return true;
  
  // For weekly habits (due on the same day of the week as start date)
  if (habit.frequency === 'weekly') {
    const startDay = new Date(habit.start_date).getDay();
    const todayDay = new Date(today).getDay();
    return startDay === todayDay;
  }
  
  // For custom frequencies, you'd implement your logic here
  return false;
}

function createHabitCard(habit, date) {
  const card = document.createElement('div');
  card.className = 'habit-card';
  card.style.borderLeftColor = habit.color;
  
  // Check if habit is already logged for today
  checkHabitLog(habit.id, date).then(log => {
    card.innerHTML = `
      <h3>${habit.name}</h3>
      <p>Frequency: ${habit.frequency}</p>
      <div class="habit-actions">
        <button class="btn-complete" data-habit-id="${habit.id}" data-date="${date}">
          ${log?.completed ? '✓ Completed' : 'Mark Complete'}
        </button>
        ${log?.completed ? `
          <button class="btn-notes" data-habit-id="${habit.id}" data-date="${date}">
            ${log.notes ? 'Edit Notes' : 'Add Notes'}
          </button>
        ` : ''}
      </div>
    `;
    
    // Add event listeners
    card.querySelector('.btn-complete')?.addEventListener('click', () => toggleHabitCompletion(habit.id, date));
    card.querySelector('.btn-notes')?.addEventListener('click', () => showNotesModal(habit.id, date, log.notes));
  });
  
  return card;
}

async function checkHabitLog(habitId, date) {
  const { data, error } = await supabase
    .from('habit_logs')
    .select('*')
    .eq('habit_id', habitId)
    .eq('date', date)
    .single();
  
  return data;
}

async function toggleHabitCompletion(habitId, date) {
  const { data: existingLog } = await supabase
    .from('habit_logs')
    .select('*')
    .eq('habit_id', habitId)
    .eq('date', date)
    .single();
  
  if (existingLog) {
    // Toggle completion status
    const { error } = await supabase
      .from('habit_logs')
      .update({ completed: !existingLog.completed })
      .eq('id', existingLog.id);
    
    if (!error) {
      showNotification(`Habit ${existingLog.completed ? 'marked incomplete' : 'completed'}!`);
      loadTodayHabits();
      loadStats();
    }
  } else {
    // Create new log entry
    const { error } = await supabase
      .from('habit_logs')
      .insert([{ habit_id: habitId, date, completed: true }]);
    
    if (!error) {
      showNotification('Habit completed!');
      loadTodayHabits();
      loadStats();
    }
  }
}

// Load stats
async function loadStats() {
  const { data: { user } } = await supabase.auth.getUser();
  
  // Total habits
  const { count: totalHabits } = await supabase
    .from('habits')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);
  
  document.getElementById('total-habits').textContent = totalHabits || 0;
  
  // Streak and completion rate would require more complex queries
  // This is a simplified version
  const { data: logs } = await supabase
    .from('habit_logs')
    .select('date, completed')
    .in('habit_id', 
      supabase.from('habits').select('id').eq('user_id', user.id)
    )
    .order('date', { ascending: false });
  
  // Calculate streak
  let streak = 0;
  const today = new Date();
  let currentDate = new Date(today);
  
  while (true) {
    const dateStr = formatDate(currentDate);
    const dayLogs = logs?.filter(log => log.date === dateStr);
    
    if (!dayLogs || dayLogs.length === 0 || dayLogs.some(log => !log.completed)) {
      break;
    }
    
    streak++;
    currentDate.setDate(currentDate.getDate() - 1);
  }
  
  document.getElementById('current-streak').textContent = `${streak} days`;
  
  // Simple completion rate (last 30 days)
  if (logs && logs.length > 0) {
    const completed = logs.filter(log => log.completed).length;
    const rate = Math.round((completed / logs.length) * 100);
    document.getElementById('completion-rate').textContent = `${rate}%`;
  }
}

// Notes modal would be similar to the add habit modal
function showNotesModal(habitId, date, existingNotes = '') {
  // Implementation similar to add habit modal
  // Would include a textarea for notes and mood selection
}
