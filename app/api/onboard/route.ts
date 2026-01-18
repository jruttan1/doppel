import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SERVICE_ROLE_KEY!
);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const flashModel = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash",
  generationConfig: {
    responseMimeType: "text/plain"
  }
});

export const maxDuration = 60;

// PDF text extraction using Gemini Vision API (much more reliable!)
async function extractPdfText(base64: string): Promise<string | null> {
  try {
    console.log("Extracting PDF text using Gemini Vision API...");
    
    const result = await flashModel.generateContent([
      {
        inlineData: {
          mimeType: "application/pdf",
          data: base64
        }
      },
      {
        text: "Extract ALL text from this PDF document. Preserve the structure, formatting, and all content including headers, bullet points, dates, and technical details. Return only the extracted text, nothing else."
      }
    ]);
    
    const text = result.response.text();
    console.log(`Extracted ${text.length} characters from PDF`);
    return text.trim() || null;
  } catch (e: any) {
    console.error("PDF extraction error:", e.message);
    console.error("PDF extraction error stack:", e.stack);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const {
      userId,
      resumeBase64,
      linkedinBase64,
      githubUrl,
      xUrl,
      googleCalendarUrl,
      networkingGoals,
      voiceSignature,
      skills,
      skillsDesired,
      locationDesired,
    } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    console.log(`Processing onboarding for user: ${userId}`);

    // Parse PDFs server-side
    let resumeText: string | null = null;
    let linkedinText: string | null = null;

    if (resumeBase64) {
      resumeText = await extractPdfText(resumeBase64);
      console.log(`Parsed resume: ${resumeText?.length || 0} chars`);
    }

    if (linkedinBase64) {
      linkedinText = await extractPdfText(linkedinBase64);
      console.log(`Parsed LinkedIn: ${linkedinText?.length || 0} chars`);
    }

    // Save to database (only columns that exist in the table)
    const { error: updateError } = await supabase
      .from('users')
      .update({
        resume_text: resumeText,
        linkedin_text: linkedinText,
        github_url: githubUrl || null,
        x_url: xUrl || null,
        google_calendar_url: googleCalendarUrl || null,
        networking_goals: networkingGoals || [],
        voice_signature: voiceSignature || null,
        skills: skills || [],
        skills_desired: skillsDesired || [],
        location_desired: locationDesired || [],
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
