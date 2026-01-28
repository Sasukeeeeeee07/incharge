import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sparkles, Save, X, Trash2, Plus } from 'lucide-react';

const QuizEditor = ({ quiz, onSave, onCancel, readOnly = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    questions: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (quiz) {
      setFormData({
        title: quiz.title,
        description: quiz.description || '',
        activeDate: quiz.activeDate ? new Date(quiz.activeDate).toISOString().split('T')[0] : '',
        questions: quiz.questions || []
      });
    } else {
      setFormData({
        title: '',
        description: '',
        activeDate: '',
        questions: Array.from({ length: 10 }, (_, i) => createEmptyQuestion(i))
      });
    }
  }, [quiz]);

  const createEmptyQuestion = (index) => ({
    questionText: `Question ${index + 1}`,
    options: [
      { text: '', type: 'In-Charge' },
      { text: '', type: 'In-Control' },
      { text: '', type: 'In-Control' },
      { text: '', type: 'In-Control' }
    ]
  });

  const handleGenerateAI = async () => {
    if (readOnly) return;
    if (!window.confirm("This will overwrite current content with AI generated draft. Continue?")) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post('http://localhost:5000/api/admin/quizzes/generate-ai');
      const newQuiz = res.data;
      setFormData({
        title: newQuiz.title,
        description: newQuiz.description,
        questions: newQuiz.questions
      });
      alert('AI Quiz Generated! You can now review and edit.');
    } catch (err) {
      setError("AI Generation failed: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionChange = (idx, field, value) => {
    if (readOnly) return;
    const updated = [...formData.questions];
    updated[idx][field] = value;
    setFormData({ ...formData, questions: updated });
  };

  const handleOptionChange = (qIdx, oIdx, field, value) => {
    if (readOnly) return;
    const updatedQuestions = [...formData.questions];
    const updatedOptions = [...updatedQuestions[qIdx].options];
    updatedOptions[oIdx][field] = value;
    updatedQuestions[qIdx].options = updatedOptions;
    setFormData({ ...formData, questions: updatedQuestions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (readOnly) {
        onCancel();
        return;
    }
    setError(null);

    // Basic Client validation logic
    if (formData.questions.length !== 10) {
      setError("Must have exactly 10 questions.");
      return;
    }

    try {
      setLoading(true);
      if (quiz) {
        // Update
        await axios.put(`http://localhost:5000/api/admin/quizzes/${quiz._id}`, formData);
      } else {
        // Create
        await axios.post('http://localhost:5000/api/admin/quizzes', formData);
      }
      onSave(); // Close editor
    } catch (err) {
      setError(err.response?.data?.error || 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card" style={{ padding: '30px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>{readOnly ? 'View Quiz' : (quiz ? 'Edit Quiz' : 'Create New Quiz')}</h2>
        {!quiz && !readOnly && (
          <button 
            type="button" 
            onClick={handleGenerateAI} 
            className="btn-secondary"
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none' }}
          >
            <Sparkles size={18} />
            {loading ? 'Generating...' : 'Generate with AI'}
          </button>
        )}
      </div>

      {error && (
        <div style={{ padding: '10px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', borderRadius: '8px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <fieldset disabled={readOnly} style={{ border: 'none', padding: 0, margin: 0 }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px' }}>Quiz Title</label>
          <input 
            type="text" 
            value={formData.title} 
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
            disabled={readOnly}
          />
        </div>

        <div style={{ marginBottom: '30px' }}>
          <label style={{ display: 'block', marginBottom: '8px' }}>Description</label>
          <textarea 
            value={formData.description} 
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            rows="2"
            disabled={readOnly}
          />
        </div>

        <div style={{ marginBottom: '30px' }}>
          <label style={{ display: 'block', marginBottom: '8px' }}>Active Date (Optional)</label>
          <input 
            type="date" 
            value={formData.activeDate} 
            onChange={(e) => setFormData({...formData, activeDate: e.target.value})}
            style={{ width: '100%', maxWidth: '300px' }}
            disabled={readOnly}
          />
          {!readOnly && (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '5px' }}>
                Setting a date here plans the quiz but does not activate it. Use the 'Activate' button in the list to go live.
              </p>
          )}
        </div>

        <h3>Questions (10 Required)</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '15px' }}>
          {formData.questions.map((q, qIdx) => (
            <div key={qIdx} style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                <span style={{ paddingTop: '10px', fontWeight: 'bold' }}>Q{qIdx + 1}.</span>
                <input 
                  type="text" 
                  value={q.questionText}
                  onChange={(e) => handleQuestionChange(qIdx, 'questionText', e.target.value)}
                  placeholder="Enter question text..."
                  required
                  style={{ flex: 1 }}
                  disabled={readOnly}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', paddingLeft: '30px' }}>
                {q.options.map((opt, oIdx) => (
                  <div key={oIdx} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <input 
                      type="text"
                      value={opt.text}
                      onChange={(e) => handleOptionChange(qIdx, oIdx, 'text', e.target.value)}
                      placeholder={`Option ${oIdx + 1}`}
                      required
                      disabled={readOnly}
                    />
                    <select 
                      value={opt.type}
                      onChange={(e) => handleOptionChange(qIdx, oIdx, 'type', e.target.value)}
                      style={{ 
                          padding: '5px', 
                          borderRadius: '6px', 
                          background: readOnly ? 'rgba(255,255,255,0.05)' : 'black', 
                          color: 'white', 
                          border: '1px solid var(--glass-border)',
                          cursor: readOnly ? 'not-allowed' : 'pointer',
                          opacity: readOnly ? 0.7 : 1
                      }}
                      disabled={readOnly}
                    >  <option value="In-Charge">In-Charge</option>
                      <option value="In-Control">In-Control</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        </fieldset>

        <div style={{ marginTop: '30px', display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
          <button 
            type="button" 
            onClick={onCancel}
            style={{ padding: '10px 20px', borderRadius: '8px', background: 'transparent', border: '1px solid var(--text-secondary)', color: 'var(--text-secondary)', cursor: 'pointer' }}
          >
            {readOnly ? 'Close' : 'Cancel'}
          </button>
          
          {!readOnly && (
              <button 
                type="submit" 
                disabled={loading}
                className="btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Save size={18} />
                {loading ? 'Saving...' : 'Save Quiz'}
              </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default QuizEditor;
