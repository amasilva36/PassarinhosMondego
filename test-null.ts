import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);

async function testNullMember() {
  const { data, error } = await supabase.from('payments').insert([
    { amount: 210, payment_date: '2026-05-09', notes: 'Fundo Inicial' }
  ]);
  console.log('Error:', error);
}

testNullMember();
