import type { SimulationStateType } from '../state';

/**
 * Node: Check if the conversation should terminate.
 * Checks for:
 * 1. Explicit [END_CONVERSATION] in the last message
 * 2. Maximum turns reached
 * 3. Errors
 */
export async function checkTerminationNode(
  state: SimulationStateType
): Promise<Partial<SimulationStateType>> {
  // Check for explicit end marker in the last transcript entry
  const lastEntry = state.transcript[state.transcript.length - 1];

  if (lastEntry?.text.includes('[END_CONVERSATION]')) {
    return {
      isActive: false,
      terminationReason: 'explicit_end',
    };
  }

  // Check for max turns reached
  // currentTurn is incremented after agent B speaks
  if (state.currentTurn >= state.maxTurns) {
    return {
      isActive: false,
      terminationReason: 'max_turns',
    };
  }

  // Check for errors from previous nodes
  if (state.error) {
    return {
      isActive: false,
      terminationReason: 'error',
    };
  }

  // Continue conversation
  return {};
}
