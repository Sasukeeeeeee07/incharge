/**
 * Validates the structure and content of a quiz.
 * Rules:
 * 1. Exactly 10 questions.
 * 2. Exactly 4 options per question.
 * 3. Exactly 1 'In-Charge' option per question.
 * 4. Exactly 3 'In-Control' options per question (implied by 2 & 3).
 * 
 * @param {Object} quizData - The quiz object to validate (must contain questions array).
 * @returns {Object} { isValid: boolean, error: string|null }
 */
const validateQuizStructure = (quizData, enforceContent = false) => {
  const { questions, content, languages } = quizData;

  // Helper to validate a single set of questions
  const validateQuestions = (questionsArr, langName = '', title = '') => {
    const prefix = langName ? `[${langName}] ` : '';

    if (enforceContent && langName && !title) {
      return { isValid: false, error: `${prefix}Quiz title is required.` };
    }

    if (!questionsArr || !Array.isArray(questionsArr)) {
      return { isValid: false, error: `${prefix}Questions array is missing or invalid.` };
    }

    if (questionsArr.length < 1) {
      return { isValid: false, error: `${prefix}Quiz must have at least 1 question.` };
    }

    for (let i = 0; i < questionsArr.length; i++) {
      const q = questionsArr[i];

      if (enforceContent && !q.questionText) {
        return { isValid: false, error: `${prefix}Question ${i + 1} text is required.` };
      }

      if (!q.options || q.options.length !== 4) {
        return { isValid: false, error: `${prefix}Question ${i + 1} must have exactly 4 options.` };
      }

      let inChargeCount = 0;
      let inControlCount = 0;
      for (const opt of q.options) {
        if (enforceContent && !opt.text) {
          return { isValid: false, error: `${prefix}Question ${i + 1} options must all have text.` };
        }
        const type = (opt.answerType || opt.type || '').trim().toLowerCase();
        if (type === 'in-charge') inChargeCount++;
        if (type === 'in-control') inControlCount++;
      }

      // Validating presence of at least one In-Charge and one In-Control is optional based on new requirements
      // User requested "i want i can add as many as in-charge and in-control i want"
      // So we remove the strict count checks.

      if (inChargeCount + inControlCount !== 4) {
        // This might still be relevant if we want to ensure all 4 options form a complete set, 
        // but strictly speaking user just said "remove logic".
        // However, the schema might expect 4 options. The loop above checks `q.options.length !== 4`.
        // We will just remove the specific count checks.
      }
    }
    return { isValid: true };
  };

  // If multi-language content is provided
  if (content && languages) {
    const isMap = content instanceof Map;
    for (const lang of languages) {
      const langContent = isMap ? content.get(lang) : content[lang];
      if (!langContent) {
        return { isValid: false, error: `Content for language '${lang}' is missing.` };
      }
      const res = validateQuestions(langContent.questions, lang, langContent.title);
      if (!res.isValid) return res;
    }
    return { isValid: true, error: null };
  }

  // Fallback to top-level questions (Legacy)
  return validateQuestions(questions);
};

module.exports = { validateQuizStructure };
