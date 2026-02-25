import React from 'react';
import Speedometer from './Speedometer';
import { CheckCircle2, XCircle } from 'lucide-react';

const QuizResultView = ({ result, responses, quizData, selectedLang, showDetails, setShowDetails, currentStep, totalSteps, hideToggle = false }) => {
  const langKey = selectedLang?.toLowerCase();
  const questions = quizData.content?.[langKey]?.questions || quizData.questions || [];

  return (
    <div className="flex-1 flex flex-col justify-start items-center w-full py-2 pt-20 lg:pt-6 min-h-0">
      <h1 className="text-4xl md:text-5xl font-bold mb-1 lg:mb-2 text-center">Result: {result.result}</h1>


      {/* Toggle button */}
      {!hideToggle && (
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="btn-primary mb-4 lg:mb-8 text-xs py-2 px-4 whitespace-nowrap"
        >
          {showDetails ? 'Back to Result' : 'See Detailed Results'}
        </button>
      )}



      <div className="w-full flex-1 flex flex-col items-center justify-center lg:justify-start">
        {showDetails ? (
          /* Detailed results */
          <div className="glass-card w-full max-w-3xl max-h-[55vh] overflow-y-auto text-left p-0 shadow-lg">
            {questions.map((q, idx) => {
              const response = responses.find(r => r.questionId === q._id);
              const userAnswerType = response?.answerType;
              const isCorrect = userAnswerType === 'In-Charge';

              // The option the user selected
              const selectedOption = q.options?.find(opt => opt.answerType === userAnswerType);
              // The correct option is always In-Charge
              const correctOption = q.options?.find(opt => opt.answerType === 'In-Charge');

              return (
                <div key={idx} className="p-4 border-b border-glass-border hover:bg-white/[0.02]">
                  {/* Question */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="text-xs text-text-secondary mb-0.5">Question {idx + 1}</p>
                      <p className="font-medium text-sm md:text-base">{q.questionText}</p>
                    </div>
                    {/* Correct / Wrong badge */}
                    <div className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold text-center min-w-[70px]
                      ${isCorrect ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {isCorrect ? '✓ In-charge' : '✗ In-control'}
                    </div>
                  </div>

                  {/* Your answer */}
                  <div className="flex flex-col gap-2">
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm
                      ${isCorrect
                        ? 'bg-green-500/15 border border-green-500/40'
                        : 'bg-red-500/15 border border-red-500/40'
                      }`}>
                      {isCorrect
                        ? <CheckCircle2 size={14} className="shrink-0 text-green-400" />
                        : <XCircle size={14} className="shrink-0 text-red-400" />
                      }
                      <span className="text-xs text-text-secondary mr-1 shrink-0">Your answer:</span>
                      <span className="font-semibold text-xs">{selectedOption?.text || 'N/A'}</span>
                    </div>

                    {/* Show correct answer only if the user got it wrong */}
                    {!isCorrect && correctOption && (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-green-500/10 border border-green-500/30">
                        <CheckCircle2 size={14} className="shrink-0 text-green-400" />
                        <span className="text-xs text-text-secondary mr-1 shrink-0">Correct answer:</span>
                        <span className="font-semibold text-xs text-green-300">{correctOption.text}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Speedometer view */
          <div className="w-full max-w-4xl h-auto flex flex-col items-center justify-center pb-4">
            <Speedometer result={result.result} score={result.score} />
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizResultView;
