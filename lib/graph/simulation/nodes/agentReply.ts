import type { SimulationStateType } from '../state';
import { generateAgentReply } from '@/lib/agents/generateReply';

/**
 * Node: Generate a reply from the current speaker agent.
 * Uses the stateless generateAgentReply function.
 */
export async function agentReplyNode(
  state: SimulationStateType
): Promise<Partial<SimulationStateType>> {
  // Determine which agent speaks based on nextSpeaker
  const agent = state.nextSpeaker === 'A' ? state.agentA : state.agentB;

  try {
    const reply = await generateAgentReply({
      persona: agent.persona,
      lastMessage: state.lastMessage,
      conversationHistory: state.transcript,
    });

    // Create transcript entry
    const entry = {
      speaker: agent.name,
      id: agent.id,
      text: reply,
      timestamp: new Date().toISOString(),
    };

    // Return state updates
    // transcript uses append reducer, so we return an array with the new entry
    return {
      transcript: [entry],
      lastMessage: reply,
      // Switch speaker for next turn
      nextSpeaker: state.nextSpeaker === 'A' ? 'B' : 'A',
      // Increment turn after agent B speaks (one "turn" = both agents spoke)
      currentTurn:
        state.nextSpeaker === 'B' ? state.currentTurn + 1 : state.currentTurn,
    };
  } catch (error: any) {
    return {
      error: `Agent reply failed: ${error.message}`,
      isActive: false,
      terminationReason: 'error',
    };
  }
}
