import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { ProjectCard } from '../components/ProjectCard';
import { useAuth } from '../hooks/useAuth';
import { generationsAPI } from '../services/api';
import './DashboardPage.css';

interface Project {
  id: string;
  initial_prompt: string;
  backend_framework: string;
  created_at: string;
}

export const DashboardPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
  }, [token]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await generationsAPI.list(token!);
      setProjects(response.projects);
    } catch (err: any) {
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <Header />
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>My Projects</h1>
          <button className="new-project-button" onClick={() => navigate('/generate')}>
            + New Generation
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="empty-state">
            <p>No projects yet. Create your first one!</p>
            <button onClick={() => navigate('/generate')} className="create-button">
              Start Generating
            </button>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                {...project}
                onClick={() => navigate(`/generate/${project.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
