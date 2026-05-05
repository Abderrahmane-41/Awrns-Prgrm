import React, { useState } from 'react';

const TimelineOrder = ({ data, onComplete }) => {
  const [steps, setSteps] = useState([
    { id: 1, text: 'Call IT Security Team' },
    { id: 2, text: 'Wait for IT clearance before resuming work' },
    { id: 3, text: 'Disconnect the machine from the network' },
    { id: 4, text: 'Change all your passwords' },
  ]);

  const correctOrder = [3, 1, 4, 2];

  const moveUp = (index) => {
    if (index === 0) return;
    const newSteps = [...steps];
    [newSteps[index - 1], newSteps[index]] = [newSteps[index], newSteps[index - 1]];
    setSteps(newSteps);
  };

  const moveDown = (index) => {
    if (index === steps.length - 1) return;
    const newSteps = [...steps];
    [newSteps[index], newSteps[index + 1]] = [newSteps[index + 1], newSteps[index]];
    setSteps(newSteps);
  };

  const handleSubmit = () => {
    let correct = 0;
    steps.forEach((step, idx) => {
      if (step.id === correctOrder[idx]) correct++;
    });
    const score = Math.round((correct / steps.length) * 100);
    onComplete(score, score >= 75);
  };

  return (
    <div className="quiz-card">
      <h2 style={{ marginBottom: '8px' }}>Incident Response Timeline</h2>
      <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '32px' }}>
        You just got hit by ransomware! Arrange these steps in the correct order using the arrows.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
        {steps.map((step, idx) => (
          <div key={step.id} style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'rgba(99,55,255,0.2)', border: '1px solid #6337ff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 'bold', color: '#6337ff', flexShrink: 0
            }}>
              {idx + 1}
            </div>
            <span style={{ flex: 1, fontSize: '16px' }}>{step.text}</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <button
                onClick={() => moveUp(idx)}
                disabled={idx === 0}
                style={{
                  padding: '4px 10px', background: idx === 0 ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.1)',
                  border: 'none', borderRadius: '4px', color: idx === 0 ? '#555' : '#fff',
                  cursor: idx === 0 ? 'not-allowed' : 'pointer', fontSize: '14px'
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="18 15 12 9 6 15"/></svg>
              </button>
              <button
                onClick={() => moveDown(idx)}
                disabled={idx === steps.length - 1}
                style={{
                  padding: '4px 10px', background: idx === steps.length - 1 ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.1)',
                  border: 'none', borderRadius: '4px', color: idx === steps.length - 1 ? '#555' : '#fff',
                  cursor: idx === steps.length - 1 ? 'not-allowed' : 'pointer', fontSize: '14px'
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      <button className="quiz-next-btn" style={{ width: '100%' }} onClick={handleSubmit}>
        Submit Timeline
      </button>
    </div>
  );
};
export default TimelineOrder;
