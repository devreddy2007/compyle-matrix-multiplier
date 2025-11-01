import React, { useState } from 'react';
import './CodeViewer.css';

interface CodeViewerProps {
  filePath: string;
  content: string;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ filePath, content }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLanguage = (path: string) => {
    if (path.endsWith('.tsx') || path.endsWith('.ts')) return 'typescript';
    if (path.endsWith('.jsx') || path.endsWith('.js')) return 'javascript';
    if (path.endsWith('.python') || path.endsWith('.py')) return 'python';
    if (path.endsWith('.json')) return 'json';
    if (path.endsWith('.sql')) return 'sql';
    if (path.endsWith('.css')) return 'css';
    if (path.endsWith('.html')) return 'html';
    return 'text';
  };

  return (
    <div className="code-viewer">
      <div className="code-viewer-header">
        <span className="file-path">{filePath}</span>
        <button
          className="copy-button"
          onClick={handleCopy}
          title="Copy code"
        >
          {copied ? '✓ Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="code-content">
        <code>{content}</code>
      </pre>
    </div>
  );
};
