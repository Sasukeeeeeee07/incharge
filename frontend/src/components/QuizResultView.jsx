import React from 'react';
import Speedometer from './Speedometer';
import { motion } from 'framer-motion';

const QuizResultView = ({ result, responses, quizData, selectedLang, showDetails, setShowDetails, currentStep, totalSteps, hideToggle = false }) => {
  const langKey = selectedLang?.toLowerCase();
  const questions = quizData.content?.[langKey]?.questions || quizData.questions || [];

  return (
    <div className="flex-1 flex flex-col justify-start items-center w-full py-2 pt-20 lg:pt-6 min-h-0">
      <h1 className="text-4xl md:text-5xl font-bold mb-1 lg:mb-2 text-center">Result: {result.result}</h1>
      <p className="text-text-secondary mb-3 lg:mb-6 text-sm md:text-base text-center">Thank you for participating!</p>

      {/* Toggle button - positioned right after thank you text */}
      {!hideToggle && (
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="btn-primary mb-4 lg:mb-8 text-xs py-2 px-4 whitespace-nowrap"
        >
          {showDetails ? 'Back to Result' : 'See Detailed Results'}
        </button>
      )}

      {/* Conditional rendering: either speedometer OR detailed results */}
      <div className="w-full flex-1 flex flex-col items-center justify-center lg:justify-start">
        {showDetails ? (
          /* Detailed results view */
          <div className="glass-card w-full max-w-3xl max-h-[50vh] overflow-y-auto text-left p-0 shadow-lg">
            {questions.map((q, idx) => {
              const response = responses.find(r => r.questionId === q._id);
              const selectedOption = q.options?.find(opt => opt.answerType === response?.answerType);
              return (
                <div key={idx} className="p-4 border-b border-glass-border flex justify-between items-center gap-4 hover:bg-white/[0.02]">
                  <div className="flex-1">
                    <p className="text-xs text-text-secondary mb-0.5">Question {idx + 1}</p>
                    <p className="font-medium text-sm md:text-base">{q.questionText}</p>
                    <p className="text-xs mt-0.5 text-accent-primary italic">
                      Selected: "{selectedOption?.text || 'N/A'}"
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold text-center min-w-[90px] 
                    ${response?.answerType === 'In-Charge'
                      ? 'bg-orange-500/20 text-orange-400'
                      : response?.answerType === 'In-Control'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-white/10 text-text-secondary'
                    }`}>
                    {response?.answerType}
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
