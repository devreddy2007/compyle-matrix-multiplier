import React from 'react';
import './ProjectCard.css';

interface ProjectCardProps {
  id: string;
  initial_prompt: string;
  backend_framework: string;
  created_at: string;
  onClick: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  id,
  initial_prompt,
  backend_framework,
  created_at,
  onClick,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="project-card" onClick={onClick}>
      <h3>{initial_prompt.substring(0, 50)}...</h3>
      <p className="framework">Backend: {backend_framework}</p>
      <p className="created-at">{formatDate(created_at)}</p>
    </div>
  );
};
