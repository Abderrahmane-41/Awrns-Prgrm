import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchModules, fetchUserProgress } from '../lib/supabaseQuizApi';
import { useAuth } from '../context/AuthContext';

const QuizList = () => {
  const [modules, setModules] = useState([]);
  const [progresses, setProgresses] = useState({});
  const [loading, setLoading] = useState(true);
  const [isHoverBack, setIsHoverBack] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      try {
        const mods = await fetchModules();
        setModules(mods);

        if (user) {
          const progs = await fetchUserProgress(user.id);
          const progMap = {};
          for (const p of progs) {
            if (!progMap[p.module_id]) {
               progMap[p.module_id] = p;
            }
          }
          setProgresses(progMap);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#050510',
      fontFamily: 'Inter, sans-serif',
      color: '#fff',
      padding: '64px 24px',
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px' }}>
          <div>
            <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '8px' }}>Learning Modules</h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '16px' }}>Select a challenge or quiz to test your cybersecurity awareness.</p>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button 
              onClick={() => navigate('/scores')}
              style={{
                padding: '10px 20px',
                background: 'rgba(99,55,255,0.1)',
                border: '1px solid rgba(99,55,255,0.3)',
                borderRadius: '8px',
                color: '#a78bfa',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: '600',
                fontSize: '14px'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(99,55,255,0.2)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(99,55,255,0.1)';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                 <path d="M12 20v-6M6 20V10M18 20V4"></path>
              </svg>
              My Scores
            </button>
            <button 
              onClick={() => navigate('/dashboard')}
              onMouseEnter={() => setIsHoverBack(true)}
              onMouseLeave={() => setIsHoverBack(false)}
              style={{
                padding: '10px 20px',
                background: isHoverBack ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#fff',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span style={{ 
                display: 'inline-block', 
                transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                transform: isHoverBack ? 'translateX(-6px)' : 'translateX(0)'
              }}>←</span>
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.5)' }}>Loading modules...</div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            {modules.map(mod => {
              const userProg = progresses[mod.id];
              const isCompleted = !!userProg;
              const percentage = isCompleted ? Math.round((userProg.score / (userProg.total_questions || 1)) * 100) : 0;
              
              return (
              <div key={mod.id} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '16px',
                padding: '24px',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              onClick={() => navigate(`/quizzes/${mod.id}`)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{
                    display: 'inline-block',
                    background: mod.type === 'quiz' ? 'rgba(99,55,255,0.15)' : 'rgba(234,179,8,0.15)',
                    color: mod.type === 'quiz' ? '#a78bfa' : '#fef08a',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                  }}>
                    {mod.type}
                  </div>
                  {isCompleted && (
                    <div style={{ 
                      fontSize: '12px', 
                      fontWeight: '700', 
                      color: percentage >= 80 ? '#22c55e' : percentage >= 50 ? '#eab308' : '#ef4444',
                      background: percentage >= 80 ? 'rgba(34,197,94,0.1)' : percentage >= 50 ? 'rgba(234,179,8,0.1)' : 'rgba(239,68,68,0.1)',
                      padding: '4px 10px',
                      borderRadius: '12px'
                    }}>
                      ✓ {percentage}%
                    </div>
                  )}
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>{mod.title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', lineHeight: '1.6', flexGrow: 1 }}>{mod.description}</p>
                
                <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#a78bfa', fontSize: '14px', fontWeight: '500' }}>
                  <span>{isCompleted ? 'Retake Module' : 'Start Module'}</span>
                  <span>→</span>
                </div>
              </div>
            )})}
            
            {modules.length === 0 && (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.02)', borderRadius: '16px' }}>
                    No modules available yet. Please run the Supabase setup script.
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizList;
