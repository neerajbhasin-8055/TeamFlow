
const TASK_API_URL = "http://localhost:8081/api/tasks";
const USER_API_URL = "http://localhost:8081/api/users";

async function apiRequest(url, options = {}) {
    const token = localStorage.getItem("token");

    const response = await fetch(url, {
        ...options,
        headers: {
            ...(options.body ? { "Content-Type": "application/json" } : {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });

    if (!response.ok) {
        const text = await response.text();
        let message = text || `Request failed (${response.status})`;

        try {
            const parsed = JSON.parse(text);
            message = parsed.message || parsed.error || parsed.detail || message;
        } catch {
            // Keep the original response text.
        }

        throw new Error(message);
    }

    if (response.status === 204) return null;

    const text = await response.text();
    return text ? JSON.parse(text) : null;
}

export function getTasks() {
    return apiRequest(`${TASK_API_URL}/alltasks`);
}

export function createTask(data) {
    return apiRequest(`${TASK_API_URL}/create`, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export function updateTask(id, data) {
    return apiRequest(`${TASK_API_URL}/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export function deleteTask(id) {
    return apiRequest(`${TASK_API_URL}/${encodeURIComponent(id)}`, {
        method: "DELETE",
    });
}

// Same endpoint and JWT handling as TeamService.
export function getAllUsers() {
    return apiRequest(`${USER_API_URL}/allusers`);
}
