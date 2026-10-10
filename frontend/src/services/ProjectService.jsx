
const API_URL = "http://localhost:8081/api/projects";

export async function getProjects() {
    try {
        const response = await fetch(`${API_URL}/allprojects`);

        if (!response.ok) {
            throw new Error("Failed to fetch all projects");
        }

        const data = await response.json();

        return data;
    } catch (error) {
        throw error;
    }
}
