import express, { Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import {
  createGeneration,
  getGenerationById,
  getUserGenerations,
  updateGenerationStatus,
  addRefinement,
} from '../db/models/Generation';
import { generateCode, refineCode } from '../services/aiService';
import { validateFileStructure } from '../services/codeParsingService';
import archiver from 'archiver';

const router = express.Router();

// POST /api/generations - Create new generation
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { prompt, backend_framework = 'node' } = req.body;
    const userId = req.userId!;

    if (!prompt) {
      return res.status(400).json({ success: false, error: 'Prompt is required' });
    }

    // Create generation record with in_progress status
    const generation = await createGeneration(userId, prompt, backend_framework);

    // Generate code asynchronously
    (async () => {
      try {
        const generatedCode = await generateCode(prompt, backend_framework);

        // Validate structure
        const validation = validateFileStructure(generatedCode);
        if (!validation.valid) {
          await updateGenerationStatus(generation.id, 'error', {}, validation.errors.join('; '));
          return;
        }

        // Save successful generation
        await updateGenerationStatus(generation.id, 'success', generatedCode);
      } catch (error: any) {
        await updateGenerationStatus(generation.id, 'error', {}, error.message || 'Generation failed');
      }
    })();

    res.status(201).json({
      success: true,
      id: generation.id,
      initial_prompt: generation.initial_prompt,
      status: 'in_progress',
      created_at: generation.created_at,
    });
  } catch (error: any) {
    console.error('Generation error:', error);
    res.status(500).json({ success: false, error: 'Failed to create generation' });
  }
});

// GET /api/generations - List user's projects
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const { projects, total } = await getUserGenerations(userId, limit, offset);

    res.json({
      success: true,
      projects,
      total,
    });
  } catch (error: any) {
    console.error('List generations error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch projects' });
  }
});

// GET /api/generations/:id - Get single project
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const generation = await getGenerationById(id, userId);
    if (!generation) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    res.json({
      success: true,
      ...generation,
    });
  } catch (error: any) {
    console.error('Get generation error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch project' });
  }
});

// POST /api/generations/:id/refine - Refine code
router.post('/:id/refine', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { prompt } = req.body;
    const userId = req.userId!;

    if (!prompt) {
      return res.status(400).json({ success: false, error: 'Refinement prompt is required' });
    }

    const generation = await getGenerationById(id, userId);
    if (!generation) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    try {
      const refinedCode = await refineCode(generation.generated_code, prompt);

      // Validate structure
      const validation = validateFileStructure(refinedCode);
      if (!validation.valid) {
        return res.status(500).json({
          success: false,
          error: 'Refinement generated invalid code. ' + validation.errors.join('; '),
        });
      }

      // Add refinement to generation
      const updated = await addRefinement(id, prompt, refinedCode);

      res.json({
        success: true,
        generated_code: updated.generated_code,
        refinements: updated.refinements,
        updated_at: updated.updated_at,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Refinement failed' });
    }
  } catch (error: any) {
    console.error('Refine error:', error);
    res.status(500).json({ success: false, error: 'Failed to refine code' });
  }
});

// POST /api/generations/:id/export - Export code
router.post('/:id/export', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;
    const format = req.query.format as string;

    const generation = await getGenerationById(id, userId);
    if (!generation) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    if (format === 'zip') {
      // Generate ZIP file
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="project_${id}.zip"`);

      const archive = archiver('zip', { zlib: { level: 9 } });
      archive.pipe(res);

      // Add files to ZIP
      for (const [filePath, content] of Object.entries(generation.generated_code)) {
        archive.append(content, { name: filePath });
      }

      await archive.finalize();
    } else {
      // Return JSON format
      res.json({
        success: true,
        files: Object.entries(generation.generated_code).map(([path, content]) => ({
          path,
          content,
        })),
      });
    }
  } catch (error: any) {
    console.error('Export error:', error);
    res.status(500).json({ success: false, error: 'Failed to export code' });
  }
});

export default router;
