-- Add the robust role-based access flag to user profiles.
-- By default everyone is a standard 'user'.
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- OPTIONAL: You can run this command directly to make yourself an admin right now!
-- Replace 'ur email / or name' with your actual name if you wish to do it via sql:
UPDATE public.user_profiles 
SET role = 'admin' 
WHERE full_name ILIKE '%mehdiHaddoud%';
