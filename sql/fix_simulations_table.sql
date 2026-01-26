-- Fix simulations table for live feed functionality

-- Add created_at column if missing
ALTER TABLE simulations
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Add status column if missing (should already exist based on diagnostics)
ALTER TABLE simulations
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT NULL;

-- Add updated_at column if missing
ALTER TABLE simulations
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_simulations_participant1_created
ON simulations(participant1, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_simulations_status
ON simulations(status) WHERE status IS NOT NULL;
