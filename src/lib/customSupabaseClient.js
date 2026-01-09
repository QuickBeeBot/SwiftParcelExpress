import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oifojrdtrazqdhrkltoj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pZm9qcmR0cmF6cWRocmtsdG9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwNTEzODUsImV4cCI6MjA4MjYyNzM4NX0.EI7FqShnxGxQO5EDVRAAQEJx3YHf6VLL9QUU-M2R6f0';

const customSupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export default customSupabaseClient;

export { 
    customSupabaseClient,
    customSupabaseClient as supabase,
};
