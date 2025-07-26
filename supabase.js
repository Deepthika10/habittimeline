// Initialize Supabase
const supabaseUrl = 'https://qhwesptqzazkrkertqbw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFod2VzcHRxemF6a3JrZXJ0cWJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1MTY3MTAsImV4cCI6MjA2OTA5MjcxMH0.wOJ7DDaZt046oz9jBTKh4EuRyfLDiA3Z7BfwagTrjHU';

const supabase = supabase.createClient(supabaseUrl, supabaseKey);

export default supabase;
