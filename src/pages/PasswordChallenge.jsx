import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { submitQuizAttempt } from '../lib/supabaseQuizApi';
import { useAuth } from '../context/AuthContext';

const PasswordChallenge = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [password, setPassword] = useState('');
  const [finished, setFinished] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Criteria checks
  const criteria = [
    { id: 'length', text: 'At least 12 characters', check: (pwd) => pwd.length >= 12 },
    { id: 'upper', text: 'Contains uppercase letter', check: (pwd) => /[A-Z]/.test(pwd) },
    { id: 'lower', text: 'Contains lowercase letter', check: (pwd) => /[a-z]/.test(pwd) },
    { id: 'number', text: 'Contains number', check: (pwd) => /[0-9]/.test(pwd) },
    { id: 'special', text: 'Contains special char', check: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd) },
  ];

  const totalPoints = criteria.length;
  const passedCriteria = criteria.filter(c => c.check(password));
  const score = passedCriteria.length;
  const isPerfect = score === totalPoints;
  const progressPercentage = (score / totalPoints) * 100;

  const handleFinish = async () => {
    if (!isPerfect) return;
    setSubmitting(true);

    try {
      // Empty answers because we aren't tracking individual MCQ questions
      await submitQuizAttempt(user.id, moduleId, 1, [], 1);
      setFinished(true);
    } catch (error) {
      console.error("Error submitting challenge:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (finished) {
    return (
      <div style={{ minHeight: '100vh', background: '#050510', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '48px', textAlign: 'center', maxWidth: '500px', width: '100%', backdropFilter: 'blur(20px)' }}>
          <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
               <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
               <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '16px' }}>Vault Unlocked!</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '32px' }}>You have successfully created an entropy-secure password.</p>
          <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '24px', marginBottom: '32px', display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '48px', fontWeight: '800', color: '#22c55e' }}>1</span>
            <span style={{ fontSize: '18px', color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>/ 1 Points</span>
          </div>
          <button onClick={() => navigate('/quizzes')} style={{ padding: '14px 32px', background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '16px', fontWeight: '600', cursor: 'pointer', width: '100%', transition: 'opacity 0.2s' }} onMouseEnter={e=>e.currentTarget.style.opacity='0.9'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
             Return to Modules
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#050510', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '600px', background: 'rgba(255,255,255,0.02)', padding: '40px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <h2 style={{ fontSize: '28px', lineHeight: '1.4', fontWeight: '800', marginBottom: '16px' }}>Password Entropy Challenge</h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', lineHeight: '1.6', marginBottom: '32px', fontSize: '15px' }}>
           To hack a 6-character lowercase password, it takes a computer 0.0001 seconds. To hack a highly entropic 12-character mixed password, it takes billions of years. Prove you can craft an unbreakable key.
        </p>

        <input 
           type="text" 
           value={password}
           onChange={(e) => setPassword(e.target.value)}
           placeholder="Begin typing to test entropy..."
           style={{
             width: '100%', padding: '20px 24px', fontSize: '20px', background: 'rgba(0,0,0,0.5)', border: `2px solid ${isPerfect ? '#22c55e' : 'rgba(255,255,255,0.2)'}`, borderRadius: '12px', color: '#fff', outline: 'none', transition: 'border-color 0.3s'
           }}
        />

        <div style={{ marginTop: '32px' }}>
           <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden', marginBottom: '24px' }}>
              <div style={{ height: '100%', width: `${progressPercentage}%`, background: isPerfect ? '#22c55e' : progressPercentage > 50 ? '#eab308' : '#ef4444', transition: 'all 0.4s ease' }} />
           </div>

           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {criteria.map((c) => {
                 const passed = c.check(password);
                 return (
                   <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: passed ? '#22c55e' : 'rgba(255,255,255,0.4)', transition: 'color 0.2s', fontSize: '15px' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                         {passed ? <path d="M20 6L9 17l-5-5"/> : <circle cx="12" cy="12" r="10" />}
                      </svg>
                      {c.text}
                   </div>
                 )
              })}
           </div>
        </div>

        <div style={{ marginTop: '48px', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
           <button onClick={() => navigate('/quizzes')} style={{ padding: '16px 32px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '600', fontSize: '16px' }}>Abort</button>
           
           <button 
             onClick={handleFinish}
             disabled={!isPerfect || submitting}
             style={{ padding: '16px 32px', background: isPerfect ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' : 'rgba(255,255,255,0.05)', color: isPerfect ? '#fff' : 'rgba(255,255,255,0.3)', border: 'none', borderRadius: '12px', cursor: isPerfect ? 'pointer' : 'not-allowed', fontWeight: '600', fontSize: '16px', transition: 'all 0.3s', display: 'flex', alignItems: 'center', gap: '8px' }}
           >
             {submitting ? 'Authenticating...' : 'Unlock Vault'}
           </button>
        </div>

      </div>
    </div>
  );
};
export default PasswordChallenge;
