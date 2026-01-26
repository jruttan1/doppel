import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load .env.local (Next.js convention)
config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SERVICE_ROLE_KEY!
);

async function main() {
  console.log('\n=== LIVE FEED DIAGNOSTICS ===\n');

  // 1. Check environment variables
  console.log('1. Checking environment variables...');
  console.log('   NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓' : '✗ MISSING');
  console.log('   SERVICE_ROLE_KEY:', process.env.SERVICE_ROLE_KEY ? '✓' : '✗ MISSING');
  console.log('   DATABASE_URL:', process.env.DATABASE_URL ? '✓' : '✗ MISSING');
  console.log('   GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? '✓' : '✗ MISSING');

  // 2. Check simulations table schema
  console.log('\n2. Checking simulations table schema...');
  const { data: sample, error: sampleError } = await supabase
    .from('simulations')
    .select('*')
    .limit(1);

  if (sampleError) {
    console.log('   ERROR:', sampleError.message);
  } else if (sample && sample.length > 0) {
    console.log('   Columns found:', Object.keys(sample[0]).join(', '));

    // Check for status column
    if ('status' in sample[0]) {
      console.log('   ✓ status column exists');
    } else {
      console.log('   ✗ status column MISSING - need to add it');
      console.log('\n   Run this SQL in Supabase:');
      console.log('   ALTER TABLE simulations ADD COLUMN IF NOT EXISTS status TEXT DEFAULT NULL;');
    }
  } else {
    console.log('   No simulations yet, checking if table exists...');
    // Try to insert and see what error we get
    const { error: insertTest } = await supabase
      .from('simulations')
      .insert({ participant1: '00000000-0000-0000-0000-000000000000', participant2: '00000000-0000-0000-0000-000000000001', transcript: [] })
      .select();

    if (insertTest) {
      console.log('   Insert test error:', insertTest.message);
      if (insertTest.message.includes('status')) {
        console.log('   ✗ status column MISSING');
      }
    }

    // Clean up test
    await supabase.from('simulations').delete().eq('participant1', '00000000-0000-0000-0000-000000000000');
  }

  // 3. Check user data
  console.log('\n3. Checking users with personas...');
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, name, ingestion_status')
    .not('persona', 'is', null)
    .eq('ingestion_status', 'complete');

  if (usersError) {
    console.log('   ERROR:', usersError.message);
  } else {
    console.log(`   Found ${users?.length || 0} users with complete personas:`);
    users?.slice(0, 5).forEach(u => {
      console.log(`   - ${u.name} (${u.id.slice(0, 8)}...)`);
    });
    if ((users?.length || 0) > 5) {
      console.log(`   ... and ${(users?.length || 0) - 5} more`);
    }
  }

  // 4. Check existing simulations
  console.log('\n4. Checking existing simulations...');
  const { data: sims, error: simsError } = await supabase
    .from('simulations')
    .select('id, participant1, participant2, score, created_at')
    .order('created_at', { ascending: false })
    .limit(10);

  if (simsError) {
    console.log('   ERROR:', simsError.message);
  } else {
    console.log(`   Found ${sims?.length || 0} recent simulations:`);
    for (const sim of sims || []) {
      const hasScore = sim.score !== null;
      console.log(`   - ${sim.id.slice(0, 8)}... | score: ${sim.score ?? 'pending'} | ${hasScore ? '✓ completed' : '⏳ running/pending'}`);
    }
  }

  // 5. Test DATABASE_URL connection (for checkpointer)
  console.log('\n5. Testing DATABASE_URL connection...');
  if (process.env.DATABASE_URL) {
    try {
      const { PostgresSaver } = await import('@langchain/langgraph-checkpoint-postgres');
      const checkpointer = PostgresSaver.fromConnString(process.env.DATABASE_URL);
      await checkpointer.setup();
      console.log('   ✓ Checkpointer connection successful');
    } catch (e: any) {
      console.log('   ✗ Checkpointer ERROR:', e.message);
      if (e.message.includes('ENOTFOUND') || e.message.includes('ECONNREFUSED')) {
        console.log('   → Check your DATABASE_URL is correct');
        console.log('   → For serverless, use the pooler URL (port 6543)');
      }
    }
  } else {
    console.log('   ✗ DATABASE_URL not set');
  }

  console.log('\n=== DIAGNOSTICS COMPLETE ===\n');
}

main().catch(console.error);
