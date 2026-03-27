const STORAGE_KEY = 'annotate_projects';
const MAX_RECENT = 5;

export function saveProject(imageData, layers, name) {
  const projects = getProjects();
  const id = Date.now().toString();

  const project = {
    id,
    name: name || `Project ${new Date().toLocaleDateString()}`,
    imageData,
    layers,
    updatedAt: Date.now(),
    thumbnail: createThumbnail(imageData)
  };

  // Remove if already exists (update)
  const existingIndex = projects.findIndex(p => p.imageData === imageData);
  if (existingIndex >= 0) {
    projects.splice(existingIndex, 1);
  }

  // Add to front
  projects.unshift(project);

  // Keep only recent projects
  const trimmed = projects.slice(0, MAX_RECENT);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.warn('Failed to save to localStorage:', e);
  }

  return id;
}

export function getProjects() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

export function getProject(id) {
  const projects = getProjects();
  return projects.find(p => p.id === id);
}

export function deleteProject(id) {
  const projects = getProjects();
  const filtered = projects.filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function updateProjectLayers(id, layers) {
  const projects = getProjects();
  const project = projects.find(p => p.id === id);
  if (project) {
    project.layers = layers;
    project.updatedAt = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }
}

function createThumbnail(imageData, maxSize = 200) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
    img.src = imageData;
  });
}

// Auto-save current project
let currentProjectId = null;
let saveTimeout = null;

export function setCurrentProject(id) {
  currentProjectId = id;
}

export function getCurrentProjectId() {
  return currentProjectId;
}

export function autoSave(imageData, layers) {
  if (saveTimeout) clearTimeout(saveTimeout);

  saveTimeout = setTimeout(() => {
    if (currentProjectId) {
      updateProjectLayers(currentProjectId, layers);
    } else if (imageData) {
      currentProjectId = saveProject(imageData, layers);
    }
  }, 1000);
}
