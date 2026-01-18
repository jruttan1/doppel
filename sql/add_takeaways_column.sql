-- Add takeaways column to simulations table
-- This stores the key points/summary from the AI analysis of the conversation

ALTER TABLE simulations 
ADD COLUMN IF NOT EXISTS takeaways jsonb DEFAULT '[]'::jsonb;

-- Add a comment for documentation
COMMENT ON COLUMN simulations.takeaways IS 'Array of key takeaways/insights from the AI analysis of the conversation';
