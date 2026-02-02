import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, ChevronRight } from 'lucide-react';

const QuizHistory = ({ history, onSelectQuiz }) => {
  if (!history || history.length === 0) {
    return (
      <div className="text-center p-10 glass-card">
        <p className="text-text-secondary">No quiz history available yet.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h3 className="text-xl font-bold mb-6 text-orange-500 uppercase tracking-widest">Quiz History</h3>
      <div className="flex flex-col md:flex-row md:overflow-x-auto pb-6 gap-6 md:scrollbar-hide snap-y md:snap-x">
        {history.map((item, idx) => (
            <motion.div
                key={item._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => onSelectQuiz(item)}
                className="w-full md:max-w-[400px] glass-card p-8 cursor-pointer hover:border-blue-500/50 transition-all flex flex-col justify-between group relative overflow-hidden"
            >
                <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-text-secondary text-sm">
                            <Calendar size={14} />
                            {new Date(item.date).toLocaleDateString()}
                        </div>
                        {item.language && (
                            <div className="text-[10px] text-orange-500 uppercase tracking-tighter font-bold">
                                Language: {item.language}
                            </div>
                        )}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tighter
                        ${item.result === 'In-Charge' ? 'bg-orange-500/20 text-orange-400' : 
                          item.result === 'In-Control' ? 'bg-blue-500/20 text-blue-400' : 
                          'bg-white/10 text-text-secondary'}
                    `}>
                        {item.result}
                    </div>
                </div>
                
                <h4 className="text-xl font-bold mb-4 group-hover:text-accent-primary transition-colors line-clamp-2">
                    {item.quizTitle}
                </h4>
                
                <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-text-secondary uppercase font-bold tracking-widest">View Details</span>
                    <ChevronRight size={18} className="text-orange-500 group-hover:translate-x-1 transition-transform" />
                </div>
            </motion.div>
        ))}
      </div>
    </div>
  );
};

export default QuizHistory;
