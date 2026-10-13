
import { API_BASE_URL } from "../api";
const API = `${API_BASE_URL}/api/tasks`;
const USERS_API = `${API_BASE_URL}/api/users/allusers`;

async function request(url, options = {}) {
  const token = localStorage.getItem("token");

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    let message = `Request failed (${response.status}).`;

    try {
      const body = await response.json();
      message =
        body.message ||
        body.error ||
        body.detail ||
        message;
    } catch {
      // The response may not contain JSON.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

// Fetch all tasks.
export const getTasks = () => request(`${API}/alltasks`);

// Fetch a task by ID.
export const getTaskById = (id) =>
  request(`${API}/${encodeURIComponent(id)}`);

// Fetch all users for the assignee dropdown.
export const getAllUsers = () => request(USERS_API);

// Create a task.
export const createTask = (task) =>
  request(`${API}/create`, {
    method: "POST",
    body: JSON.stringify(task),
  });

// Edit a complete task.
export const updateTask = (id, task) =>
  request(`${API}/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(task),
  });

// Update the status while preserving the task's other fields.
// Uses the existing task update endpoint.
export const updateTaskStatus = (id, task, status) =>
  updateTask(id, {
    title: task.title,
    description: task.description || "",
    projectId: task.projectId,
    assignedTo: task.assignedTo,
    deadline: task.deadline,
    priority: task.priority,
    status,
  });

// Delete a task.
export const deleteTask = (id) =>
  request(`${API}/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
