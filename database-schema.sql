
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  product VARCHAR(100) NOT NULL DEFAULT 'ppv_ticket',
  type VARCHAR(50) NOT NULL DEFAULT 'ticket',
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id SERIAL PRIMARY KEY,
  user_email VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stream_logs (
  id SERIAL PRIMARY KEY,
  user_email VARCHAR(255) NOT NULL,
  action VARCHAR(50) NOT NULL DEFAULT 'stream_access',
  status VARCHAR(50),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  checked_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vods (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  video_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trivia_questions (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  option_a VARCHAR(255) NOT NULL,
  option_b VARCHAR(255) NOT NULL,
  option_c VARCHAR(255) NOT NULL,
  option_d VARCHAR(255) NOT NULL,
  correct_option CHAR(1) NOT NULL CHECK (correct_option IN ('a', 'b', 'c', 'd')),
  coin_reward INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trivia_responses (
  id SERIAL PRIMARY KEY,
  question_id INTEGER REFERENCES trivia_questions(id),
  user_email VARCHAR(255) NOT NULL,
  selected_option CHAR(1) NOT NULL CHECK (selected_option IN ('a', 'b', 'c', 'd')),
  correct BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS coin_ledger (
  id SERIAL PRIMARY KEY,
  user_email VARCHAR(255) NOT NULL,
  coins INTEGER NOT NULL,
  note VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fan_uploads (
  id SERIAL PRIMARY KEY,
  file_id VARCHAR(255) NOT NULL,
  submitted_by VARCHAR(255) NOT NULL,
  caption TEXT,
  approved BOOLEAN DEFAULT FALSE,
  video_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE stream_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE vods ENABLE ROW LEVEL SECURITY;
ALTER TABLE trivia_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE trivia_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE coin_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE fan_uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read access" ON orders FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated read access" ON chat_messages FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated read access" ON stream_logs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated read access" ON vods FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated read access" ON trivia_questions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated read access" ON trivia_responses FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated read access" ON coin_ledger FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated read access" ON fan_uploads FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated insert" ON orders FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated insert" ON chat_messages FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated insert" ON stream_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated insert" ON trivia_responses FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated insert" ON fan_uploads FOR INSERT WITH CHECK (auth.role() = 'authenticated');
