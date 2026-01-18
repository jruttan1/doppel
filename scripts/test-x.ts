// Run with: npx tsx scripts/test-x.ts <username>
// Example: npx tsx scripts/test-x.ts elonmusk
//          npx tsx scripts/test-x.ts @elonmusk
//          npx tsx scripts/test-x.ts https://x.com/elonmusk

const USERNAME = process.argv[2];

if (!USERNAME) {
  console.log("Usage: npx tsx scripts/test-x.ts <username>");
  console.log("\nExamples:");
  console.log("  npx tsx scripts/test-x.ts elonmusk");
  console.log("  npx tsx scripts/test-x.ts @elonmusk");
  console.log("  npx tsx scripts/test-x.ts https://x.com/elonmusk");
  process.exit(1);
}

async function testX() {
  console.log(`\n🧪 Testing Gumloop X/Twitter flow for: ${USERNAME}\n`);
  
  const res = await fetch("http://localhost:3000/api/test-x", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: USERNAME }),
  });

  const data = await res.json();
  
  if (data.success) {
    console.log("✅ Test successful!\n");
    console.log("=".repeat(60));
    console.log("RAW TWEETS:");
    console.log("=".repeat(60));
    if (Array.isArray(data.rawTweets)) {
      data.rawTweets.forEach((tweet: string, i: number) => {
        console.log(`\n[${i + 1}] ${tweet}`);
      });
    } else {
      console.log(JSON.stringify(data.rawTweets, null, 2));
    }
    
    console.log("\n" + "=".repeat(60));
    console.log("GEMINI SUMMARY:");
    console.log("=".repeat(60));
    console.log(JSON.stringify(data.summary, null, 2));
    
    console.log("\n" + "=".repeat(60));
    console.log("DEBUG INFO:");
    console.log("=".repeat(60));
    console.log(`Run ID: ${data.runId}`);
    console.log(`Poll attempts: ${data.attempts}`);
    console.log(`Output keys: ${data.debug?.outputsKeys?.join(', ') || 'none'}`);
  } else {
    console.log("❌ Test failed:");
    console.log(data.error);
    if (data.details) {
      console.log("\nDetails:", data.details);
    }
    if (data.finalStatus) {
      console.log("\nFinal status:", JSON.stringify(data.finalStatus, null, 2));
    }
  }
}

testX().catch(console.error);
