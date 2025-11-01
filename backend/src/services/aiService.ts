import axios from 'axios';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

const SYSTEM_PROMPT = `You are a full-stack code generator. When given a user request, generate complete, production-ready code for:

Frontend: React 18 with TypeScript. Include:
- Login/register pages (forms with validation)
- Main app page
- Component structure
- API client using fetch
- Basic routing with React Router

Backend: [Node.js/Express OR Python/FastAPI]. Include:
- User authentication (JWT tokens)
- Password hashing with bcrypt
- Database models for User and core data
- CORS setup
- Error handling
- API endpoints matching frontend needs
- Environment variable usage

Database: PostgreSQL setup with migration files.

Return ONLY a valid JSON object where:
- Keys are file paths (e.g., "src/components/LoginForm.tsx", "backend/routes/auth.js")
- Values are complete file contents as strings
- Do NOT include node_modules, .git, or build artifacts
- Include .env.example with placeholder values

Example structure:
{
  "frontend/src/pages/LoginPage.tsx": "import React...",
  "frontend/package.json": "{...",
  "backend/src/routes/auth.ts": "import express...",
  "backend/package.json": "{...",
  "database/migrations/001_init.sql": "CREATE TABLE..."
}`;

export const generateCode = async (prompt: string, framework: string = 'node'): Promise<Record<string, string>> => {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  try {
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `Generate a ${framework} backend with this requirement: ${prompt}` },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const content = response.data.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error('Generated code was invalid. Please try again with a simpler prompt.');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('OpenAI API key is invalid');
    }
    if (error.message.includes('Generated code was invalid')) {
      throw error;
    }
    console.error('OpenAI API Error:', error.message);
    throw new Error('Code generation failed. Please try again.');
  }
};

export const refineCode = async (
  existingCode: Record<string, string>,
  prompt: string
): Promise<Record<string, string>> => {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  try {
    const codeString = JSON.stringify(existingCode, null, 2);
    const refinementPrompt = `Here is the currently generated full-stack application:

${codeString}

The user requests the following refinement:
"${prompt}"

Please update the affected files. Return the updated complete file structure as JSON (same format as before, with all files).`;

    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: refinementPrompt },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const content = response.data.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error('Refinement generated invalid code. Please try again with a simpler request.');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error: any) {
    if (error.message.includes('Refinement generated invalid code')) {
      throw error;
    }
    console.error('OpenAI Refinement Error:', error.message);
    throw new Error('Code refinement failed. Please try again.');
  }
};
