const https = require('https');
const { validateQuizStructure } = require('../utils/quizValidation');

// Mock data for fallback
const MOCK_QUIZ = {
  title: "Daily Balance Quiz (AI Generated)",
  description: "A AI-generated quiz to test your In-Charge vs In-Control status.",
  questions: Array.from({ length: 10 }, (_, i) => ({
    questionText: `Mock Question ${i + 1}: What would you do in situation X?`,
    options: [
      { text: "Take charge immediately", type: "In-Charge" },
      { text: "Wait and see", type: "In-Control" },
      { text: "Ask for help", type: "In-Control" },
      { text: "Ignore it", type: "In-Control" }
    ]
  }))
};

const SYSTEM_PROMPT = `
You are a Quiz Generator for the 'In-Charge vs In-Control' framework.
Generate a valid JSON object representing a quiz with exactly 10 questions.
Each question must have:
- 'questionText': string
- 'options': array of exactly 4 objects.
Each option object must have:
- 'text': string
- 'type': string, strictly either "In-Charge" or "In-Control".

RULES:
1. Exactly 10 questions.
2. Exactly 4 options per question.
3. EXACTLY ONE option must be "In-Charge".
4. EXACTLY THREE options must be "In-Control".
5. Output purely valid JSON, no markdown formatting.
`;

const generateQuizDraft = async () => {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.log("No OPENAI_API_KEY found. Using Mock AI Service.");
    return { ...MOCK_QUIZ, title: `Daily Balance Quiz (Mock AI) - ${new Date().toISOString().split('T')[0]}` };
  }

  try {
    const responseData = await callOpenAI(apiKey, SYSTEM_PROMPT);
    const quizData = parseAIResponse(responseData);
    
    // Validate
    const validation = validateQuizStructure(quizData);
    if (!validation.isValid) {
      throw new Error(`AI generated invalid quiz: ${validation.error}`);
    }

    // Shuffle options for randomness in DB/Admin View too
    quizData.questions.forEach(q => {
      for (let i = q.options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [q.options[i], q.options[j]] = [q.options[j], q.options[i]];
      }
    });

    return quizData;
  } catch (error) {
    console.error("AI Generation failed:", error.message);
    throw error;
  }
};

const callOpenAI = (apiKey, prompt) => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: "gpt-3.5-turbo", // or gpt-4
      messages: [{ role: "system", content: prompt }],
      temperature: 0.7
    });

    const options = {
      hostname: 'api.openai.com',
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const parsed = JSON.parse(body);
            resolve(parsed.choices[0].message.content);
          } catch (e) {
            reject(new Error("Failed to parse OpenAI response"));
          }
        } else {
          reject(new Error(`OpenAI API Error: ${res.statusCode} ${body}`));
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.write(data);
    req.end();
  });
};

const parseAIResponse = (content) => {
  // Strip markdown code blocks if present
  let cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
  try {
    return JSON.parse(cleanContent);
  } catch (e) {
    console.error("Failed to parse JSON from AI:", cleanContent);
    throw new Error("AI did not return valid JSON");
  }
};

module.exports = { generateQuizDraft };
