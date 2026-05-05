import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const ChatSimulator = ({ data, onComplete }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    { sender: 'CEO_Boss', text: 'Hey, are you at your desk? I need an urgent favor.', isMe: false }
  ]);
  const [gameStage, setGameStage] = useState(0);

  const scenarioStages = [
    {
      choices: [
        { text: 'Yes, what do you need?', advance: true },
        { text: 'Who is this?', advance: true }
      ]
    },
    {
      incoming: 'I need you to buy $500 in Apple gift cards for a client presentation in 10 minutes. Send me the codes via text.',
      choices: [
        { text: 'I am on it, buying them now.', fail: true, explanation: 'Never agree to sudden financial requests over text!' },
        { text: 'I will call you on your office line to confirm.', success: true, explanation: 'Always verify through a different channel (out-of-band).' }
      ]
    }
  ];

  const handleChoice = (choice) => {
    setMessages(prev => [...prev, { sender: user.email, text: choice.text, isMe: true }]);

    if (choice.fail) {
      setTimeout(() => {
        setMessages(prev => [...prev, { sender: 'System', text: 'COMPROMISED: ' + choice.explanation, isMe: false, isSystem: true }]);
        setTimeout(() => onComplete(0, false), 3000);
      }, 1000);
      return;
    }

    if (choice.success) {
      setTimeout(() => {
        setMessages(prev => [...prev, { sender: 'System', text: 'DEFENDED: ' + choice.explanation, isMe: false, isSystem: true }]);
        setTimeout(() => onComplete(100, true), 3000);
      }, 1000);
      return;
    }

    if (choice.advance) {
      const nextStage = gameStage + 1;
      setGameStage(nextStage);
      if (scenarioStages[nextStage].incoming) {
        setTimeout(() => {
          setMessages(prev => [...prev, { sender: 'CEO_Boss', text: scenarioStages[nextStage].incoming, isMe: false }]);
        }, 1500);
      }
    }
  };

  const currentStageOptions = scenarioStages[gameStage]?.choices || [];
  const waitingForOpponent = messages[messages.length - 1].isMe;

  return (
    <div className="quiz-card" style={{ padding: '0', maxWidth: '500px', margin: '0 auto', background: '#000', overflow: 'hidden' }}>
      <div style={{ background: '#111', padding: '16px', textAlign: 'center', borderBottom: '1px solid #333' }}>
        <strong>Unknown Number</strong>
      </div>
      
      <div style={{ padding: '24px', height: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{
            alignSelf: msg.isSystem ? 'center' : (msg.isMe ? 'flex-end' : 'flex-start'),
            background: msg.isSystem ? (msg.text.startsWith('DEFENDED') ? '#10b981' : '#ef4444') : (msg.isMe ? '#3b82f6' : '#27272a'),
            color: '#fff',
            padding: '12px 16px',
            borderRadius: '16px',
            maxWidth: '80%',
            fontWeight: msg.isSystem ? 'bold' : 'normal',
            fontSize: '15px'
          }}>
            {msg.text}
          </div>
        ))}
        {waitingForOpponent && <div style={{ alignSelf: 'flex-start', color: '#666', fontSize: '12px' }}>Typing...</div>}
      </div>

      <div style={{ padding: '16px', background: '#111', borderTop: '1px solid #333' }}>
        {!waitingForOpponent && currentStageOptions.map((choice, idx) => (
          <button 
            key={idx}
            onClick={() => handleChoice(choice)}
            style={{ display: 'block', width: '100%', padding: '12px', background: '#27272a', color: '#fff', border: '1px solid #3f3f46', borderRadius: '8px', marginBottom: '8px', cursor: 'pointer', textAlign: 'left' }}
          >
            {choice.text}
          </button>
        ))}
      </div>
    </div>
  );
};
export default ChatSimulator;
