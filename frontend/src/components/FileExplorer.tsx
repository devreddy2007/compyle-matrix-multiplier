import React from 'react';
import './FileExplorer.css';

interface FileExplorerProps {
  files: string[];
  selectedFile: string | null;
  onSelectFile: (filePath: string) => void;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  selectedFile,
  onSelectFile,
}) => {
  // Group files by directory
  const fileTree: Record<string, string[]> = {};
  const rootFiles: string[] = [];

  files.forEach((file) => {
    const parts = file.split('/');
    if (parts.length === 1) {
      rootFiles.push(file);
    } else {
      const dir = parts[0];
      if (!fileTree[dir]) {
        fileTree[dir] = [];
      }
      fileTree[dir].push(file);
    }
  });

  const getFileName = (path: string) => {
    return path.split('/').pop() || path;
  };

  return (
    <div className="file-explorer">
      <h3>Files</h3>
      <div className="file-list">
        {rootFiles.map((file) => (
          <div
            key={file}
            className={`file-item ${selectedFile === file ? 'active' : ''}`}
            onClick={() => onSelectFile(file)}
          >
            📄 {file}
          </div>
        ))}

        {Object.entries(fileTree).map(([dir, dirFiles]) => (
          <div key={dir} className="directory">
            <div className="dir-name">📁 {dir}</div>
            <div className="dir-files">
              {dirFiles.map((file) => (
                <div
                  key={file}
                  className={`file-item nested ${selectedFile === file ? 'active' : ''}`}
                  onClick={() => onSelectFile(file)}
                >
                  📄 {getFileName(file)}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
