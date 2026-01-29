import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Ladder from '../components/Ladder';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, UserCircle } from 'lucide-react';

const QuizPage = () => {
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentStep, setCurrentStep] = useState(5); // Start at step 5
  const [responses, setResponses] = useState([]);
  const [completed, setCompleted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDetails, setShowDetails] = useState(false);
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
      const { quiz, alreadyAttempted, attempt } = res.data;
      
      setQuiz(quiz);

      if (alreadyAttempted) {
        setResult(attempt);
        setResponses(attempt.responses);
        setCompleted(true);
        
        // Calculate ladder position
        let step = 5;
        attempt.responses.forEach(r => {
          if (r.answerType === 'In-Charge') step = Math.min(step + 1, 10);
          else step = Math.max(step - 1, 1);
        });
        setCurrentStep(step);
      }
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

  if (loading) return <div className="text-center pt-24 text-text-secondary">Loading Quiz...</div>;
  if (error) return <div className="text-center pt-24 text-error">{error}</div>;
  if (completed) return (
    <div className="h-screen px-10 py-5 text-center flex flex-col overflow-hidden relative">
      <div className="flex justify-end">
          <button onClick={handleLogout} className="btn-secondary bg-transparent border-none text-text-secondary hover:text-white hover:bg-white/5">
            <LogOut size={18} /> Logout
          </button>
      </div>
      
      <div className="flex-1 flex flex-col justify-center items-center">
        <h1 className="text-6xl font-bold mb-4">Result: {result.result}</h1>
        <p className="text-text-secondary mb-8">Thank you for participating!</p>
        
        <button 
          onClick={() => setShowDetails(!showDetails)}
          className="btn-primary mb-8 text-sm"
        >
          {showDetails ? 'Hide Details' : 'See Detailed Results'}
        </button>

        {showDetails ? (
          <div className="glass-card w-full max-w-3xl max-h-[50vh] overflow-y-auto text-left p-0 mb-5">
            {quiz.questions.map((q, idx) => {
              const response = responses.find(r => r.questionId === q._id);
              // Find the option text that was selected
              const selectedOption = q.options.find(opt => opt.type === response?.answerType);
              return (
                <div key={idx} className="p-5 border-b border-glass-border flex justify-between items-center gap-5 hover:bg-white/[0.02]">
                  <div className="flex-1">
                    <p className="text-sm text-text-secondary mb-1">Question {idx + 1}</p>
                    <p className="font-medium">{q.questionText}</p>
                    <p className="text-sm mt-1 text-accent-primary">
                      Selected: "{selectedOption?.text}"
                    </p>
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-xs font-semibold text-center min-w-[100px] 
                    ${response?.answerType === 'In-Charge' 
                      ? 'bg-indigo-500/20 text-indigo-400' 
                      : 'bg-white/10 text-text-secondary'
                    }`}>
                    {response?.answerType}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-[60%] w-full flex justify-center">
            <Ladder currentStep={currentStep} />
          </div>
        )}
      </div>
    </div>
  );

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      <header className="px-10 py-5 flex justify-between items-center border-b border-glass-border bg-bg-secondary/50 backdrop-blur-md sticky top-0 z-40">
        <h2 className="text-xl font-bold text-accent-primary">In-Charge OR In-Control</h2>
        <div className="flex items-center gap-5">
          <span className="text-text-secondary hidden sm:inline">Welcome, {user?.name}</span>
          <button onClick={() => navigate('/profile')} className="flex items-center gap-2 text-text-secondary hover:text-white transition-colors">
            <UserCircle size={18} /> <span className="hidden sm:inline">Profile</span>
          </button>
          <button onClick={handleLogout} className="flex items-center gap-2 text-text-secondary hover:text-white transition-colors">
            <LogOut size={18} /> <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>
      
      <div className="flex-1 p-5 md:p-10 flex flex-col items-center gap-8 max-w-7xl mx-auto w-full">
        {/* Mobile Horizontal Ladder - Hidden on lg */}
        <div className="w-full lg:hidden mb-4">
          <p className="text-center text-xs font-bold text-text-secondary uppercase tracking-tighter mb-8 italic">Your Progress</p>
          <Ladder currentStep={currentStep} orientation="horizontal" />
        </div>

        <div className="w-full grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-center">
        <div className="flex flex-col justify-center max-w-2xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-card p-8 md:p-12 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-primary to-accent-secondary" />
              <p className="text-accent-primary font-bold mb-4 tracking-wider text-sm uppercase">
                Question {currentQuestionIndex + 1} of {quiz.questions.length}
              </p>
              <h2 className="text-2xl md:text-3xl font-bold mb-10 leading-tight">{currentQuestion.questionText}</h2>
              <div className="flex flex-col gap-4">
                {currentQuestion.options.map((option, idx) => (
                  <button
                    key={idx}
                    className="group p-5 rounded-xl border border-glass-border bg-bg-secondary/50 text-left hover:border-accent-primary/50 hover:bg-accent-primary/5 transition-all duration-200 active:scale-[0.99]"
                    onClick={() => handleAnswer(option.type)}
                  >
                    <span className="font-medium text-lg text-text-primary group-hover:text-white transition-colors">{option.text}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="hidden lg:flex flex-col items-center bg-bg-secondary/30 rounded-3xl p-8 border border-glass-border h-[600px]">
          <h3 className="text-lg font-bold mb-8 text-text-secondary">Your Progress</h3>
          <div className="flex-1 w-full flex justify-center">
            <Ladder currentStep={currentStep} />
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
