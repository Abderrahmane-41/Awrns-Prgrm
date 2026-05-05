import React, { useState, useEffect } from 'react';

const RapidFire = ({ data, onComplete }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(5);
  const [score, setScore] = useState(0);

  const questions = [
    { text: 'A padlock icon guarantees a website is safe.', isTrue: false },
    { text: 'Macs are immune to viruses.', isTrue: false },
    { text: 'You should not use hotel Wi-Fi for banking.', isTrue: true },
    { text: 'IT will occasionally need your password to fix your computer.', isTrue: false }
  ];

  const currentQ = questions[currentIdx];

  useEffect(() => {
    if (currentIdx >= questions.length) return;
    
    // Timer Logic
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleAnswer(null); // Time out counts as wrong/skipped
          return 5;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentIdx]);

  const handleAnswer = (userSaidTrue) => {
    if (userSaidTrue !== null && userSaidTrue === currentQ.isTrue) {
      setScore(s => s + 1);
    }
    
    if (currentIdx + 1 >= questions.length) {
      // Game Over
      const finalScore = Math.round(((score + (userSaidTrue === currentQ.isTrue ? 1 : 0)) / questions.length) * 100);
      onComplete(finalScore, finalScore >= 75);
    } else {
      setCurrentIdx(i => i + 1);
      setTimeLeft(5);
    }
  };

  if (currentIdx >= questions.length) {
    return <div className="quiz-card" style={{ textAlign: 'center' }}><h2>Calculating...</h2></div>;
  }

  return (
    <div className="quiz-card" style={{ textAlign: 'center' }}>
      <h3 style={{ color: '#fbbf24', marginBottom: '8px' }}>Rapid Fire Security</h3>
      <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '32px' }}>Answer True or False before the timer runs out!</p>
      
      <div style={{ fontSize: '48px', fontWeight: 'bold', color: timeLeft <= 2 ? '#ef4444' : '#fff', transition: 'color 0.3s' }}>
        00:0{timeLeft}
      </div>
      
      <div style={{ background: 'rgba(255,255,255,0.05)', padding: '32px', borderRadius: '16px', margin: '32px 0', fontSize: '24px' }}>
        {currentQ.text}
      </div>

      <div style={{ display: 'flex', gap: '16px' }}>
        <button 
          onClick={() => handleAnswer(true)}
          style={{ flex: 1, padding: '24px', fontSize: '24px', background: 'rgba(16,185,129,0.2)', border: '2px solid #10b981', color: '#10b981', borderRadius: '12px', cursor: 'pointer' }}
        >
          TRUE
        </button>
        <button 
          onClick={() => handleAnswer(false)}
          style={{ flex: 1, padding: '24px', fontSize: '24px', background: 'rgba(239,68,68,0.2)', border: '2px solid #ef4444', color: '#ef4444', borderRadius: '12px', cursor: 'pointer' }}
        >
          FALSE
        </button>
      </div>
    </div>
  );
};
export default RapidFire;
