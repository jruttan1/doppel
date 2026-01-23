import type { SimulationStateType } from '../state';

/**
 * Conditional router: determines whether to continue the conversation or analyze.
 * Used after checkTermination node.
 *
 * Returns:
 * - "continue" if conversation should continue (loops back to agentReply)
 * - "analyze" if conversation has ended (proceeds to analyzeConversation)
 */
export function shouldContinueConversation(
  state: SimulationStateType
): 'continue' | 'analyze' {
  // If conversation is still active and no errors, continue
  if (state.isActive && !state.error) {
    return 'continue';
  }

  // Otherwise, move to analysis
  return 'analyze';
}
