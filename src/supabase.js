import { createClient } from "@supabase/supabase-js";

const supabaseUrl = 'https://lblnhhwocdojigsytmhk.supabase.co'; // استبدل بـ URL الخاص بك
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxibG5oaHdvY2Rvamlnc3l0bWhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxODA5NzUsImV4cCI6MjA2MDc1Njk3NX0.0MV8diAyY-6kcNkiHAN5iayO26PeE1OU8sjdCTFxmhg'; // استبدل بـ مفتاح API
export const supabase = createClient(supabaseUrl, supabaseKey);