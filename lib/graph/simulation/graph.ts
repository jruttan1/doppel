import { StateGraph, START, END } from '@langchain/langgraph';
import type { BaseCheckpointSaver } from '@langchain/langgraph';
import { SimulationState } from './state';
import {
  agentReplyNode,
  syncToDbNode,
  checkTerminationNode,
  analyzeConversationNode,
  persistFinalNode,
} from './nodes';
import { shouldContinueConversation } from './edges/router';

/**
 * Create the simulation StateGraph.
 *
 * Graph topology:
 * START → agentReply → syncToDb → checkTermination → [routing]
 *                                                    ↓
 *                                          continue → (loop back to agentReply)
 *                                          analyze → analyzeConversation → persistFinal → END
 */
export function createSimulationGraph() {
  const graph = new StateGraph(SimulationState)
    // Add all nodes
    .addNode('agentReply', agentReplyNode)
    .addNode('syncToDb', syncToDbNode)
    .addNode('checkTermination', checkTerminationNode)
    .addNode('analyzeConversation', analyzeConversationNode)
    .addNode('persistFinal', persistFinalNode)

    // START → agentReply
    .addEdge(START, 'agentReply')

    // agentReply → syncToDb
    .addEdge('agentReply', 'syncToDb')

    // syncToDb → checkTermination
    .addEdge('syncToDb', 'checkTermination')

    // Conditional routing from checkTermination
    .addConditionalEdges('checkTermination', shouldContinueConversation, {
      continue: 'agentReply',
      analyze: 'analyzeConversation',
    })

    // analyzeConversation → persistFinal
    .addEdge('analyzeConversation', 'persistFinal')

    // persistFinal → END
    .addEdge('persistFinal', END);

  return graph;
}

/**
 * Compile the simulation graph with optional checkpointer.
 *
 * Note: recursionLimit is set high because each "turn" involves multiple nodes:
 * agentReply → syncToDb → checkTermination (×2 for both agents per turn)
 * So 15 turns = ~90+ node executions
 */
export function compileSimulationGraph(options?: {
  checkpointer?: BaseCheckpointSaver;
  recursionLimit?: number;
}) {
  const graph = createSimulationGraph();

  return graph.compile({
    checkpointer: options?.checkpointer,
  });
}

// Default config for graph invocation
export const DEFAULT_GRAPH_CONFIG = {
  recursionLimit: 150, // 15 turns × 2 agents × ~5 nodes per cycle
};

// Type for the compiled graph
export type SimulationGraph = ReturnType<typeof compileSimulationGraph>;
