import React, { useState } from 'react';
import { X, Check, ArrowRight, AlertTriangle } from 'lucide-react';

const QuizImportModal = ({ isOpen, onClose, onImport }) => {
    const [text, setText] = useState('');
    const [parsedQuestions, setParsedQuestions] = useState([]);
    const [step, setStep] = useState(1); // 1: Input, 2: Review

    if (!isOpen) return null;

    const parseText = () => {
        if (!text.trim()) return;

        // Pre-process: Ensure options start on new lines
        // This handles cases where user pastes "A. Option...-0 B. Option..." on one line
        const formattedText = text.replace(/([A-D]\.)/g, '\n$1');

        const lines = formattedText.split('\n');
        const questions = [];
        let currentQuestion = null;

        lines.forEach(line => {
            const trimmedLine = line.trim();
            if (!trimmedLine) return;

            // Detect Question: Starts with number followed by dot
            const questionMatch = trimmedLine.match(/^\d+\.\s+(.+)/);
            if (questionMatch) {
                if (currentQuestion) {
                    questions.push(currentQuestion);
                }
                currentQuestion = {
                    questionText: questionMatch[1],
                    options: []
                };
            }
            // Detect Option: Starts with letter A-D followed by dot
            else if (currentQuestion && trimmedLine.match(/^[A-D]\.\s+/)) {
                // Extract text and score
                // Format: A. Text content-Score
                // Note: Score is at the end after a dash
                const lastDashIndex = trimmedLine.lastIndexOf('-');
                let optionText = trimmedLine;
                let score = 0;

                if (lastDashIndex !== -1) {
                    const scorePart = trimmedLine.substring(lastDashIndex + 1).trim();
                    if (!isNaN(scorePart)) {
                        score = parseInt(scorePart, 10);
                        // Remove score from text
                        optionText = trimmedLine.substring(0, lastDashIndex).trim();
                    }
                }

                // Clean option text (remove prefix A. B. etc)
                optionText = optionText.replace(/^[A-D]\.\s+/, '');

                // Map Score to Type
                // Logic: Score > 7 creates 'In-Charge', else 'In-Control'
                const type = score > 7 ? 'In-Charge' : 'In-Control';

                currentQuestion.options.push({
                    text: optionText,
                    answerType: type,
                    originalScore: score
                });
            }
        });

        if (currentQuestion) {
            questions.push(currentQuestion);
        }

        setParsedQuestions(questions);
        setStep(2);
    };

    const handleTypeChange = (qIdx, oIdx, newType) => {
        const updated = [...parsedQuestions];
        updated[qIdx].options[oIdx].answerType = newType;
        setParsedQuestions(updated);
    };

    const finalizeImport = () => {
        onImport(parsedQuestions);
        onClose();
        // Reset state
        setText('');
        setParsedQuestions([]);
        setStep(1);
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-5">
            <div className="glass-card w-full max-w-4xl max-h-[90vh] flex flex-col p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 text-text-secondary hover:text-white"
                >
                    <X size={24} />
                </button>

                <h2 className="text-2xl font-bold mb-2">Import Quiz Questions</h2>

                {step === 1 ? (
                    <div className="flex-1 flex flex-col min-h-0">
                        <p className="text-text-secondary mb-4 text-sm">
                            Paste your question text below. Ensure format:<br />
                            <code>1. Question Text...</code><br />
                            <code>A. Option Text...-Score</code>
                        </p>
                        <textarea
                            className="flex-1 input-base resize-none font-mono text-xs custom-scrollbar"
                            placeholder={`1. Question...
A. Option-0
B. Option-10...`}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                        />
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={parseText}
                                disabled={!text.trim()}
                                className="btn-primary"
                            >
                                Parse Questions <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col min-h-0">
                        <div className="flex justify-between items-center mb-4">
                            <div className="text-sm text-text-secondary">
                                Found {parsedQuestions.length} questions. Review mappings below.
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setStep(1)}
                                    className="btn-secondary py-2 px-4 text-xs"
                                >
                                    Back to Edit
                                </button>
                                <button
                                    onClick={finalizeImport}
                                    className="btn-primary py-2 px-4 text-xs"
                                >
                                    Confirm Import <Check size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
                            {parsedQuestions.map((q, qIdx) => (
                                <div key={qIdx} className="p-4 bg-white/5 rounded-xl border border-white/10">
                                    <p className="font-bold mb-2 text-sm">{qIdx + 1}. {q.questionText}</p>
                                    <div className="grid grid-cols-1 gap-2 pl-4">
                                        {q.options.map((opt, oIdx) => (
                                            <div key={oIdx} className="flex items-center gap-3 text-xs">
                                                <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center font-bold">
                                                    {String.fromCharCode(65 + oIdx)}
                                                </span>
                                                <div className="flex-1 flex justify-between items-center bg-black/20 p-2 rounded">
                                                    <span className="truncate mr-2" title={opt.text}>{opt.text}</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-white/30 text-[10px] w-6 text-center">({opt.originalScore})</span>
                                                        <select
                                                            value={opt.answerType}
                                                            onChange={(e) => handleTypeChange(qIdx, oIdx, e.target.value)}
                                                            className={`bg-transparent border border-white/20 rounded px-1 py-0.5 text-[10px] font-bold cursor-pointer outline-none focus:border-accent-primary
                                ${opt.answerType === 'In-Charge' ? 'text-green-400' : 'text-red-400'}
                              `}
                                                        >
                                                            <option value="In-Charge" className="bg-gray-900 text-green-400">In-Charge</option>
                                                            <option value="In-Control" className="bg-gray-900 text-red-400">In-Control</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuizImportModal;
