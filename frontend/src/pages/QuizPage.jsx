import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/apiConfig';
// Ladder component removed as replaced by RocketAnimation
import QuizHistory from '../components/QuizHistory';
import Speedometer from '../components/Speedometer';
import QuizResultView from '../components/QuizResultView';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, UserCircle, History, PlayCircle, Calendar, ChevronRight } from 'lucide-react';

import RoleToggle from '../components/RoleToggle';

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
  const { logout, user } = useAuth();
  const { languages, t, currentLanguage, setCurrentLanguage } = useLanguage();
  const navigate = useNavigate();
  const { width } = useWindowSize();
  const isMobile = width < 1024;

  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState([]);
  const [completed, setCompleted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [selectedAnswerType, setSelectedAnswerType] = useState(null); // Added State


  const [showMobileOverlay, setShowMobileOverlay] = useState(false); // New State

  // Audio refs for In-Control feedback
  const audioRef = React.useRef(null);
  const audioTimeoutRef = React.useRef(null);

  // Default to 'take-quiz' for a fresh experience
  const [view, setView] = useState('take-quiz');
  const [history, setHistory] = useState([]);
  const [selectedHistoryQuiz, setSelectedHistoryQuiz] = useState(null);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      if (audioTimeoutRef.current) {
        clearTimeout(audioTimeoutRef.current);
      }
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Persist state to sessionStorage
  // Save progress whenever key state changes
  /*
  useEffect(() => {
    if (quiz && !completed && responses.length > 0) {
      saveProgress();
    }
  }, [responses, currentQuestionIndex, currentLanguage]);

  const saveProgress = async () => {
    try {
      await axios.put(`${API_BASE_URL}/quiz/progress`, {
        quizId: quiz._id,
        responses,
        currentQuestionIndex,
        language: currentLanguage
      });
    } catch (err) {
      console.error('Failed to save progress', err);
    }
  };
  */

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // Parallel fetch today's quiz and history
      const [quizRes, historyRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/quiz/active`).catch(err => ({ status: 404 })),
        axios.get(`${API_BASE_URL}/quiz/history`).catch(err => ({ data: [] }))
      ]);

      setHistory(historyRes.data || []);

      if (quizRes.status === 200) {
        const { quiz: quizData, alreadyAttempted, attempt } = quizRes.data;
        setQuiz(quizData);

        if (alreadyAttempted) {
          // Completed previously
          setResult(attempt);
          setCompleted(true);
          setResponses(attempt.responses);
          setView('take-quiz'); // Show card with "View Results"
        } else if (attempt && attempt.status === 'started') {
          // Resuming an in-progress quiz
          setView('quiz');
          setResponses(attempt.responses || []);
          setCurrentQuestionIndex(attempt.currentQuestionIndex || 0);
          if (attempt.language) setCurrentLanguage(attempt.language);
        } else {
          // New active quiz, never started
          setView('take-quiz');
          setCurrentQuestionIndex(0);
          setResponses([]);
        }
      } else {
        // No quiz for today
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
      const res = await axios.get(`${API_BASE_URL}/quiz/history`);
      setHistory(res.data);
    } catch (err) {
      console.error('Failed to fetch history', err);
    }
  };



  const handleAnswer = (answerType) => {
    if (selectedAnswerType) return; // Block input during animation
    if (!answerType) {
      console.warn("handleAnswer called with missing answerType");
      return;
    }

    // Play Audio Feedback
    const audioMap = {
      'In-Charge': '/inchargeaudio.mpeg',
      'In-Control': '/incontrolaudio.mp3'
    };

    const audioFile = audioMap[answerType];

    if (audioFile) {
      try {
        // Stop any existing audio
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
        if (audioTimeoutRef.current) {
          clearTimeout(audioTimeoutRef.current);
        }

        // Initialize and play new audio
        const audio = new Audio(audioFile);
        audioRef.current = audio;

        audio.play().catch(err => console.error("Audio playback error:", err));

        // Stop after 5 seconds
        audioTimeoutRef.current = setTimeout(() => {
          audio.pause();
          audio.currentTime = 0;
        }, 5000);
      } catch (e) {
        console.error("Failed to setup audio:", e);
      }
    }

    const langKey = currentLanguage?.toLowerCase();

    const questions = (quiz.content && langKey && quiz.content[langKey])
      ? quiz.content[langKey].questions
      : (quiz.questions || []);

    if (questions.length === 0 || !questions[currentQuestionIndex]) return;

    // 1. Trigger Animation & Feedback
    setSelectedAnswerType(answerType);
    if (isMobile) {
      setShowMobileOverlay(true);
    }

    // 2. Save Response Immediately (but don't advance)
    const questionId = questions[currentQuestionIndex]._id;
    const existingResponseIndex = responses.findIndex(r => r.questionId === questionId);

    let newResponses;
    if (existingResponseIndex >= 0) {
      newResponses = [...responses];
      newResponses[existingResponseIndex] = { questionId, answerType };
    } else {
      newResponses = [...responses, { questionId, answerType }];
    }

    setResponses(newResponses);
  };

  const handleNext = () => {
    const langKey = currentLanguage?.toLowerCase();
    const questions = (quiz.content && langKey && quiz.content[langKey])
      ? quiz.content[langKey].questions
      : (quiz.questions || []);

    setShowMobileOverlay(false);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswerType(null); // Reset UI for next question
    } else {
      submitQuiz(responses);
    }
  };

  const submitQuiz = async (finalResponses) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/quiz/submit`, {
        quizId: quiz._id,
        responses: finalResponses,
        language: currentLanguage
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
      <div
        className="cursor-pointer flex items-center"
        onClick={() => {
          if (quiz) setView('take-quiz');
          else setView('history');
        }}
      >
        <img
          src="/smmart_Logo.png"
          alt="Smmart Logo"
          className="h-8 md:h-12 w-auto object-contain transition-transform hover:scale-105"
        />
      </div>


      <div className="flex items-center gap-2 md:gap-5">
        <span className="text-text-secondary hidden lg:inline">{t('welcome')}, {user?.name}</span>

        {quiz && (
          <button
            onClick={() => setView('take-quiz')}
            className={`flex items-center gap-2 px-3 py-5 rounded-lg transition-colors ${view === 'take-quiz' || (view === 'quiz' && !completed) ? 'bg-accent-primary/20 text-accent-primary' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}
          >
            <PlayCircle size={18} /> <span className="hidden sm:inline">{t('take_quiz')}</span>
          </button>
        )}

        <button
          onClick={() => setView('history')}
          className={`flex items-center gap-2 px-3 py-5 rounded-lg transition-colors ${view === 'history' || view === 'history-detail' ? 'bg-accent-primary/20 text-accent-primary' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}
        >
          <History size={18} /> <span className="hidden sm:inline">{t('quiz_history')}</span>
        </button>

        <button onClick={() => navigate('/profile')} className="flex items-center gap-2 px-3 py-5 rounded-lg transition-colors text-text-secondary hover:text-white hover:bg-white/5">
          <UserCircle size={18} /> <span className="hidden sm:inline">{t('profile')}</span>
        </button>

        <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-5 rounded-lg transition-colors text-text-secondary hover:text-white hover:bg-red-900">
          <LogOut size={18} /> <span className="hidden sm:inline">{t('logout')}</span>
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
        <button onClick={handleLogout} className="btn-secondary w-full">{t('logout')}</button>
      </div>
    </div>
  );

  // Language Selection Screen
  if (view === 'quiz' && !currentLanguage) {
    // Note: Actually currentLanguage has a default 'en' in Context, so this check might need adjustment or we let them choose if not started
    // But for now, let's assume if they clicked 'Start' we show language selection if we want to force explicit choice, 
    // OR we can rely on the default.
    // Let's force selection if we are in 'quiz' mode but haven't confirmed lang. 
    // BUT context sets 'en' by default. We might want a 'null' default in context or a separate 'confirmed' state.
    // For this migration, I'll allow the default 'en' but show the selection screen if they explicitly went to 'quiz' from 'take-quiz' and we want to offer choice.
    // A better approach: 'take-quiz' view -> Click Start -> Show 'Language Selection' View -> Click Lang -> Set Lang & View 'quiz'.
    // Let's keep it simple: matches original logic where 'selectedLang' was null.
  }

  // Adjusted Logic:
  // We use a local state for 'isLanguageSelected' to simulate the previous flow, or better:
  // If view is 'language-selection', show it.

  if (view === 'language-selection') {
    return (
      <div className="min-h-screen flex flex-col bg-bg-primary">
        {renderNavbar()}
        <div className="flex-1 flex flex-col items-center justify-center p-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-12 text-center max-w-2xl w-full"
          >
            <h1 className="text-4xl font-bold mb-4">{t('choose_language')}</h1>
            <p className="text-text-secondary mb-10">{t('select_lang_msg')}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {languages
                .filter(lang => {
                  // Only show languages that are available in the current quiz
                  if (!quiz) return true;

                  // Get available keys from quiz content or languages array
                  let availableKeys = quiz.languages || (quiz.content ? Object.keys(quiz.content) : []);

                  // NORMALIZATION: Map legacy full names to ISO codes to ensure matching works
                  // This handles cases where quiz data is old ('english') but system uses ('en')
                  const legacyMap = {
                    'english': 'en',
                    'hindi': 'hi',
                    'gujarati': 'gu',
                    'malayalam': 'ml'
                  };

                  const normalizedAvailable = availableKeys.map(k => legacyMap[k.toLowerCase()] || k.toLowerCase());

                  return normalizedAvailable.includes(lang.code.toLowerCase());
                })
                .map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setCurrentLanguage(lang.code);
                      setView('quiz');
                    }}
                    className="p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-accent-primary/10 hover:border-accent-primary/50 transition-all text-xl font-semibold active:scale-[0.98]"
                  >
                    {lang.nativeName}
                  </button>
                ))}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden relative">
      {/* Full Screen Rocket Background */}
      {renderNavbar()}

      {/* Dynamic Full Screen Background - Moved to Root Level */}
      <AnimatePresence>
        {view === 'quiz' && selectedAnswerType === 'In-Charge' && (
          <motion.div
            key="bg-charge"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 z-0 bg-black/5"
          >
            {/* Subtle overlay to ensure text readability */}
            <div className="absolute inset-0 bg-black/10 z-10" />
            <img
              src="/inchargeBackground.jpg"
              alt="In Charge Background"
              className="w-full h-full object-cover object-center"
            />
          </motion.div>
        )}
        {view === 'quiz' && selectedAnswerType === 'In-Control' && (
          <motion.div
            key="bg-control"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 z-0 bg-black/5"
          >
            <div className="absolute inset-0 bg-black/10 z-10" />
            <img
              src="/incontrolBackground.jpg"
              alt="In Control Background"
              className="w-full h-full object-cover object-right-top"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Interaction Overlay */}
      <AnimatePresence>
        {isMobile && showMobileOverlay && selectedAnswerType && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-4"
            onClick={handleNext}
          >
            <img
              src={selectedAnswerType === 'In-Charge' ? '/inCharge.png' : '/inControl.png'}
              alt={selectedAnswerType}
              className="max-w-full max-h-full object-contain"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 p-4 md:p-6 lg:pt-8 flex flex-col items-center max-w-7xl mx-auto w-full overflow-hidden justify-start relative z-10">

        {view === 'take-quiz' && quiz && (
          <div className="w-full">
            <h3 className="text-xl font-bold mb-6 text-blue-500 uppercase tracking-widest">{t('live_event')}</h3>
            <div className="flex flex-col md:flex-row pb-6 gap-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => {
                  if (completed) {
                    setView('result');
                    return;
                  }

                  // Go to language selection first
                  setView('language-selection');
                }}
                className="w-full md:max-w-[400px] glass-card p-8 cursor-pointer hover:border-blue-500/50 transition-all flex flex-col justify-between group relative overflow-hidden"
              >

                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-2 text-text-secondary text-sm">
                    <Calendar size={14} />
                    {new Date().toLocaleDateString()}
                  </div>
                  <div className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tighter bg-blue-500/20 text-blue-400">
                    {t('active')}
                  </div>
                </div>

                <h4 className="text-2xl font-bold mb-6 group-hover:text-blue-400 transition-colors">
                  {quiz.title || "Daily Assessment"}
                </h4>

                <div className="flex justify-between items-center mt-4">
                  <span className="text-xs text-text-secondary uppercase font-bold tracking-widest">
                    {completed ? t('view_results') : t('start_now')}
                  </span>
                  <div className="flex items-center gap-2 text-blue-500 group-hover:translate-x-2 transition-transform font-bold">
                    <span>{completed ? t('view') : t('go')}</span>
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
                &larr; {t('quiz_history')}
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
                totalSteps={0}
                currentStep={0}
              />
            </div>
          </div>
        )}

        {view === 'result' && result && (
          <QuizResultView
            result={result}
            responses={responses}
            quizData={quiz}
            selectedLang={currentLanguage}
            showDetails={showDetails}
            setShowDetails={setShowDetails}
            currentStep={0}
            totalSteps={0}
          />
        )}

        {view === 'quiz' && quiz && (
          <div className="w-full h-full flex flex-col lg:flex-row overflow-hidden relative z-10">


            {/* Content Column */}
            <div className={`w-full lg:w-1/2 flex flex-col justify-center items-center lg:items-start p-4 lg:p-10 lg:pl-20 overflow-y-auto transition-all duration-500 relative z-20`}>
              <div className="max-w-xl w-full">
                <AnimatePresence mode="wait">
                  {/* ... existing question rendering ... */}
                  {(() => {
                    const langKey = currentLanguage?.toLowerCase();
                    const questions = (quiz.content && langKey && quiz.content[langKey])
                      ? quiz.content[langKey].questions
                      : (quiz.questions || []);
                    const currentQuestion = questions[currentQuestionIndex];

                    if (!currentQuestion) {
                      return (
                        <div className="glass-card p-12 text-center w-full">
                          <p className="text-text-secondary mb-4">Questions could not be loaded.</p>
                          <button onClick={() => { setView('language-selection'); }} className="btn-secondary">Change Language</button>
                        </div>
                      );
                    }

                    return (
                      <motion.div
                        key={currentQuestionIndex}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="glass-card p-6 md:p-8 relative overflow-hidden backdrop-blur-xl bg-black/40 border-white/10"
                      >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-primary to-accent-secondary" />
                        <p className="text-accent-primary font-bold mb-4 tracking-wider text-sm uppercase">
                          {t('question')} {currentQuestionIndex + 1} {t('of')} {questions.length}
                        </p>
                        <h2 className="text-xl md:text-2xl font-bold mb-6 leading-tight">{currentQuestion.questionText}</h2>

                        <div className="flex flex-col gap-3 mb-6">
                          {currentQuestion.options.map((option, idx) => (
                            <button
                              key={idx}
                              className={`group p-4 rounded-xl border border-glass-border bg-bg-secondary/50 text-left transition-all duration-200 active:scale-[0.99]
                                    ${selectedAnswerType === option.answerType
                                  ? 'border-white/50 bg-white/10 ring-2 ring-white/20'
                                  : 'hover:border-accent-primary/10 hover:border-accent-primary/50'}
                                    `}
                              onClick={() => handleAnswer(option.answerType)}
                              disabled={!!selectedAnswerType}
                            >
                              <span className="font-medium text-base text-text-primary group-hover:text-white transition-colors">{option.text}</span>
                            </button>
                          ))}
                        </div>

                        {/* Animated Toggle Indicator with manual next */}
                        <RoleToggle role={selectedAnswerType} onNext={handleNext} />

                      </motion.div>
                    );
                  })()}
                </AnimatePresence>
              </div>
            </div>
          </div>
        )}

        {view === 'quiz' && !quiz && (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <h2 className="text-3xl font-bold mb-4">{t('no_quiz')}</h2>
            <p className="text-text-secondary mb-8">{t('come_back')}</p>
            <button onClick={() => setView('history')} className="btn-primary">{t('quiz_history')}</button>
          </div>
        )}
      </main>
    </div>
  );
};

export default QuizPage;

