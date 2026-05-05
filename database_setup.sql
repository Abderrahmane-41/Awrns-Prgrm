-- 1. Create a table for the content modules (quizzes or challenges)
CREATE TABLE modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('quiz', 'challenge')),
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create a table for the questions
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_option_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create a table to track user attempts and final score
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create a table to save each individual answer
CREATE TABLE user_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  progress_id UUID REFERENCES user_progress(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  selected_option_id TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  points_awarded INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SETUP ROW LEVEL SECURITY (RLS) FOR SECURE ACCESS FROM REACT
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Modules are viewable by authenticated users" ON modules FOR SELECT TO authenticated USING (true);

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Questions are viewable by authenticated users" ON questions FOR SELECT TO authenticated USING (true);

ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert their own progress" ON user_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own progress" ON user_progress FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own progress" ON user_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);

ALTER TABLE user_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can track their own answers" ON user_answers FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own answers" ON user_answers FOR SELECT TO authenticated USING (auth.uid() = user_id);


-- INSERT DUMMY DATA FOR OUR "PHISHING BASICS" QUIZ

-- First, insert the module and lock in its ID:
INSERT INTO modules (id, type, title, description) 
VALUES ('c3b03692-0b1a-4d22-b5e1-5e921d2b7711', 'quiz', 'Phishing Awareness Basics', 'Test your knowledge on identifying phishing emails and protecting your credentials.');

-- Insert Questions for the Quiz
INSERT INTO questions (module_id, question_text, options, correct_option_id) VALUES
('c3b03692-0b1a-4d22-b5e1-5e921d2b7711', 'Which of the following is a common red flag in a phishing email?', '[{"id": "a", "text": "The email comes from a known colleague."}, {"id": "b", "text": "A sense of extreme urgency or threats of account closure."}, {"id": "c", "text": "The email contains a standard corporate signature."}, {"id": "d", "text": "The email addresses you by your full name."}]', 'b'),
('c3b03692-0b1a-4d22-b5e1-5e921d2b7711', 'What should you do if you receive an email with a suspicious link?', '[{"id": "a", "text": "Click it to see where it leads but do not enter information."}, {"id": "b", "text": "Forward it to your entire team as a warning."}, {"id": "c", "text": "Hover over the link without clicking to check the destination URL."}, {"id": "d", "text": "Reply to the sender and ask if it is legitimate."}]', 'c'),
('c3b03692-0b1a-4d22-b5e1-5e921d2b7711', 'You receive an SMS from "IT Dept" asking you to reset your password via a provided link. What is this attack called?', '[{"id": "a", "text": "Vishing"}, {"id": "b", "text": "Spear Phishing"}, {"id": "c", "text": "Smishing"}, {"id": "d", "text": "Whaling"}]', 'c');
