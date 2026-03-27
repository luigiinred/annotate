import { useState, useEffect, useCallback } from 'react';
import { getProjects, deleteProject } from '../utils/storage';

function HomeScreen({ onLoadProject, onImageLoad }) {
  const [projects, setProjects] = useState([]);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    setProjects(getProjects());
  }, []);

  const handleFile = useCallback((file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          onImageLoad(img, e.target.result);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }, [onImageLoad]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleFileInput = useCallback((e) => {
    const file = e.target.files[0];
    handleFile(file);
  }, [handleFile]);

  const handlePaste = useCallback((e) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          handleFile(file);
          break;
        }
      }
    }
  }, [handleFile]);

  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  const handleDeleteProject = useCallback((e, projectId) => {
    e.stopPropagation();
    deleteProject(projectId);
    setProjects(getProjects());
  }, []);

  return (
    <div className="home-screen">
      <h1>Annotate</h1>
      <p className="subtitle">Drop a screenshot to get started</p>

      <div
        className={`drop-area ${dragOver ? 'drag-over' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="drop-icon">+</div>
        <p>Drop image here or paste from clipboard</p>
        <label className="file-input-label">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            style={{ display: 'none' }}
          />
          Or click to browse
        </label>
      </div>

      {projects.length > 0 && (
        <div className="recent-projects">
          <h2>Recent Projects</h2>
          <div className="projects-grid">
            {projects.map(project => (
              <div
                key={project.id}
                className="project-card"
                onClick={() => onLoadProject(project.id)}
              >
                <div className="project-thumbnail">
                  {project.thumbnail ? (
                    <img src={project.thumbnail} alt={project.name} />
                  ) : (
                    <div className="no-thumbnail">No preview</div>
                  )}
                </div>
                <div className="project-info">
                  <span className="project-name">{project.name}</span>
                  <span className="project-date">
                    {new Date(project.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <button
                  className="delete-project"
                  onClick={(e) => handleDeleteProject(e, project.id)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default HomeScreen;
