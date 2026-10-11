
const API_URL = "http://localhost:8081/api/projects";

export async function getProjects() {
  const token = localStorage.getItem("token");

  console.log("Token exists:", Boolean(token));

  const response = await fetch(`${API_URL}/allprojects`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Failed to fetch projects (${response.status}): ${errorBody}`
    );
  }

  return response.json();
}
