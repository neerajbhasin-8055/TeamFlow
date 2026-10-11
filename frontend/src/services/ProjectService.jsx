
const API_URL = "http://localhost:8081/api/projects";

export async function getProjects() {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Authentication token not found. Please log in again.");
  }

  const response = await fetch(`${API_URL}/allprojects`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Failed to fetch projects (${response.status}): ${errorBody}`
    );
  }

  const data = await response.json();

  // Support either an array or a common wrapped API response.
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data.projects)) {
    return data.projects;
  }

  if (Array.isArray(data.content)) {
    return data.content;
  }

  console.error("Unexpected projects API response:", data);
  throw new Error("The projects API did not return a project array.");
}

export async function createProject(projectData) {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Authentication token not found. Please log in again.");
  }

  const response = await fetch(`${API_URL}/create`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(projectData),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Failed to create project (${response.status}): ${errorBody}`
    );
  }

  const responseText = await response.text();

  if (!responseText) {
    return null;
  }

  try {
    return JSON.parse(responseText);
  } catch {
    return responseText;
  }
}
