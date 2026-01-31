import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Ladder from '../components/Ladder';
import QuizHistory from '../components/QuizHistory';
import Speedometer from '../components/Speedometer';
import QuizResultView from '../components/QuizResultView';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, UserCircle, History, PlayCircle, Calendar, ChevronRight } from 'lucide-react';

const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

const QuizPage = () => {
  // State Initialization from sessionStorage
  const getSavedState = (key, defaultValue) => {
    const saved = sessionStorage.getItem(`quiz_${key}`);
    try { return saved ? JSON.parse(saved) : defaultValue; }
    catch { return defaultValue; }
  };

  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const { width } = useWindowSize();
  const isMobile = width < 1024;

  // Track if we are restoring state from a previous navigation
  const isRestored = React.useRef(sessionStorage.getItem('quiz_view') !== null);

  const [quiz, setQuiz] = useState(null);
  const [selectedLang, setSelectedLang] = useState(getSavedState('selectedLang', null));
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(getSavedState('currentIndex', 0));
  const [currentStep, setCurrentStep] = useState(getSavedState('currentStep', 5)); 
  const [responses, setResponses] = useState(getSavedState('responses', []));
  const [completed, setCompleted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDetails, setShowDetails] = useState(getSavedState('showDetails', false));
  
  // Default to 'take-quiz' for a fresh experience
  const [view, setView] = useState(getSavedState('view', 'take-quiz')); 
  const [history, setHistory] = useState([]);
  const [selectedHistoryQuiz, setSelectedHistoryQuiz] = useState(getSavedState('selectedHistoryQuiz', null));

  const languageLabels = {
    english: 'English',
    hindi: 'Hindi',
    gujarati: 'Gujarati',
    malayalam: 'Malayalam'
  };

  const handleLogout = () => {
    sessionStorage.clear();
    logout();
    navigate('/login');
  };

  // Persist state to sessionStorage
  useEffect(() => {
    const stateToSave = {
      selectedLang,
      currentIndex: currentQuestionIndex,
      currentStep,
      responses,
      showDetails,
      view,
      selectedHistoryQuiz
    };
    Object.entries(stateToSave).forEach(([key, value]) => {
      sessionStorage.setItem(`quiz_${key}`, JSON.stringify(value));
    });
  }, [selectedLang, currentQuestionIndex, currentStep, responses, showDetails, view, selectedHistoryQuiz]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // Parallel fetch today's quiz and history
      const [quizRes, historyRes] = await Promise.all([
        axios.get('http://localhost:5000/api/quiz/active').catch(err => ({ status: 404 })),
        axios.get('http://localhost:5000/api/quiz/history').catch(err => ({ data: [] }))
      ]);

      setHistory(historyRes.data || []);

      if (quizRes.status === 200) {
        const { quiz: quizData, alreadyAttempted, attempt } = quizRes.data;
        setQuiz(quizData);
        
        if (alreadyAttempted) {
          setResult(attempt);
          setCompleted(true);
          
          // Only auto-navigate to history if we're NOT restoring a specific view (like results or a specific question)
          if (!isRestored.current) {
            setResponses(attempt.responses);
            setView('take-quiz');
            const lang = (quizData.languages && quizData.languages.length > 0) ? quizData.languages[0] : 'english';
            setSelectedLang(lang);
            const questions = quizData.content?.[lang]?.questions || quizData.questions || [];
            calculateStep(attempt.responses, questions.length);
          }
        } else if (!isRestored.current) {
            // Fresh login, no saved view: definitely show the card first
            setView('take-quiz');
            setSelectedLang(null);
            setCurrentQuestionIndex(0);
            setResponses([]);
        }
      } else if (!isRestored.current) {
        // No quiz for today, auto-open history if no restored state
        setView('history');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to initialize');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/quiz/history');
      setHistory(res.data);
    } catch (err) {
      console.error('Failed to fetch history', err);
    }
  };

  const calculateStep = (responses, questionsCount) => {
    let step = questionsCount + 1;
    const maxStep = 2 * questionsCount + 1;
    responses.forEach(r => {
      if (r.answerType === 'In-Charge') step = Math.min(step + 1, maxStep);
      else step = Math.max(step - 1, 1);
    });
    setCurrentStep(step);
  };

  const handleAnswer = (answerType) => {
    const langKey = selectedLang?.toLowerCase();
    const questions = quiz.content?.[langKey]?.questions || quiz.questions;
    const maxStep = 2 * questions.length + 1;
    const newResponses = [...responses, { 
      questionId: questions[currentQuestionIndex]._id, 
      answerType 
    }];
    setResponses(newResponses);

    if (answerType === 'In-Charge') {
      setCurrentStep(prev => Math.min(prev + 1, maxStep));
    } else {
      setCurrentStep(prev => Math.max(prev - 1, 1));
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      submitQuiz(newResponses);
    }
  };

  const submitQuiz = async (finalResponses) => {
    try {
      const res = await axios.post('http://localhost:5000/api/quiz/submit', {
        quizId: quiz._id,
        responses: finalResponses,
        language: selectedLang
      });
      setResult(res.data);
      setCompleted(true);
      setView('result');
      fetchHistory(); // Refresh history after submission
    } catch (err) {
      setError('Failed to submit quiz');
    }
  };

  const handleSelectHistoryQuiz = (attempt) => {
    setSelectedHistoryQuiz(attempt);
    setShowDetails(false); // Start with speedometer view
    setView('history-detail');
  };

  const renderNavbar = () => (
    <header className="px-4 md:px-10 py-3 md:py-5 flex justify-between items-center border-b border-blue-200/10 bg-blue-900/50 backdrop-blur-md sticky top-0 z-40">
      <h2 
  className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold uppercase tracking-widest cursor-pointer 
              flex flex-col sm:flex-row md:flex-row items-center gap-0 sm:gap-1 md:gap-2" 
  onClick={() => {
    if (quiz) setView('take-quiz');
    else setView('history');
  }}
>
  <span className="text-center leading-tight">In-Charge</span> 
  <span className="px-0 sm:px-1 md:px-3 text-white text-center text-xs sm:text-sm md:text-base">OR</span> 
  <span className="text-center leading-tight text-orange-500">In-Control</span>
</h2>


      <div className="flex items-center gap-2 md:gap-5">
        <span className="text-text-secondary hidden lg:inline">Welcome, {user?.name}</span>
        
        {quiz && (
          <button 
            onClick={() => setView('take-quiz')} 
            className={`flex items-center gap-2 px-3 py-5 rounded-lg transition-colors ${view === 'take-quiz' || (view === 'quiz' && !completed) ? 'bg-accent-primary/20 text-accent-primary' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}
          >
            <PlayCircle size={18} /> <span className="hidden sm:inline">Take Quiz</span>
          </button>
        )}

        <button 
          onClick={() => setView('history')} 
          className={`flex items-center gap-2 px-3 py-5 rounded-lg transition-colors ${view === 'history' || view === 'history-detail' ? 'bg-accent-primary/20 text-accent-primary' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}
        >
          <History size={18} /> <span className="hidden sm:inline">Quiz History</span>
        </button>

        <button onClick={() => navigate('/profile')} className="flex items-center gap-2 px-3 py-5 rounded-lg transition-colors text-text-secondary hover:text-white hover:bg-white/5">
          <UserCircle size={18} /> <span className="hidden sm:inline">Profile</span>
        </button>
        
        <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-5 rounded-lg transition-colors text-text-secondary hover:text-white hover:bg-white/5">
          <LogOut size={18} /> <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );

  if (loading) return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center text-text-secondary animate-pulse">Loading Your Journey...</div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-10 bg-bg-primary">
       <div className="glass-card p-10 text-center max-w-md">
         <p className="text-error mb-6 text-lg font-medium">{error}</p>
         <button onClick={handleLogout} className="btn-secondary w-full">Logout</button>
       </div>
    </div>
  );

  // Language Selection Screen
  if (view === 'quiz' && !selectedLang && quiz?.languages?.length > 1) {
    return (
      <div className="min-h-screen flex flex-col bg-bg-primary">
        {renderNavbar()}
        <div className="flex-1 flex flex-col items-center justify-center p-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-12 text-center max-w-2xl w-full"
          >
            <h1 className="text-4xl font-bold mb-4">Choose Your Language</h1>
            <p className="text-text-secondary mb-10">Select a language to start the daily quiz</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quiz.languages.map(lang => (
                <button
                  key={lang}
                  onClick={() => {
                    setSelectedLang(lang);
                    const questions = quiz.content?.[lang.toLowerCase()]?.questions || quiz.questions || [];
                    setCurrentStep(questions.length + 1);
                  }}
                  className="p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-accent-primary/10 hover:border-accent-primary/50 transition-all text-xl font-semibold active:scale-[0.98]"
                >
                  {languageLabels[lang] || lang}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-bg-primary overflow-hidden">
      {renderNavbar()}
      
      <main className="flex-1 p-4 md:p-6 lg:pt-8 flex flex-col items-center max-w-7xl mx-auto w-full overflow-hidden justify-start">
        
        {view === 'take-quiz' && quiz && (
          <div className="w-full">
            <h3 className="text-xl font-bold mb-6 text-blue-500 uppercase tracking-widest">Today's Quiz</h3>
            <div className="flex flex-col md:flex-row pb-6 gap-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => {
                  if (completed) {
                    setView('result');
                    return;
                  }
                  
                  if (quiz.languages && quiz.languages.length === 1) {
                    const lang = quiz.languages[0];
                    setSelectedLang(lang);
                    const questions = quiz.content?.[lang]?.questions || quiz.questions || [];
                    setCurrentStep(questions.length + 1);
                    setView('quiz');
                  } else if (!quiz.languages || quiz.languages.length === 0) {
                    setSelectedLang('english');
                    const questions = quiz.questions || [];
                    setCurrentStep(questions.length + 1);
                    setView('quiz');
                  } else {
                    setView('quiz'); // Will trigger language selection
                  }
                }}
                className="w-full md:max-w-[400px] glass-card p-8 cursor-pointer hover:border-blue-500/50 transition-all flex flex-col justify-between group relative overflow-hidden"
              >

                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-2 text-text-secondary text-sm">
                    <Calendar size={14} />
                    {new Date().toLocaleDateString()}
                  </div>
                  <div className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tighter bg-blue-500/20 text-blue-400">
                    Active
                  </div>
                </div>

                <h4 className="text-2xl font-bold mb-6 group-hover:text-blue-400 transition-colors">
                  {quiz.title || "Daily Assessment"}
                </h4>

                <div className="flex justify-between items-center mt-4">
                  <span className="text-xs text-text-secondary uppercase font-bold tracking-widest">
                    {completed ? 'View Results' : 'Start Now'}
                  </span>
                  <div className="flex items-center gap-2 text-blue-500 group-hover:translate-x-2 transition-transform font-bold">
                    <span>{completed ? 'VIEW' : 'GO'}</span>
                    <ChevronRight size={20} />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {view === 'history' && (
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="w-full flex-1 overflow-y-auto mt-4 px-2"
            >
                <QuizHistory history={history} onSelectQuiz={handleSelectHistoryQuiz} />
            </motion.div>
        )}
 
        {view === 'history-detail' && selectedHistoryQuiz && (
            <div className="w-full flex-1 flex flex-col items-center overflow-hidden relative">
                <div className="absolute top-0 left-0 z-10">
                    <button 
                        onClick={() => setView('history')}
                        className="text-orange-500 hover:bg-orange-500/10 px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors"
                    >
                         &larr; Back to History
                    </button>
                </div>
                <div className="w-full flex-1 flex flex-col items-center pt-14 lg:pt-0">
                    <QuizResultView 
                        result={{ result: selectedHistoryQuiz.result }}
                    responses={selectedHistoryQuiz.responses}
                    quizData={{ 
                        content: selectedHistoryQuiz.quizContent,
                        questions: selectedHistoryQuiz.quizQuestions
                    }}
                    selectedLang={selectedHistoryQuiz.language || Object.keys(selectedHistoryQuiz.quizContent || {})[0] || 'english'}
                    showDetails={showDetails}
                    setShowDetails={setShowDetails}
                    hideToggle={false}
                    totalSteps={(() => {
                        const langKey = (selectedHistoryQuiz.language || 'english').toLowerCase();
                        const questions = selectedHistoryQuiz.quizContent?.[langKey]?.questions || selectedHistoryQuiz.quizQuestions || [];
                        return 2 * questions.length + 1;
                    })()}
                    currentStep={(() => {
                        const langKey = (selectedHistoryQuiz.language || 'english').toLowerCase();
                        const questions = selectedHistoryQuiz.quizContent?.[langKey]?.questions || selectedHistoryQuiz.quizQuestions || [];
                        const qCount = questions.length;
                        let step = qCount + 1;
                        const maxS = 2 * qCount + 1;
                        selectedHistoryQuiz.responses.forEach(r => {
                            if (r.answerType === 'In-Charge') step = Math.min(step + 1, maxS);
                            else step = Math.max(step - 1, 1);
                        });
                        return step;
                    })()}
                />
                </div>
            </div>
        )}

        {view === 'result' && result && (
            <QuizResultView 
                result={result}
                responses={responses}
                quizData={quiz}
                selectedLang={selectedLang}
                showDetails={showDetails}
                setShowDetails={setShowDetails}
                currentStep={currentStep}
                totalSteps={2 * (quiz.content?.[selectedLang?.toLowerCase()]?.questions?.length || quiz.questions?.length || 0) + 1}
            />
        )}

        {view === 'quiz' && quiz && (
            <div className="w-full flex flex-col lg:grid lg:grid-cols-[1fr_300px] gap-8 items-stretch mt-4">
                {/* Mobile Ladder */}
                <div className="w-full lg:hidden mb-4">
                  <Ladder 
                      currentStep={currentStep} 
                      totalSteps={2 * (quiz.content?.[selectedLang?.toLowerCase()]?.questions?.length || quiz.questions?.length || 0) + 1}
                      orientation="horizontal"
                  />
                </div>

                <div className="flex flex-col justify-center max-w-2xl mx-auto w-full">
                    <AnimatePresence mode="wait">
                        {/* ... existing question rendering ... */}
                        {(() => {
                            const langKey = selectedLang?.toLowerCase();
                            const questions = quiz.content?.[langKey]?.questions || quiz.questions;
                            const currentQuestion = questions[currentQuestionIndex];
                            return (
                                <motion.div
                                    key={currentQuestionIndex}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="glass-card p-8 md:p-12 relative overflow-hidden"
                                >
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-primary to-accent-secondary" />
                                    <p className="text-accent-primary font-bold mb-4 tracking-wider text-sm uppercase">
                                        Question {currentQuestionIndex + 1} of {questions.length}
                                    </p>
                                    <h2 className="text-2xl md:text-3xl font-bold mb-10 leading-tight">{currentQuestion.questionText}</h2>
                                    <div className="flex flex-col gap-4">
                                        {currentQuestion.options.map((option, idx) => (
                                            <button
                                                key={idx}
                                                className="group p-5 rounded-xl border border-glass-border bg-bg-secondary/50 text-left hover:border-accent-primary/10 hover:border-accent-primary/50 transition-all duration-200 active:scale-[0.99]"
                                                onClick={() => handleAnswer(option.type)}
                                            >
                                                <span className="font-medium text-lg text-text-primary group-hover:text-white transition-colors">{option.text}</span>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            );
                        })()}
                    </AnimatePresence>
                </div>

                {/* PC Ladder */}
                <div className="hidden lg:flex flex-col items-center bg-bg-secondary/30 rounded-3xl p-8 border border-glass-border overflow-hidden">
                    <h3 className="text-lg font-bold mb-8 text-text-secondary">Climb Leadership Ladder</h3>
                    <div className="flex-1 w-full flex justify-center overflow-y-auto scrollbar-hide">
                        <Ladder 
                            currentStep={currentStep} 
                            totalSteps={2 * (quiz.content?.[selectedLang?.toLowerCase()]?.questions?.length || quiz.questions?.length || 0) + 1}
                            orientation="vertical"
                        />
                    </div>
                </div>
            </div>
        )}

        {view === 'quiz' && !quiz && (
             <div className="flex-1 flex flex-col items-center justify-center text-center">
                <h2 className="text-3xl font-bold mb-4">No Quiz for Today</h2>
                <p className="text-text-secondary mb-8">Come back tomorrow for a new challenge!</p>
                <button onClick={() => setView('history')} className="btn-primary">View My History</button>
             </div>
        )}
      </main>
    </div>
  );
};

export default QuizPage;

