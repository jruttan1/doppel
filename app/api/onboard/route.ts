import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { PDFParse } from 'pdf-parse';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SERVICE_ROLE_KEY!
);

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const {
      userId,
      resumeBase64,
      linkedinBase64,
      githubUrl,
      networkingGoals,
      voiceSignature,
      interests,
    } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    console.log(`Processing onboarding for user: ${userId}`);

    // Parse PDFs server-side
    let resumeText: string | null = null;
    let linkedinText: string | null = null;

    if (resumeBase64) {
      try {
        const buffer = Buffer.from(resumeBase64, 'base64');
        const parser = new PDFParse({ data: new Uint8Array(buffer) });
        const result = await parser.getText();
        resumeText = result.pages.map((p: { text: string }) => p.text).join('\n\n').trim() || null;
        console.log(`Parsed resume: ${resumeText?.length || 0} chars`);
      } catch (e: any) {
        console.error("Resume parse error:", e.message);
      }
    }

    if (linkedinBase64) {
      try {
        const buffer = Buffer.from(linkedinBase64, 'base64');
        const parser = new PDFParse({ data: new Uint8Array(buffer) });
        const result = await parser.getText();
        linkedinText = result.pages.map((p: { text: string }) => p.text).join('\n\n').trim() || null;
        console.log(`Parsed LinkedIn: ${linkedinText?.length || 0} chars`);
      } catch (e: any) {
        console.error("LinkedIn parse error:", e.message);
      }
    }

    // Save to database
    const { error: updateError } = await supabase
      .from('users')
      .update({
        resume_text: resumeText,
        linkedin_text: linkedinText,
        github_url: githubUrl || null,
        networking_goals: networkingGoals || [],
        voice_signature: voiceSignature || null,
        ingestion_status: 'pending',
      })
      .eq('id', userId);

    if (updateError) {
      throw new Error(`Database update failed: ${updateError.message}`);
    }

    console.log("Onboarding data saved, triggering ingestion...");

    // Trigger ingestion (don't await - let it run in background)
    fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: userId }),
    }).catch(e => console.error("Ingestion trigger failed:", e));

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Onboarding error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
