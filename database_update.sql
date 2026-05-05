-- 1. Create a table for the News Articles
CREATE TABLE news_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  content TEXT NOT NULL,
  tag TEXT NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SETUP ROW LEVEL SECURITY (RLS)
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "News articles are viewable by authenticated users" ON news_articles FOR SELECT TO authenticated USING (true);

-- INSERT DUMMY DATA FOR NEWS
INSERT INTO news_articles (title, summary, content, tag) VALUES
('AI Voice Cloning Scams on the Rise', 'Cybercriminals are using AI to mimic the voices of executives to authorize fraudulent transfers.', 'Cybercriminals have adopted deepfake audio technology to spoof the voices of CEOs and executives. Always verify unusual wire transfer requests via a secondary, trusted communication channel.', 'SCAM'),
('Package Delivery SMS Phishing (Smishing)', 'A new wave of fake delivery texts is tricking users into revealing their credit card details.', 'Scammers send SMS messages claiming a package is stuck in transit and requires a small $1.50 fee. Once the tracking link is clicked, victims are taken to a fake login page that harvests their credentials and credit card information.', 'PHISHING'),
('Zero-Day Vulnerability in Popular Browser', 'Users are advised to patch their systems immediately to avoid silent drive-by compromise.', 'A new zero-day exploit has been found in the wild. Ensuring your browser is configured to auto-update is the number one defense against these attacks.', 'VULNERABILITY');


-- 2. Update the Modules table to allow 'password_challenge'
ALTER TABLE modules DROP CONSTRAINT IF EXISTS modules_type_check;
ALTER TABLE modules ADD CONSTRAINT modules_type_check CHECK (type IN ('quiz', 'challenge', 'password_challenge'));

-- 3. Insert the new Password Challenge module
-- Note: We don't need to insert into `questions` for this module, as the password challenge UI will handle the logic natively!
INSERT INTO modules (id, type, title, description) VALUES 
('f4b01021-0b1a-4d22-b5e1-5e921d2b7722', 'password_challenge', 'Mastering Password Entropy', 'Create an unbreakable password to pass this interactive vault challenge.');

-- =====================================================
-- 4. PLATFORM UPGRADE: Insert all 8 interactive modules
-- =====================================================

-- Expand the type constraint to support all new game types
ALTER TABLE modules DROP CONSTRAINT IF EXISTS modules_type_check;
ALTER TABLE modules ADD CONSTRAINT modules_type_check CHECK (type IN (
  'quiz', 'challenge', 'password_challenge',
  'email-inspector', 'password-forge', 'drag-drop-sort',
  'chat-simulator', 'timeline-order', 'url-investigator',
  'rapid-fire', 'mcq'
));

-- Insert the 6 missing modules (2 already exist from setup + earlier update)
INSERT INTO modules (id, type, title, description) VALUES
  ('33333333-3333-3333-3333-333333333333', 'drag-drop-sort', 'Data Classification Sorter', 'Quickly sort documents into Public or Confidential buckets.'),
  ('44444444-4444-4444-4444-444444444444', 'chat-simulator', 'SMS Smishing Simulator', 'Navigate a suspicious text conversation without giving up your data.'),
  ('55555555-5555-5555-5555-555555555555', 'timeline-order', 'Incident Response Timeline', 'Put the incident response steps in the correct order.'),
  ('66666666-6666-6666-6666-666666666666', 'url-investigator', 'URL Investigator', 'Hover to reveal the true URL and flag the malicious ones.'),
  ('77777777-7777-7777-7777-777777777777', 'rapid-fire', 'Rapid Fire Security', 'Fast paced True/False game with a countdown timer.'),
  ('88888888-8888-8888-8888-888888888888', 'mcq', 'Policy Compliance', 'Standard security policy multiple choice.')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 5. LEADERBOARD: Allow all authenticated users to read all progress (for leaderboard)
-- =====================================================
DROP POLICY IF EXISTS "Users can view their own progress" ON user_progress;
CREATE POLICY "All authenticated users can read progress for leaderboard"
  ON user_progress FOR SELECT TO authenticated
  USING (true);

-- =====================================================
-- 6. PROFILES TABLE: Store display names for leaderboard
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable by all authenticated users" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Auto-create a profile row when a user signs up (trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
