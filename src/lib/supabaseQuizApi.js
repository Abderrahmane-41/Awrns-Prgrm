import { supabase } from './supabaseClient';

export const fetchModules = async () => {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('modules')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const fetchModuleQuestions = async (moduleId) => {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('module_id', moduleId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
};

export const fetchUserProgress = async (userId) => {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('user_progress')
    .select(`
      *,
      modules(title)
    `)
    .eq('user_id', userId)
    .order('completed_at', { ascending: false });
  if (error) throw error;
  return data;
};

/**
 * Submits a quiz attempt to the database.
 * @param {string} userId - The user's ID.
 * @param {string} moduleId - The module/quiz ID.
 * @param {number} totalQuestions - Total count of questions.
 * @param {Array} answers - Format: { question_id, selected_option_id, is_correct, points_awarded }
 */
export const submitQuizAttempt = async (userId, moduleId, totalQuestions, answers = [], overrideScore = null) => {
  if (!supabase) throw new Error('Supabase not configured');

  // Calculate score & enforce hard floor of 0
  let score = overrideScore !== null ? overrideScore : answers.reduce((acc, curr) => acc + curr.points_awarded, 0);
  if (score < 0) score = 0;

  // 1. Insert into user_progress
  const { data: progress, error: progressError } = await supabase
    .from('user_progress')
    .insert([
      {
        user_id: userId,
        module_id: moduleId,
        score: score,
        total_questions: totalQuestions
      }
    ])
    .select()
    .single();

  if (progressError) throw progressError;

  // 2. Insert into user_answers if available
  if (answers && answers.length > 0) {
    const answersToInsert = answers.map(ans => ({
      user_id: userId,
      progress_id: progress.id,
      question_id: ans.question_id,
      selected_option_id: ans.selected_option_id,
      is_correct: ans.is_correct,
      points_awarded: ans.points_awarded
    }));

    const { error: answersError } = await supabase
      .from('user_answers')
      .insert(answersToInsert);

    if (answersError) throw answersError;
  }

  return progress;
};
