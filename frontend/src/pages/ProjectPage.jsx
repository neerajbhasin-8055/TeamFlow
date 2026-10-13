
import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import ProjectCard from "../components/ProjectCard";
import AddProjectModal from "../components/AddProjectModal";
import { API_BASE_URL } from "../api";

function ProjectPage() {
  const {
    projects,
    setProjects,
    loadingProjects,
    projectError,
  } = useOutletContext();

  const [showAddProject, setShowAddProject] = useState(false);
  const [role, setRole] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function userRole() {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          `${API_BASE_URL}/api/users/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Unable to load user role.");
        }

        const data = await response.json();
        setRole(data.role);
      } catch (err) {
        console.error("Failed to fetch user role:", err);
      }
    }

    userRole();
  }, []);

  function handleProjectCreated(newProject) {
    setProjects((previous) => {
      const exists = previous.some(
        (project) => project.id === newProject.id
      );

      return exists ? previous : [newProject, ...previous];
    });
  }

  const filteredProjects = projects.filter((project) =>
    (project.name || "")
      .toLowerCase()
      .includes(search.trim().toLowerCase())
  );

  if (loadingProjects) {
    return (
      <p className="text-sm text-slate-500">
        Loading projects...
      </p>
    );
  }

  if (projectError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-white p-6">
        <h2 className="font-semibold text-red-700">
          Couldn't load projects
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          {projectError}
        </p>

        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-4 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <section>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">
          All Projects
        </h2>

        {(role === "ADMIN" || role === "MANAGER") && (
          <button
            type="button"
            onClick={() => setShowAddProject(true)}
            className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
          >
            + Add Project
          </button>
        )}
      </div>

      {/* Projects page's independent search */}
      <div className="mb-5">
        <label
          htmlFor="project-search"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Search projects
        </label>

        <input
          id="project-search"
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by project name..."
          className="w-full max-w-md rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
        />
      </div>

      {showAddProject && (
        <AddProjectModal
          onClose={() => setShowAddProject(false)}
          onProjectCreated={handleProjectCreated}
        />
      )}

      {filteredProjects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center">
          <h3 className="font-semibold text-slate-800">
            {search.trim()
              ? "No matching projects"
              : "No projects yet"}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            {search.trim()
              ? "Try searching with a different project name."
              : "Create a project to see it appear here."}
          </p>
        </div>
      ) : (
        <ul className="grid gap-4 xl:grid-cols-3">
          {filteredProjects.map((project) => (
            <li key={project.id}>
              <ProjectCard
                id={project.id}
                name={project.name}
                description={project.description}
                status={project.status}
                deadline={project.deadline}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default ProjectPage;
