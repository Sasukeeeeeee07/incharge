import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/apiConfig';
import { Save, X, Trash2, Plus, Upload } from 'lucide-react';
import QuizImportModal from './QuizImportModal';

const QuizEditor = ({ quiz, onSave, onCancel, readOnly = false }) => {
  const [formData, setFormData] = useState({
    languages: ['en'],
    content: {
      en: { title: '', description: '', questions: [] }
    },
    activeDate: ''
  });
  const [activeLang, setActiveLang] = useState('en');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [importModalOpen, setImportModalOpen] = useState(false);

  // Updated to match database codes (ISO 639-1)
  const availableLanguages = [
    { id: 'en', label: 'English' },
    { id: 'hi', label: 'Hindi' },
    { id: 'gu', label: 'Gujarati' },
    { id: 'ml', label: 'Malayalam' }
  ];

  useEffect(() => {
    if (quiz) {
      // Map-based content comes as an object in JS
      let content = quiz.content || {
        en: {
          title: quiz.title,
          description: quiz.description,
          questions: quiz.questions
        }
      };

      // MIGRATION HELPER: If 'english' exists but 'en' does not, remap it.
      if (content.english && !content.en) {
        content.en = content.english;
        delete content.english;
      }
      // Also handle other legacy keys if necessary (hindi -> hi, etc.)
      const legacyMap = { 'hindi': 'hi', 'gujarati': 'gu', 'malayalam': 'ml' };
      Object.keys(legacyMap).forEach(legacyKey => {
        if (content[legacyKey] && !content[legacyMap[legacyKey]]) {
          content[legacyMap[legacyKey]] = content[legacyKey];
          delete content[legacyKey];
        }
      });

      const languages = Object.keys(content);

      setFormData({
        languages,
        content,
        activeDate: quiz.activeDate ? new Date(quiz.activeDate).toISOString().split('T')[0] : ''
      });
      setActiveLang(languages[0] || 'en');
    } else {
      setFormData({
        languages: ['en'],
        content: {
          en: {
            title: '',
            description: '',
            questions: Array.from({ length: 2 }, (_, i) => createEmptyQuestion(i))
          }
        },
        activeDate: ''
      });
    }
  }, [quiz]);

  const createEmptyQuestion = (index) => ({
    questionText: `Question ${index + 1}`,
    options: [
      { text: '', answerType: 'In-Charge' },
      { text: '', answerType: 'In-Control' },
      { text: '', answerType: 'In-Control' },
      { text: '', answerType: 'In-Control' }
    ]
  });

  const handleAddLanguage = (langId) => {
    if (formData.languages.includes(langId)) return;

    // Copy questions structure from English if it exists, otherwise empty
    const templateQuestions = formData.content.en
      ? formData.content.en.questions.map(q => ({
        ...q,
        questionText: '',
        options: q.options.map(o => ({ ...o, text: '' }))
      }))
      : Array.from({ length: 2 }, (_, i) => createEmptyQuestion(i));

    setFormData({
      ...formData,
      languages: [...formData.languages, langId],
      content: {
        ...formData.content,
        [langId]: {
          title: '',
          description: '',
          questions: templateQuestions
        }
      }
    });
    setActiveLang(langId);
  };

  const handleRemoveLanguage = (lang) => {
    if (readOnly) return;
    if (formData.languages.length <= 1) {
      alert("A quiz must have at least one language.");
      return;
    }
    if (!window.confirm(`Are you sure you want to delete the ${lang.toUpperCase()} version of this quiz?`)) return;

    const newLangs = formData.languages.filter(l => l !== lang);
    const newContent = { ...formData.content };
    delete newContent[lang];

    setFormData({
      ...formData,
      languages: newLangs,
      content: newContent
    });
    setActiveLang(newLangs[0]);
  };

  const handleAddQuestion = () => {
    if (readOnly) return;
    const updatedContent = { ...formData.content };

    // Add question to ALL languages to keep them in sync
    formData.languages.forEach(lang => {
      updatedContent[lang].questions = [
        ...updatedContent[lang].questions,
        createEmptyQuestion(updatedContent[lang].questions.length)
      ];
    });

    setFormData({ ...formData, content: updatedContent });
  };

  const handleRemoveQuestion = (idx) => {
    if (readOnly) return;
    if (formData.content[activeLang].questions.length <= 1) {
      alert("At least one question is required.");
      return;
    }

    const updatedContent = { ...formData.content };
    formData.languages.forEach(lang => {
      updatedContent[lang].questions = updatedContent[lang].questions.filter((_, i) => i !== idx);
    });

    setFormData({ ...formData, content: updatedContent });
  };

  const handleContentChange = (field, value) => {
    if (readOnly) return;
    setFormData({
      ...formData,
      content: {
        ...formData.content,
        [activeLang]: {
          ...formData.content[activeLang],
          [field]: value
        }
      }
    });
  };

  const handleQuestionChange = (idx, field, value) => {
    if (readOnly) return;
    const questions = [...formData.content[activeLang].questions];
    questions[idx][field] = value;
    handleContentChange('questions', questions);
  };

  const handleOptionChange = (qIdx, oIdx, field, value) => {
    if (readOnly) return;
    const questions = [...formData.content[activeLang].questions];
    const options = [...questions[qIdx].options];
    options[oIdx][field] = value;
    questions[qIdx].options = options;
    handleContentChange('questions', questions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (readOnly) {
      onCancel();
      return;
    }
    setError(null);

    // Basic Client validation
    for (const lang of formData.languages) {
      if (formData.content[lang].questions.length < 1) {
        setError(`Language ${lang} must have at least 1 question.`);
        return;
      }
    }

    try {
      setLoading(true);
      const payload = {
        languages: formData.languages,
        content: formData.content,
        activeDate: formData.activeDate
      };

      if (quiz && quiz._id) {
        await axios.put(`${API_BASE_URL}/admin/quizzes/${quiz._id}`, payload);
      } else {
        await axios.post(`${API_BASE_URL}/admin/quizzes`, payload);
      }
      onSave();
    } catch (err) {
      setError(err.response?.data?.error || 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  const currentContent = formData.content[activeLang] || { title: '', description: '', questions: [] };

  return (
    <div className="glass-card p-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h2 className="text-2xl font-bold">{readOnly ? 'View Quiz' : (quiz ? 'Edit Quiz' : 'Create New Quiz')}</h2>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white/5 px-4 py-2 rounded-xl border border-white/10">
            <span className="text-xs font-bold text-text-secondary mr-3 tracking-wider">ACTIVE LANGUAGE:</span>
            <select
              value={activeLang}
              onChange={(e) => setActiveLang(e.target.value)}
              className="bg-transparent text-sm font-bold text-orange-500 outline-none cursor-pointer focus:ring-0 mr-2"
            >
              {formData.languages.map(lang => (
                <option key={lang} value={lang} className="bg-bg-secondary">
                  {availableLanguages.find(l => l.id === lang)?.label || lang.toUpperCase()}
                </option>
              ))}
            </select>
            {!readOnly && (
              <button
                type="button"
                onClick={() => handleRemoveLanguage(activeLang)}
                className="text-text-secondary hover:text-error transition-colors ml-1 p-1"
                title="Delete this language version"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>



          {!readOnly && (
            <>
              <button
                type="button"
                onClick={() => setImportModalOpen(true)}
                className="btn-secondary py-2 px-4 text-xs font-bold flex items-center gap-2 hover:bg-orange-500/10 hover:text-orange-500 hover:border-orange-500/50 transition-all"
              >
                <Upload size={14} /> IMPORT
              </button>
              <button
                type="button"
                onClick={() => {
                  const name = prompt("Enter language name (e.g. Hindi, Spanish):");
                  if (name && name.trim()) {
                    const lowerName = name.trim().toLowerCase();
                    // Map common names to ISO codes
                    const codeMap = {
                      'hindi': 'hi',
                      'gujarati': 'gu',
                      'malayalam': 'ml',
                      'english': 'en',
                      'spanish': 'es',
                      'french': 'fr'
                    };
                    // Use mapped code or fallback to input
                    // Also check against availableLanguages labels if needed
                    const langCode = codeMap[lowerName] || lowerName;

                    handleAddLanguage(langCode);
                  }
                }}
                className="btn-secondary py-2 px-4 text-xs font-bold flex items-center gap-2 hover:bg-orange-500/10 hover:text-orange-500 hover:border-orange-500/50 transition-all"
              >
                <Plus size={14} /> ADD LANGUAGE
              </button>
            </>
          )}
        </div>
      </div>

      {/* Local Import Modal for Active Language */}
      <QuizImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImport={(questions) => {
          const updatedContent = { ...formData.content };
          updatedContent[activeLang] = {
            ...updatedContent[activeLang],
            questions: questions
          };
          // We might want to sync question count across languages or just allow per-lang divergence?
          // The current architecture seems to assume symmetric question counts for valid switching?
          // Actually createEmptyQuestion relies on index. 
          // If we import for one language, other languages might be out of sync.
          // Ideally, imports should probably set the structure for ALL languages if it's the first import,
          // or we just update the text for this language if structure matches?

          // For now, let's just update the current language's questions. 
          // If this causes length mismatch, the UI handles it by just mapping what exists.
          // But `handleAddQuestion` adds to ALL languages.
          // If we import 10 questions for English, Hindi still has 2.
          // We should probably resize other languages to match the length of the imported one?

          const newLength = questions.length;
          formData.languages.forEach(lang => {
            if (lang !== activeLang) {
              // Resize this language's questions array
              const currentQs = updatedContent[lang].questions;
              if (currentQs.length < newLength) {
                // Add empty questions
                const needed = newLength - currentQs.length;
                for (let i = 0; i < needed; i++) {
                  currentQs.push(createEmptyQuestion(currentQs.length));
                }
              } else if (currentQs.length > newLength) {
                // Trim
                updatedContent[lang].questions = currentQs.slice(0, newLength);
              }
            }
          });

          setFormData({ ...formData, content: updatedContent });
          setImportModalOpen(false);
        }}
      />

      {
        error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-error rounded-xl mb-6">
            {error}
          </div>
        )
      }

      <form onSubmit={handleSubmit}>
        <fieldset disabled={readOnly} className="border-none p-0 m-0 disabled:opacity-80">
          <div className="mb-6">
            <label className="block text-sm font-medium text-text-secondary mb-2">Quiz Title ({activeLang})</label>
            <input
              type="text"
              value={currentContent.title}
              onChange={(e) => handleContentChange('title', e.target.value)}
              required
              disabled={readOnly}
              className="input-base text-lg font-semibold"
              placeholder={`Enter title in ${availableLanguages.find(l => l.id === activeLang)?.label}...`}
            />
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium text-text-secondary mb-2">Description ({activeLang})</label>
            <textarea
              value={currentContent.description}
              onChange={(e) => handleContentChange('description', e.target.value)}
              rows="2"
              disabled={readOnly}
              className="input-base resize-y min-h-[80px]"
              placeholder={`Enter description in ${availableLanguages.find(l => l.id === activeLang)?.label}...`}
            />
          </div>

          <div className="mb-8 p-6 bg-white/[0.02] rounded-2xl border border-white/[0.08]">
            <label className="block text-sm font-medium text-text-secondary mb-2">Global Settings</label>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs text-text-secondary mb-1">Active Date (Optional)</label>
                <input
                  type="date"
                  value={formData.activeDate}
                  onChange={(e) => setFormData({ ...formData, activeDate: e.target.value })}
                  disabled={readOnly}
                  className="input-base max-w-xs"
                />
              </div>
              {!readOnly && (
                <p className="text-xs text-text-secondary">
                  Active date applies to all language versions. Use the 'Activate' button in the list to go live.
                </p>
              )}
            </div>
          </div>

          <h3 className="text-xl font-bold mb-4">Questions ({activeLang})</h3>
          <div className="flex flex-col gap-6">
            {currentContent.questions.map((q, qIdx) => (
              <div key={qIdx} className="p-6 bg-white/[0.02] rounded-2xl border border-white/[0.08]">
                <div className="flex gap-4 mb-4">
                  <span className="pt-3 font-bold text-orange-500">Q{qIdx + 1}.</span>
                  <input
                    type="text"
                    value={q.questionText}
                    onChange={(e) => handleQuestionChange(qIdx, 'questionText', e.target.value)}
                    placeholder={`Enter question in ${availableLanguages.find(l => l.id === activeLang)?.label}...`}
                    required
                    disabled={readOnly}
                    className="input-base flex-1"
                  />
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(qIdx)}
                      className="text-text-secondary hover:text-error transition-colors p-2"
                      title="Remove Question"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-0 sm:pl-10">
                  {q.options.map((opt, oIdx) => (
                    <div key={oIdx} className="flex flex-col gap-2">
                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) => handleOptionChange(qIdx, oIdx, 'text', e.target.value)}
                        placeholder={`Option ${oIdx + 1}`}
                        required
                        disabled={readOnly}
                        className="input-base text-sm"
                      />
                      <select
                        value={opt.answerType}
                        onChange={(e) => handleOptionChange(qIdx, oIdx, 'answerType', e.target.value)}
                        disabled={readOnly}
                        className="input-base text-xs py-2 h-auto cursor-pointer focus:ring-1 focus:ring-accent-primary"
                      >
                        <option value="In-Charge" className="bg-bg-secondary">In-Charge</option>
                        <option value="In-Control" className="bg-bg-secondary">In-Control</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {!readOnly && (
            <button
              type="button"
              onClick={handleAddQuestion}
              className="btn-secondary w-full mt-6 py-4 border-dashed border-2 border-white/10 hover:border-orange-500/50 text-orange-500 flex justify-center items-center gap-2"
            >
              <Plus size={20} />
              Add More Questions (All Languages)
            </button>
          )}
        </fieldset>

        <div className="mt-8 flex gap-4 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 rounded-xl border border-text-secondary/30 text-text-secondary hover:text-white hover:bg-white/5 transition-colors"
          >
            {readOnly ? 'Close' : 'Cancel'}
          </button>

          {!readOnly && (
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              <Save size={18} />
              {loading ? 'Saving...' : 'Save Quiz'}
            </button>
          )}
        </div>
      </form>
    </div >
  );
};

export default QuizEditor;
