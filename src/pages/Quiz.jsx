import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { modulesData } from '../data/modules.js';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { sendResultEmail } from '../services/emailService';
import Swal from 'sweetalert2';
import ModuleIcon from '../components/Icons';
import '../styles/Platform.css';

// Import all 8 Game Engines
import StandardQuiz from '../components/games/StandardQuiz';
import PasswordForge from '../components/games/PasswordForge';
import EmailInspector from '../components/games/EmailInspector';
import ChatSimulator from '../components/games/ChatSimulator';
import RapidFire from '../components/games/RapidFire';
import UrlInvestigator from '../components/games/UrlInvestigator';
import DragDropSorter from '../components/games/DragDropSorter';
import TimelineOrder from '../components/games/TimelineOrder';

const Quiz = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [moduleData, setModuleData] = useState(null);

  useEffect(() => {
    const found = modulesData.find(m => m.id === moduleId);
    if (found) {
      setModuleData(found);
    } else {
      navigate('/learning-path');
    }
  }, [moduleId, navigate]);

  if (!moduleData) return <div style={{color:'white'}}>Loading...</div>;

  // Global game completion handler that saves to Supabase
  const handleGameComplete = async (scorePercentage, passed) => {
    try {
      if (user) {
        // Log to Supabase!
        // We use score (out of 100) and total_questions as 100 to signify percentage in this schema
        const { error } = await supabase.from('user_progress').insert({
          user_id: user.id,
          module_id: moduleData.id,
          score: scorePercentage,
          total_questions: 100
        });
        
        if (error) console.error("Supabase Save Error:", error);
      }
    } catch (err) {
      console.error(err);
    }

    // Also update local storage fallback for immediate UI rendering
    if (passed) {
      let saved = JSON.parse(localStorage.getItem(`progress_${user?.id}`)) || [];
      if (!saved.includes(moduleData.id)) saved.push(moduleData.id);
      localStorage.setItem(`progress_${user?.id}`, JSON.stringify(saved));
    }

    // 3. Show Feedback Popup
    Swal.fire({
      iconHtml: passed
        ? '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
        : '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
      title: passed ? 'Module Certified' : 'Security Breach',
      html: `
        <div style="margin-top: 10px;">
          <div style="font-size: 24px; font-weight: bold; color: ${passed ? '#10b981' : '#f87171'}">${scorePercentage}% Correct</div>
          <p style="color: rgba(255,255,255,0.6); margin-top: 10px;">${passed ? 'Well done! Your awareness level is high.' : 'You were compromised. Review the material and try again.'}</p>
        </div>
      `,
      background: '#0a0a15',
      color: '#fff',
      showDenyButton: false,
      confirmButtonText: 'Continue',
      confirmButtonColor: '#6337ff',
      customClass: {
        popup: 'glass-popup',
        confirmButton: 'modern-swal-btn'
      }
    }).then(() => {
      navigate('/learning-path');
    });
  };

  // The Dispatcher Logic
  const renderGameEngine = () => {
    switch (moduleData.type) {
      case 'mcq':
        return <StandardQuiz data={moduleData} onComplete={handleGameComplete} />;
      case 'password-forge':
        return <PasswordForge data={moduleData} onComplete={handleGameComplete} />;
      case 'email-inspector':
        return <EmailInspector data={moduleData} onComplete={handleGameComplete} />;
      case 'chat-simulator':
        return <ChatSimulator data={moduleData} onComplete={handleGameComplete} />;
      case 'rapid-fire':
        return <RapidFire data={moduleData} onComplete={handleGameComplete} />;
      case 'url-investigator':
        return <UrlInvestigator data={moduleData} onComplete={handleGameComplete} />;
      case 'drag-drop-sort':
        return <DragDropSorter data={moduleData} onComplete={handleGameComplete} />;
      case 'timeline-order':
        return <TimelineOrder data={moduleData} onComplete={handleGameComplete} />;
      default:
        // Fallback to standard MCQ if undefined
        return <StandardQuiz data={moduleData} onComplete={handleGameComplete} />;
    }
  };

  return (
    <div className="quiz-container">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="quiz-header-icon">
            <ModuleIcon type={moduleData.type} size={28} color="#c084fc" />
          </div>
          <div>
            <h1 className="page-title">{moduleData.title}</h1>
            <p className="page-subtitle">{moduleData.description}</p>
          </div>
        </div>
      </div>
      
      {/* Dynamic Game Engine Mount Point */}
      <div className="game-mount-point" style={{ marginTop: '32px' }}>
        {renderGameEngine()}
      </div>
      
    </div>
  );
};

export default Quiz;
