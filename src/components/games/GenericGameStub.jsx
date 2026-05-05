import React from 'react';

const GenericGameStub = ({ data, onComplete }) => {
  return (
    <div className="quiz-card" style={{ textAlign: 'center', padding: '40px' }}>
      <div style={{ fontSize: '64px', marginBottom: '20px' }}>{data.icon}</div>
      <h2 style={{ marginBottom: '16px' }}>{data.title} Engine Under Construction</h2>
      <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '32px' }}>
        This interactive module type (<strong>{data.type}</strong>) is currently being developed.
        <br/>For now, you can instantly pass to continue your learning path!
      </p>
      <button 
        className="quiz-next-btn" 
        style={{ width: '100%' }}
        onClick={() => onComplete(100, true)}
      >
        Simulate Win (Auto-Pass)
      </button>
    </div>
  );
};
export default GenericGameStub;
