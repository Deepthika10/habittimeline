import supabase from './supabase.js';

// Create a new habit
async function createHabit(habitData) {
  const { data, error } = await supabase
    .from('habits')
    .insert([habitData])
    .select();
    
  if (error) {
    console.error('Error creating habit:', error.message);
    return { success: false, error: error.message };
  }
  
  return { success: true, habit: data[0] };
}

// Get all habits for the current user
async function getHabits() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return [];
  
  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', user.id);
    
  if (error) {
    console.error('Error fetching habits:', error.message);
    return [];
  }
  
  return data;
}

// Get today's habits
async function getTodayHabits() {
  const habits = await getHabits();
  const today = new Date().toISOString().split('T')[0];
  
  // For each habit, check if it has a log for today
  const habitsWithStatus = await Promise.all(habits.map(async habit => {
    const { data: log } = await supabase
      .from('habit_logs')
      .select('completed, notes, mood')
      .eq('habit_id', habit.id)
      .eq('date', today)
      .single();
      
    return {
      ...habit,
      completed: log?.completed || false,
      notes: log?.notes || '',
      mood: log?.mood || null
    };
  }));
  
  return habitsWithStatus;
}

// Update habit completion status
async function updateHabitStatus(habitId, completed, notes = '', mood = null) {
  const today = new Date().toISOString().split('T')[0];
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { success: false, error: 'Not authenticated' };
  
  // Check if log already exists
  const { data: existingLog } = await supabase
    .from('habit_logs')
    .select('id')
    .eq('habit_id', habitId)
    .eq('date', today)
    .single();
    
  if (existingLog) {
    // Update existing log
    const { data, error } = await supabase
      .from('habit_logs')
      .update({ completed, notes, mood })
      .eq('id', existingLog.id)
      .select();
      
    if (error) {
      console.error('Error updating habit log:', error.message);
      return { success: false, error: error.message };
    }
    
    return { success: true, log: data[0] };
  } else {
    // Create new log
    const { data, error } = await supabase
      .from('habit_logs')
      .insert([{
        habit_id: habitId,
        date: today,
        completed,
        notes,
        mood
      }])
      .select();
      
    if (error) {
      console.error('Error creating habit log:', error.message);
      return { success: false, error: error.message };
    }
    
    return { success: true, log: data[0] };
  }
}

// Delete a habit
async function deleteHabit(habitId) {
  const { error } = await supabase
    .from('habits')
    .delete()
    .eq('id', habitId);
    
  if (error) {
    console.error('Error deleting habit:', error.message);
    return { success: false, error: error.message };
  }
  
  return { success: true };
}

// Get habit logs for a specific habit
async function getHabitLogs(habitId) {
  const { data, error } = await supabase
    .from('habit_logs')
    .select('*')
    .eq('habit_id', habitId)
    .order('date', { ascending: false });
    
  if (error) {
    console.error('Error fetching habit logs:', error.message);
    return [];
  }
  
  return data;
}

// Get statistics
async function getStatistics() {
  const habits = await getHabits();
  const today = new Date().toISOString().split('T')[0];
  
  // Get today's logs
  const habitIds = habits.map(h => h.id);
  const { data: todayLogs } = await supabase
    .from('habit_logs')
    .select('habit_id, completed')
    .in('habit_id', habitIds)
    .eq('date', today);
    
  const completedToday = todayLogs?.filter(log => log.completed).length || 0;
  
  // Calculate streaks (simplified version)
  let currentStreak = 0;
  
  // This is a simplified streak calculation - you might want to implement a more robust one
  if (habits.length > 0) {
    const { data: recentLogs } = await supabase
      .from('habit_logs')
      .select('date, completed')
      .in('habit_id', habitIds)
      .order('date', { ascending: false })
      .limit(30);
      
    // Check consecutive days with at least one completed habit
    let streakActive = true;
    let checkDate = new Date();
    
    while (streakActive) {
      const dateStr = checkDate.toISOString().split('T')[0];
      const dayLogs = recentLogs?.filter(log => log.date === dateStr);
      
      if (dayLogs && dayLogs.some(log => log.completed)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        streakActive = false;
      }
    }
  }
  
  return {
    totalHabits: habits.length,
    completedToday,
    currentStreak
  };
}

export { 
  createHabit, 
  getHabits, 
  getTodayHabits, 
  updateHabitStatus, 
  deleteHabit, 
  getHabitLogs,
  getStatistics
};
