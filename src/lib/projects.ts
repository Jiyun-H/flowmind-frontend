import { AITask } from "@/types/ai-task";

const PROJECTS_STORAGE_KEY = "flowmind_projects";

export interface FlowMindProject {
  id: string;
  name: string;
  taskIds: string[];
  ownerEmail?: string;
  createdAt: string;
  updatedAt: string;
}

export function getProjects(): FlowMindProject[] {
  if (typeof window === "undefined") return [];

  const storedProjects = localStorage.getItem(PROJECTS_STORAGE_KEY);
  if (!storedProjects) return [];

  try {
    return JSON.parse(storedProjects) as FlowMindProject[];
  } catch {
    return [];
  }
}

export function saveProjects(projects: FlowMindProject[]) {
  localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
  window.dispatchEvent(new Event("flowmind:projects-updated"));
}

export function createProject(name: string, ownerEmail?: string) {
  const now = new Date().toISOString();
  const project: FlowMindProject = {
    id: createProjectId(),
    name,
    taskIds: [],
    ownerEmail,
    createdAt: now,
    updatedAt: now,
  };

  saveProjects([project, ...getProjects()]);
  return project;
}

export function getProject(projectId: string) {
  return getProjects().find((project) => project.id === projectId) ?? null;
}

export function addTaskToProject(projectId: string, taskId: string) {
  const projects = getProjects();
  const nextProjects = projects.map((project) => {
    if (project.id !== projectId) return project;

    return {
      ...project,
      taskIds: project.taskIds.includes(taskId)
        ? project.taskIds
        : [taskId, ...project.taskIds],
      updatedAt: new Date().toISOString(),
    };
  });

  saveProjects(nextProjects);
}

export function removeTaskFromProjects(taskId: string) {
  const projects = getProjects();
  const nextProjects = projects.map((project) => ({
    ...project,
    taskIds: project.taskIds.filter((id) => id !== taskId),
  }));

  saveProjects(nextProjects);
}

export function getProjectTasks(
  project: FlowMindProject,
  tasks: AITask[],
): AITask[] {
  const taskMap = new Map(tasks.map((task) => [task.id, task]));
  return project.taskIds
    .map((taskId) => taskMap.get(taskId))
    .filter((task): task is AITask => Boolean(task));
}

function createProjectId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
