// src/pages/ModuleDispatcher.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import QuizPlayer from './QuizPlayer';
import PasswordChallenge from './PasswordChallenge';

const ModuleDispatcher = () => {
  const { moduleId } = useParams();
  const [moduleType, setModuleType] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadModuleType = async () => {
      try {
        const { data, error } = await supabase
          .from('modules')
          .select('type')
          .eq('id', moduleId)
          .single();
        if (error) throw error;
        setModuleType(data.type);
      } catch (error) {
        console.error("Error fetching module type:", error);
      } finally {
        setLoading(false);
      }
    };
    if (moduleId) loadModuleType();
  }, [moduleId]);

  if (loading) {
    return <div style={{ color: '#fff', textAlign: 'center', marginTop: '100px', fontFamily: 'Inter, sans-serif' }}>Loading Module...</div>;
  }

  if (moduleType === 'quiz') {
    return <QuizPlayer />;
  } else if (moduleType === 'password_challenge') {
    return <PasswordChallenge />;
  }

  return (
    <div style={{ color: '#fff', textAlign: 'center', marginTop: '100px', fontFamily: 'Inter, sans-serif' }}>
       <h2>Unknown module type or challenge.</h2>
    </div>
  );
};

export default ModuleDispatcher;
