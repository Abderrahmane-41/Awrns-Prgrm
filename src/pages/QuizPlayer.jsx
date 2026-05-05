import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchModuleQuestions, submitQuizAttempt } from '../lib/supabaseQuizApi';
import { useAuth } from '../context/AuthContext';

const QuizPlayer = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Track answers: array of { question_id, selected_option_id, is_correct, points_awarded }
  const [answers, setAnswers] = useState([]);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  
  const [quizFinished, setQuizFinished] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const data = await fetchModuleQuestions(moduleId);
        setQuestions(data);
      } catch (error) {
        console.error("Error fetching questions:", error);
      } finally {
        setLoading(false);
      }
    };
    if (moduleId) loadQuestions();
  }, [moduleId]);

  const handleConfirm = () => {
    if (!selectedOptionId) return;

    if (!showFeedback) {
      setShowFeedback(true);
      return;
    }

    const currentQ = questions[currentQuestionIndex];
    const isCorrect = selectedOptionId === currentQ.correct_option_id;
    const points = isCorrect ? 1 : -1;
    
    const newAnswer = {
      question_id: currentQ.id,
      selected_option_id: selectedOptionId,
      is_correct: isCorrect,
      points_awarded: points
    };
    
    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);
    setSelectedOptionId(null);
    setShowFeedback(false);
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      finishQuiz(updatedAnswers);
    }
  };

  const finishQuiz = async (finalAnswers) => {
    setQuizFinished(true);
    setSubmitting(true);
    
    // Calculate final score purely for display before DB returns it
    let calcScore = finalAnswers.reduce((acc, curr) => acc + curr.points_awarded, 0);
    if (calcScore < 0) calcScore = 0;
    setFinalScore(calcScore);
    
    try {
      await submitQuizAttempt(user.id, moduleId, questions.length, finalAnswers);
    } catch (error) {
      console.error("Error submitting quiz:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ color: '#fff', textAlign: 'center', marginTop: '100px', fontFamily: 'Inter, sans-serif' }}>Loading Question...</div>;
  }

  if (questions.length === 0) {
    return (
     <div style={{ color: '#fff', textAlign: 'center', marginTop: '100px', fontFamily: 'Inter, sans-serif' }}>
       <h2>No questions found for this module.</h2>
       <button onClick={() => navigate('/quizzes')} style={{ padding: '10px 20px', background: 'rgba(99,55,255,0.2)', border: '1px solid #6337ff', color: '#fff', marginTop: '20px', borderRadius: '8px', cursor: 'pointer' }}>Back to Modules</button>
     </div>
    );
  }

  if (quizFinished) {
    return (
      <div style={{
        minHeight: '100vh', background: '#050510', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif'
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '48px', textAlign: 'center', maxWidth: '500px', width: '100%', backdropFilter: 'blur(20px)'
        }}>
          <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
              <path d="M4 22h16"></path>
              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
            </svg>
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '16px' }}>Module Completed!</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '32px' }}>You have successfully finished this challenge.</p>
          
          <div style={{
            background: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '24px', marginBottom: '32px', display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: '8px'
          }}>
            <span style={{ fontSize: '48px', fontWeight: '800', color: '#a78bfa' }}>{finalScore}</span>
            <span style={{ fontSize: '18px', color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>/ {questions.length} Points</span>
          </div>

          <button onClick={() => navigate('/quizzes')} style={{
            padding: '14px 32px', background: 'linear-gradient(135deg, #6337ff 0%, #4f46e5 100%)', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '16px', fontWeight: '600', cursor: 'pointer', width: '100%', transition: 'opacity 0.2s'
          }} onMouseEnter={e => e.target.style.opacity = 0.9} onMouseLeave={e => e.target.style.opacity = 1}>
            {submitting ? 'Saving Progress...' : 'Return to Modules'}
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestionIndex];
  
  let displayOptions = [];
  try {
    displayOptions = typeof currentQ.options === 'string' ? JSON.parse(currentQ.options) : currentQ.options;
  } catch (e) {
    console.error("Failed to parse options", e);
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#050510', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', padding: '24px'
    }}>
      <div style={{ width: '100%', maxWidth: '600px' }}>
        <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <button onClick={() => navigate('/quizzes')} style={{
            background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '14px'
          }}>Exit to Modules</button>
        </div>
        
        <h2 style={{ fontSize: '28px', lineHeight: '1.4', fontWeight: '700', marginBottom: '40px' }}>
          {currentQ.question_text || currentQ.text}
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {displayOptions.map((opt) => {
            const isSelected = selectedOptionId === opt.id;
            const isCorrectOption = showFeedback && opt.id === currentQ.correct_option_id;
            const isWrongOption = showFeedback && isSelected && opt.id !== currentQ.correct_option_id;
            
            let bg = isSelected ? 'rgba(99,55,255,0.2)' : 'rgba(255,255,255,0.03)';
            let border = isSelected ? '1px solid #6337ff' : '1px solid rgba(255,255,255,0.1)';
            
            if (isCorrectOption) {
              bg = 'rgba(34,197,94,0.2)';
              border = '1px solid #22c55e';
            } else if (isWrongOption) {
              bg = 'rgba(239,68,68,0.2)';
              border = '1px solid #ef4444';
            }

            return (
            <button
              key={opt.id}
              disabled={showFeedback}
              onClick={() => setSelectedOptionId(opt.id)}
              style={{
                width: '100%', textAlign: 'left', padding: '20px 24px', 
                background: bg, border: border,
                borderRadius: '12px', color: '#fff', fontSize: '16px', lineHeight: '1.5', cursor: showFeedback ? 'default' : 'pointer', transition: 'all 0.2s', display: 'flex', gap: '16px', alignItems: 'flex-start',
                boxShadow: isSelected && !showFeedback ? '0 0 15px rgba(99,55,255,0.2)' : 'none',
                transform: isSelected && !showFeedback ? 'translateX(4px)' : 'translateX(0)'
              }}
              onMouseEnter={e => {
                if (!isSelected && !showFeedback) {
                  e.currentTarget.style.background = 'rgba(99,55,255,0.1)';
                  e.currentTarget.style.borderColor = 'rgba(99,55,255,0.4)';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }
              }}
              onMouseLeave={e => {
                if (!isSelected && !showFeedback) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }
              }}
            >
              <div style={{
                background: isCorrectOption ? '#22c55e' : isWrongOption ? '#ef4444' : isSelected ? '#6337ff' : 'rgba(255,255,255,0.1)', flexShrink: 0, width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold'
              }}>
                {isCorrectOption ? '✓' : isWrongOption ? '✕' : opt.id.toUpperCase()}
              </div>
              <span style={{ paddingTop: '2px', flexGrow: 1 }}>{opt.text}</span>
            </button>
          )})}
        </div>

        <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            onClick={handleConfirm}
            disabled={!selectedOptionId}
            style={{
              padding: '16px 32px',
              background: selectedOptionId ? 'linear-gradient(135deg, #6337ff 0%, #4f46e5 100%)' : 'rgba(255,255,255,0.05)',
              border: 'none',
              borderRadius: '12px',
              color: selectedOptionId ? '#fff' : 'rgba(255,255,255,0.3)',
              fontSize: '16px',
              fontWeight: '600',
              cursor: selectedOptionId ? 'pointer' : 'not-allowed',
              transition: 'all 0.3s',
              boxShadow: selectedOptionId ? '0 4px 15px rgba(99, 55, 255, 0.4)' : 'none'
            }}
            onMouseEnter={e => {
                if (selectedOptionId) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(99, 55, 255, 0.5)';
                }
            }}
            onMouseLeave={e => {
                if (selectedOptionId) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(99, 55, 255, 0.4)';
                }
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              {!showFeedback ? (
                <>Check Answer</>
              ) : currentQuestionIndex < questions.length - 1 ? (
                <>
                  Next Question
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </>
              ) : (
                <>
                  Finish Module
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                </>
              )}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizPlayer;
