import type { AgentPersona, TranscriptEntry } from '@/lib/graph/simulation/types';
import { buildSystemPrompt, buildUserPrompt } from './prompts';
import { generateWithRetry } from './gemini';

export interface GenerateReplyInput {
  persona: AgentPersona;
  lastMessage: string | null;
  conversationHistory: TranscriptEntry[];
}

/**
 * Stateless function to generate an agent reply.
 * Takes persona and conversation state, returns a reply string.
 */
export async function generateAgentReply(
  input: GenerateReplyInput
): Promise<string> {
  const { persona, lastMessage, conversationHistory } = input;

  const systemPrompt = buildSystemPrompt(persona);
  const userPrompt = buildUserPrompt(
    lastMessage,
    conversationHistory.map((t) => ({ speaker: t.speaker, text: t.text }))
  );

  try {
    const reply = await generateWithRetry({
      systemPrompt,
      conversationHistory: conversationHistory.map((t) => ({
        speaker: t.speaker,
        text: t.text,
      })),
      userPrompt,
      config: {
        temperature: 0.8,
        maxOutputTokens: 200,
        topP: 0.9,
        topK: 30,
      },
    });

    return reply.trim();
  } catch (error: any) {
    // Fallback message on error
    const name = persona.identity?.name || persona.name || 'User';
    const tagline = persona.identity?.tagline || 'Nice to meet you!';
    return `Hi! I'm ${name}. ${tagline}`;
  }
}
