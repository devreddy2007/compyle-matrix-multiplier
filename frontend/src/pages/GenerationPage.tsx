import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { FileExplorer } from '../components/FileExplorer';
import { CodeViewer } from '../components/CodeViewer';
import { useAuth } from '../hooks/useAuth';
import { generationsAPI } from '../services/api';
import './GenerationPage.css';

interface Generation {
  id: string;
  initial_prompt: string;
  generated_code: Record<string, string>;
  status: string;
  backend_framework: string;
}

export const GenerationPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [generation, setGeneration] = useState<Generation | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [refinementPrompt, setRefinementPrompt] = useState('');
  const [loading, setLoading] = useState(!id);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);
  const [refining, setRefining] = useState(false);
  const [backendFramework, setBackendFramework] = useState('node');

  useEffect(() => {
    if (id) {
      loadGeneration();
    }
  }, [id, token]);

  useEffect(() => {
    if (generation && Object.keys(generation.generated_code).length > 0) {
      setSelectedFile(Object.keys(generation.generated_code)[0]);
    }
  }, [generation]);

  const loadGeneration = async () => {
    try {
      setLoading(true);
      const response = await generationsAPI.get(id!, token!);
      setGeneration(response);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setError('');
    setGenerating(true);

    try {
      const response = await generationsAPI.create(prompt, backendFramework, token!);
      // Poll for completion
      let gen = response;
      while (gen.status === 'in_progress') {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        gen = await generationsAPI.get(gen.id, token!);
      }

      if (gen.status === 'error') {
        setError(gen.error_message || 'Generation failed');
      } else {
        setGeneration(gen);
        setPrompt('');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleRefine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refinementPrompt.trim() || !generation) return;

    setError('');
    setRefining(true);

    try {
      const response = await generationsAPI.refine(generation.id, refinementPrompt, token!);
      setGeneration({ ...generation, generated_code: response.generated_code });
      setRefinementPrompt('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setRefining(false);
    }
  };

  const handleExport = async (format: string) => {
    if (!generation) return;

    try {
      if (format === 'zip') {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/generations/${generation.id}/export?format=zip`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `project_${generation.id}.zip`;
        a.click();
      } else {
        const response = await generationsAPI.export(generation.id, format, token!);
        alert('Export data copied - check console for details');
        console.log(response);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="generation-container">
      <Header />
      <div className="generation-content">
        {!generation ? (
          <div className="generation-form-container">
            <form onSubmit={handleGenerate} className="generation-form">
              <h2>Generate New Code</h2>
              <select
                value={backendFramework}
                onChange={(e) => setBackendFramework(e.target.value)}
                className="framework-select"
              >
                <option value="node">Node.js (Express)</option>
                <option value="python">Python (FastAPI)</option>
              </select>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your full-stack web application. Example: Create a todo app with user authentication and database"
                rows={6}
                disabled={generating}
              />
              {error && <div className="error-message">{error}</div>}
              <button type="submit" disabled={generating || !prompt.trim()}>
                {generating ? 'Generating...' : 'Generate Code'}
              </button>
            </form>
          </div>
        ) : (
          <div className="generation-editor">
            <div className="editor-left">
              <FileExplorer
                files={Object.keys(generation.generated_code)}
                selectedFile={selectedFile}
                onSelectFile={setSelectedFile}
              />
            </div>
            <div className="editor-right">
              {selectedFile && generation.generated_code[selectedFile] && (
                <CodeViewer
                  filePath={selectedFile}
                  content={generation.generated_code[selectedFile]}
                />
              )}
            </div>
          </div>
        )}

        {generation && (
          <div className="refinement-panel">
            <div className="refinement-header">
              <h3>Refinement & Export</h3>
              <button onClick={() => navigate('/dashboard')} className="back-button">
                ← Back to Dashboard
              </button>
            </div>
            <form onSubmit={handleRefine} className="refinement-form">
              <input
                type="text"
                value={refinementPrompt}
                onChange={(e) => setRefinementPrompt(e.target.value)}
                placeholder="Refine the generated code (e.g., 'Add a delete button')"
                disabled={refining}
              />
              <button type="submit" disabled={refining || !refinementPrompt.trim()}>
                {refining ? 'Refining...' : 'Refine'}
              </button>
            </form>

            <div className="export-buttons">
              <button onClick={() => handleExport('zip')} className="export-button">
                Download ZIP
              </button>
              <button onClick={() => handleExport('json')} className="export-button">
                Export JSON
              </button>
            </div>

            {error && <div className="error-message">{error}</div>}
          </div>
        )}
      </div>
    </div>
  );
};
