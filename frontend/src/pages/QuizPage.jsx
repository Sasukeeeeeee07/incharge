import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Ladder from '../components/Ladder';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

const QuizPage = () => {
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentStep, setCurrentStep] = useState(5); // Start at step 5
  const [responses, setResponses] = useState([]);
  const [completed, setCompleted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    fetchQuiz();
  }, []);

  const fetchQuiz = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/quiz/active');
      setQuiz(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (answerType) => {
    const newResponses = [...responses, { 
      questionId: quiz.questions[currentQuestionIndex]._id, 
      answerType 
    }];
    setResponses(newResponses);

    // Update ladder
    if (answerType === 'In-Charge') {
      setCurrentStep(prev => Math.min(prev + 1, 10));
    } else {
      setCurrentStep(prev => Math.max(prev - 1, 1));
    }

    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      submitQuiz(newResponses);
    }
  };

  const submitQuiz = async (finalResponses) => {
    try {
      const res = await axios.post('http://localhost:5000/api/quiz/submit', {
        quizId: quiz._id,
        responses: finalResponses
      });
      setResult(res.data);
      setCompleted(true);
    } catch (err) {
      setError('Failed to submit quiz');
    }
  };

  if (loading) return <div style={{ textAlign: 'center', paddingTop: '100px' }}>Loading Quiz...</div>;
  if (error) return <div style={{ textAlign: 'center', paddingTop: '100px', color: 'var(--error)' }}>{error}</div>;
  if (completed) return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
          <button onClick={handleLogout} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <LogOut size={18} /> Logout
          </button>
      </div>
      <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>Result: {result.result}</h1>
      <p style={{ color: 'var(--text-secondary)' }}>Thank you for participating!</p>
      <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center' }}>
        <Ladder currentStep={currentStep} />
      </div>
    </div>
  );

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)' }}>
        <h2 style={{ fontSize: '1.2rem', color: 'var(--accent-primary)' }}>In-Charge OR In-Control</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Welcome, {user?.name}</span>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </header>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', flex: 1, padding: '40px', gap: '40px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass-card"
            style={{ padding: '40px' }}
          >
            <p style={{ color: 'var(--accent-primary)', marginBottom: '10px' }}>
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </p>
            <h2 style={{ fontSize: '2rem', marginBottom: '40px' }}>{currentQuestion.questionText}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {currentQuestion.options.map((option, idx) => (
                <button
                  key={idx}
                  className="btn-primary"
                  style={{ textAlign: 'left', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)' }}
                  onClick={() => handleAnswer(option.type)}
                >
                  {option.text}
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h3>Your Progress</h3>
        <Ladder currentStep={currentStep} />
      </div>
      </div>
    </div>
  );
};

export default QuizPage;
