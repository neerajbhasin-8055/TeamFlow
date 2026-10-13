import { API_BASE_URL } from "../api";

const API_URL = `${API_BASE_URL}/api/teams`;

async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}${endpoint}`, {
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
            message = parsed.message || parsed.error || message;
        } catch {
            // Keep the original response text.
        }

        throw new Error(message);
    }

    if (response.status === 204) return null;

    return response.json();
}

export function getAllTeams() {
    return apiRequest("/allteams");
}

export function getTeamById(id) {
    return apiRequest(`/${id}`);
}

export function createTeam(data) {
    return apiRequest("/create", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export function updateTeam(id, data) {
    return apiRequest(`/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export function deleteTeam(id) {
    return apiRequest(`/${id}`, {
        method: "DELETE",
    });
}

export function getTeamMembers(teamId) {
    return apiRequest(`/${teamId}/members`);
}

export function addTeamMember(teamId, userId) {
    return apiRequest(`/${teamId}/members/${userId}`, {
        method: "POST",
    });
}

export function removeTeamMember(teamId, userId) {
    return apiRequest(`/${teamId}/members/${userId}`, {
        method: "DELETE",
    });
}

export function getTeamProjects(teamId) {
    return apiRequest(`/${teamId}/projects`);
}

export function addTeamProject(teamId, projectId) {
    return apiRequest(`/${teamId}/projects/${projectId}`, {
        method: "POST",
    });
}

export function removeTeamProject(teamId, projectId) {
    return apiRequest(`/${teamId}/projects/${projectId}`, {
        method: "DELETE",
    });
}

// Existing backend endpoints
export function getAllUsers() {
    const token = localStorage.getItem("token");

    return fetch(`${API_BASE_URL}/api/users/allusers`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    }).then(async (response) => {
        if (!response.ok) {
            const text = await response.text();
            throw new Error(text || "Unable to load users.");
        }
        return response.json();
    });
}

export function getAllProjects() {
    const token = localStorage.getItem("token");

    return fetch(`${API_BASE_URL}/api/projects/allprojects`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    }).then(async (response) => {
        if (!response.ok) {
            const text = await response.text();
            throw new Error(text || "Unable to load projects.");
        }
        return response.json();
    });
}

export function getCurrentUser() {
    const token = localStorage.getItem("token");

    return fetch(`${API_BASE_URL}/api/users/me`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    }).then(async (response) => {
        if (!response.ok) {
            throw new Error("Unable to load your account.");
        }
        return response.json();
    });
}