import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const flashModel = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    responseMimeType: "application/json"
  }
});

// Apify configuration
const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN;
const APIFY_ACTOR_ID = 'apidojo/tweet-scraper';

export const maxDuration = 60;

async function fetchTweetsFromApify(username: string): Promise<string[] | null> {
  if (!APIFY_API_TOKEN) {
    console.error("Missing APIFY_API_TOKEN environment variable");
    return null;
  }

  console.log(`[Apify] Starting tweet scraper for: ${username}`);

  // 1. Start the actor run
  const runResponse = await fetch(
    `https://api.apify.com/v2/acts/${APIFY_ACTOR_ID}/runs?token=${APIFY_API_TOKEN}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startUrls: [{ url: `https://x.com/${username}` }],
        maxTweets: 50,
        addUserInfo: false,
      }),
    }
  );

  if (!runResponse.ok) {
    const errorText = await runResponse.text();
    console.error(`[Apify] Failed to start actor: ${runResponse.status}`, errorText);
    return null;
  }

  const runData = await runResponse.json();
  const runId = runData.data?.id;
  const datasetId = runData.data?.defaultDatasetId;

  if (!runId) {
    console.error("[Apify] No run ID returned:", runData);
    return null;
  }

  console.log(`[Apify] Run started: ${runId}, dataset: ${datasetId}`);

  // 2. Poll for completion (max 60 seconds)
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 2000));

    const statusResponse = await fetch(
      `https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_API_TOKEN}`
    );

    if (!statusResponse.ok) {
      console.log(`[Apify] Poll attempt ${i + 1}: Status ${statusResponse.status}`);
      continue;
    }

    const statusData = await statusResponse.json();
    const status = statusData.data?.status;

    console.log(`[Apify] Poll attempt ${i + 1}: Status = ${status}`);

    if (status === 'SUCCEEDED') {
      // 3. Fetch results from dataset
      const dataResponse = await fetch(
        `https://api.apify.com/v2/datasets/${datasetId}/items?token=${APIFY_API_TOKEN}`
      );

      if (!dataResponse.ok) {
        console.error("[Apify] Failed to fetch dataset items");
        return null;
      }

      const items = await dataResponse.json();

      // Extract tweet text from items
      const tweets = items
        .map((item: any) => item.full_text || item.text || item.tweet_text)
        .filter((text: string | undefined) => text && text.trim());

      console.log(`[Apify] Retrieved ${tweets.length} tweets`);
      return tweets.length > 0 ? tweets : null;
    }

    if (status === 'FAILED' || status === 'ABORTED' || status === 'TIMED-OUT') {
      console.error(`[Apify] Run failed with status: ${status}`);
      return null;
    }
  }

  console.error("[Apify] Polling timeout - run did not complete in 60 seconds");
  return null;
}

export async function POST(req: Request) {
  try {
    const { username } = await req.json();

    if (!username) {
      return NextResponse.json({ error: "Missing username" }, { status: 400 });
    }

    // Clean username (remove @ and URL parts)
    const cleanUsername = username.replace(/^@/, '').replace(/^https?:\/\/(x\.com|twitter\.com)\//, '').split('/')[0].trim();

    console.log(`Testing Apify for username: ${cleanUsername}`);

    // Fetch tweets from Apify
    const tweets = await fetchTweetsFromApify(cleanUsername);

    if (!tweets || tweets.length === 0) {
      return NextResponse.json({
        error: "No tweets retrieved",
        username: cleanUsername
      }, { status: 500 });
    }

    console.log(`Got ${tweets.length} tweets, summarizing with Gemini...`);

    // Summarize with Gemini
    const summaryPrompt = `
You are analyzing someone's Twitter/X presence to understand their authentic voice and personality.

TWEETS (last ${tweets.length}):
"""
${tweets.join('\n---\n')}
"""

Analyze these tweets and return JSON with:
{
  "communication_style": "String - how they write (casual, technical, witty, thoughtful, etc.)",
  "tone": "String - overall tone (friendly, sarcastic, professional, provocative, etc.)",
  "key_interests": ["Array of topics they frequently discuss"],
  "personality_traits": ["Array of personality traits evident from their tweets"],
  "notable_opinions": ["Array of strong opinions or takes they've shared"],
  "humor_style": "String or null - if they use humor, describe it",
  "engagement_style": "String - how they interact (asks questions, shares links, hot takes, threads, etc.)",
  "sample_voice": "String - write 1-2 sentences that capture how this person would naturally write/speak"
}

Focus on authentic voice signals. Ignore promotional content or retweets.
`;

    const result = await flashModel.generateContent(summaryPrompt);
    const summary = JSON.parse(result.response.text());

    return NextResponse.json({
      success: true,
      username: cleanUsername,
      tweetCount: tweets.length,
      rawTweets: tweets,
      summary: {
        username: cleanUsername,
        tweet_count: tweets.length,
        ...summary
      }
    });

  } catch (error: any) {
    console.error("Test X error:", error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
