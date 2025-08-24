const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://sgerrmmjtyjsdqztuhqv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnZXJybW1qdHlqc2RxenR1aHF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MTcxMjMsImV4cCI6MjA2MzI5MzEyM30.VObd_vas0hbGO4UXVkHyaqOHxrguwKQh_4ujfQw7cSE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function populateDatabase() {
  console.log('Starting database population...');

  console.log('Inserting merchandise data...');
  const { data: merchData, error: merchError } = await supabase
    .from('merchandise')
    .insert([
      { name: 'Riot Tee (Black/Red)', price: 35, stock: 50, is_active: true },
      { name: 'Riot Dad Hat', price: 28, stock: 30, is_active: true },
      { name: 'Riot Hoodie', price: 60, stock: 25, is_active: true },
      { name: 'Riot Poster', price: 15, stock: 100, is_active: true },
      { name: 'Riot Stickers', price: 5, stock: 200, is_active: true },
      { name: 'Riot Keychain', price: 10, stock: 150, is_active: true }
    ]);

  if (merchError) {
    console.error('Error inserting merchandise:', merchError);
  } else {
    console.log('Merchandise data inserted successfully:', merchData);
  }

  console.log('Inserting stream logs...');
  const { data: logsData, error: logsError } = await supabase
    .from('stream_logs')
    .insert([
      { status: 'DISCONNECTED', bitrate: null, notes: 'Stream offline' },
      { status: 'LIVE', bitrate: 3000, notes: 'Test stream active' }
    ]);

  if (logsError) {
    console.error('Error inserting stream logs:', logsError);
  } else {
    console.log('Stream logs inserted successfully:', logsData);
  }

  console.log('Checking current merchandise data...');
  const { data: currentMerch, error: checkError } = await supabase
    .from('merchandise')
    .select('*');

  if (checkError) {
    console.error('Error checking merchandise:', checkError);
  } else {
    console.log('Current merchandise count:', currentMerch?.length || 0);
    console.log('Merchandise items:', currentMerch);
  }

  console.log('Database population complete!');
}

populateDatabase().catch(console.error);
