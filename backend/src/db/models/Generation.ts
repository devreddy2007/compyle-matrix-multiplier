import { query } from '../../config/database';

export interface Refinement {
  prompt: string;
  generated_code: Record<string, string>;
  created_at: string;
}

export interface Generation {
  id: string;
  user_id: string;
  initial_prompt: string;
  generated_code: Record<string, string>;
  frontend_framework: string;
  backend_framework: string;
  status: string;
  error_message: string | null;
  refinements: Refinement[];
  created_at: string;
  updated_at: string;
}

export const createGeneration = async (
  userId: string,
  initialPrompt: string,
  backendFramework: string
): Promise<Generation> => {
  const result = await query(
    `INSERT INTO generations (user_id, initial_prompt, generated_code, frontend_framework, backend_framework, status, refinements, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
     RETURNING *`,
    [userId, initialPrompt, '{}', 'react', backendFramework, 'in_progress', '[]']
  );
  return parseDatabaseGeneration(result.rows[0]);
};

export const getGenerationById = async (id: string, userId: string): Promise<Generation | null> => {
  const result = await query(
    'SELECT * FROM generations WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  if (result.rows.length === 0) return null;
  return parseDatabaseGeneration(result.rows[0]);
};

export const getUserGenerations = async (
  userId: string,
  limit: number = 20,
  offset: number = 0
): Promise<{ projects: Partial<Generation>[]; total: number }> => {
  const totalResult = await query('SELECT COUNT(*) FROM generations WHERE user_id = $1', [userId]);
  const total = parseInt(totalResult.rows[0].count);

  const result = await query(
    `SELECT id, initial_prompt, backend_framework, created_at FROM generations
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );
  return { projects: result.rows, total };
};

export const updateGenerationStatus = async (
  generationId: string,
  status: string,
  generatedCode?: Record<string, string>,
  errorMessage?: string
): Promise<Generation> => {
  const result = await query(
    `UPDATE generations
     SET status = $1, generated_code = COALESCE($2, generated_code), error_message = $3, updated_at = NOW()
     WHERE id = $4
     RETURNING *`,
    [status, generatedCode ? JSON.stringify(generatedCode) : null, errorMessage, generationId]
  );
  return parseDatabaseGeneration(result.rows[0]);
};

export const addRefinement = async (
  generationId: string,
  prompt: string,
  updatedCode: Record<string, string>
): Promise<Generation> => {
  const refinement = {
    prompt,
    generated_code: updatedCode,
    created_at: new Date().toISOString(),
  };

  const result = await query(
    `UPDATE generations
     SET refinements = refinements || $1::jsonb, generated_code = $2, updated_at = NOW()
     WHERE id = $3
     RETURNING *`,
    [JSON.stringify([refinement]), JSON.stringify(updatedCode), generationId]
  );
  return parseDatabaseGeneration(result.rows[0]);
};

const parseDatabaseGeneration = (row: any): Generation => {
  return {
    ...row,
    generated_code: typeof row.generated_code === 'string' ? JSON.parse(row.generated_code) : row.generated_code,
    refinements: typeof row.refinements === 'string' ? JSON.parse(row.refinements) : row.refinements,
  };
};
