const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function simulateUser(userId) {
  try {
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    
    console.log(`User ${userId}: Loaded ${data?.length || 0} messages`);
    return true;
  } catch (error) {
    console.error(`User ${userId}: Error -`, error.message);
    return false;
  }
}

async function runLoadTest(concurrentUsers = 100) {
  console.log(`Starting load test with ${concurrentUsers} concurrent users...`);
  const promises = Array.from({ length: concurrentUsers }, (_, i) => simulateUser(i + 1));
  const results = await Promise.allSettled(promises);
  const successful = results.filter(r => r.status === 'fulfilled' && r.value).length;
  console.log(`Load test complete: ${successful}/${concurrentUsers} users successful`);
}

runLoadTest(parseInt(process.argv[2]) || 100);
