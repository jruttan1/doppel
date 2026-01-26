import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';

let checkpointer: PostgresSaver | null = null;
let setupPromise: Promise<void> | null = null;

/**
 * Get the Postgres checkpointer singleton.
 * Creates checkpoint tables on first call if they don't exist.
 */
export async function getCheckpointer(): Promise<PostgresSaver> {
  if (!checkpointer) {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error(
        'DATABASE_URL environment variable is required for checkpointing'
      );
    }

    checkpointer = PostgresSaver.fromConnString(connectionString);

    // Setup creates the checkpoint tables if they don't exist
    // Only run setup once
    if (!setupPromise) {
      setupPromise = checkpointer.setup();
    }
    await setupPromise;
  }

  return checkpointer;
}
