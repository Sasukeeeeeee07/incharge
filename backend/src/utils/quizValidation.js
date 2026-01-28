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
const validateQuizStructure = (quizData) => {
  const { questions } = quizData;

  if (!questions || !Array.isArray(questions)) {
    return { isValid: false, error: 'Questions array is missing or invalid.' };
  }

  // Rule 1: Exactly 10 questions
  if (questions.length !== 10) {
    return { isValid: false, error: `Quiz must have exactly 10 questions. Found ${questions.length}.` };
  }

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];

    // Rule 2: Exactly 4 options
    if (!q.options || q.options.length !== 4) {
      return { isValid: false, error: `Question ${i + 1} must have exactly 4 options. Found ${q.options ? q.options.length : 0}.` };
    }

    let inChargeCount = 0;
    let inControlCount = 0;

    for (const opt of q.options) {
      if (opt.type === 'In-Charge') inChargeCount++;
      if (opt.type === 'In-Control') inControlCount++;
    }

    // Rule 3: Exactly 1 In-Charge option
    if (inChargeCount !== 1) {
      return { isValid: false, error: `Question ${i + 1} must have exactly 1 'In-Charge' option. Found ${inChargeCount}.` };
    }

    // Rule 4: Remaining 3 must be In-Control (Implicit check, but good to be explicit)
    if (inControlCount !== 3) {
      return { isValid: false, error: `Question ${i + 1} must have exactly 3 'In-Control' options. Found ${inControlCount}.` };
    }
  }

  return { isValid: true, error: null };
};

module.exports = { validateQuizStructure };
