import type { SimulationStateType } from '../state';
import { analyzeTranscript } from '@/lib/agents/gemini';

/**
 * Node: Analyze the conversation transcript with Gemini.
 * Returns a score (0-100) and takeaways.
 */
export async function analyzeConversationNode(
  state: SimulationStateType
): Promise<Partial<SimulationStateType>> {
  // Skip analysis if there was an error
  if (state.error) {
    return {
      analysis: {
        score: 0,
        takeaways: ['Conversation failed due to error'],
      },
    };
  }

  // Skip analysis if transcript is empty or too short
  if (state.transcript.length < 2) {
    return {
      analysis: {
        score: 0,
        takeaways: ['Conversation too short to analyze'],
      },
    };
  }

  try {
    const analysis = await analyzeTranscript(
      state.transcript.map((t) => ({
        speaker: t.speaker,
        text: t.text,
      }))
    );

    return { analysis };
  } catch (error: any) {
    // Don't fail the graph, return a default score
    console.error('Analysis failed:', error);
    return {
      analysis: {
        score: 50,
        takeaways: [`Analysis failed: ${error.message}`],
      },
    };
  }
}
