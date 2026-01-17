-- Doppel Database Schema
-- Agent-to-Agent Networking Marketplace

-- Users/Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  headline TEXT,
  location TEXT,
  avatar_url TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Soul Files table (the AI persona for each user)
CREATE TABLE IF NOT EXISTS soul_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  -- Extracted structured data
  skills JSONB DEFAULT '[]'::jsonb,
  experience JSONB DEFAULT '[]'::jsonb,
  education JSONB DEFAULT '[]'::jsonb,
  -- Voice signature from vibe check
  voice_signature JSONB DEFAULT '{}'::jsonb,
  vibe_check_raw TEXT,
  -- Objectives
  objectives TEXT[] DEFAULT '{}',
  -- The generated system prompt
  system_prompt TEXT,
  -- Gatekeeper filters
  filters JSONB DEFAULT '{}'::jsonb,
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Connections table (potential matches)
CREATE TABLE IF NOT EXISTS connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  user_b_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  -- Status of the connection
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'simulated', 'matched', 'rejected', 'connected')),
  -- Compatibility score from Judge Agent (0-100)
  compatibility_score INTEGER,
  -- Detailed scores
  relevance_score INTEGER,
  reciprocity_score INTEGER,
  tone_match_score INTEGER,
  -- Generated content
  conversation_snapshot TEXT,
  talking_points JSONB DEFAULT '[]'::jsonb,
  icebreaker TEXT,
  -- Timestamps
  simulated_at TIMESTAMPTZ,
  matched_at TIMESTAMPTZ,
  connected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_a_id, user_b_id)
);

-- Simulations table (the clean room conversations)
CREATE TABLE IF NOT EXISTS simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID REFERENCES connections(id) ON DELETE CASCADE NOT NULL,
  -- Participants
  initiator_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  -- Conversation transcript
  transcript JSONB DEFAULT '[]'::jsonb,
  -- Metadata
  total_turns INTEGER DEFAULT 0,
  terminated_early BOOLEAN DEFAULT FALSE,
  termination_reason TEXT,
  -- Judge evaluation
  judge_evaluation JSONB,
  -- Timestamps
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents table (uploaded resumes, etc.)
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('resume', 'linkedin', 'portfolio', 'other')),
  file_name TEXT,
  file_url TEXT,
  extracted_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE soul_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Soul files policies
CREATE POLICY "Users can view own soul file" ON soul_files FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own soul file" ON soul_files FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own soul file" ON soul_files FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own soul file" ON soul_files FOR DELETE USING (auth.uid() = user_id);

-- Connections policies (users can see connections they're part of)
CREATE POLICY "Users can view own connections" ON connections FOR SELECT 
  USING (auth.uid() = user_a_id OR auth.uid() = user_b_id);
CREATE POLICY "Users can update own connections" ON connections FOR UPDATE 
  USING (auth.uid() = user_a_id OR auth.uid() = user_b_id);
CREATE POLICY "System can insert connections" ON connections FOR INSERT 
  WITH CHECK (auth.uid() = user_a_id);

-- Simulations policies
CREATE POLICY "Users can view own simulations" ON simulations FOR SELECT 
  USING (auth.uid() = initiator_id OR auth.uid() = receiver_id);

-- Documents policies
CREATE POLICY "Users can view own documents" ON documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own documents" ON documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own documents" ON documents FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_soul_files_user_id ON soul_files(user_id);
CREATE INDEX IF NOT EXISTS idx_soul_files_status ON soul_files(status);
CREATE INDEX IF NOT EXISTS idx_connections_user_a ON connections(user_a_id);
CREATE INDEX IF NOT EXISTS idx_connections_user_b ON connections(user_b_id);
CREATE INDEX IF NOT EXISTS idx_connections_status ON connections(status);
CREATE INDEX IF NOT EXISTS idx_simulations_connection ON simulations(connection_id);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
