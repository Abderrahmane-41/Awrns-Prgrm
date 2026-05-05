import { supabase } from './supabaseClient';

export const fetchNewsArticles = async () => {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('news_articles')
    .select('*')
    .order('published_at', { ascending: false });
  if (error) throw error;
  return data;
};
