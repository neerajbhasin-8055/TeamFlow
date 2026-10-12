
import { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import AddProjectModal from "../components/AddProjectModal";

const statusStyles = {
    IN_PROGRESS: "bg-blue-50 text-blue-700",
    TODO: "bg-amber-50 text-amber-700",
    COMPLETED: "bg-emerald-50 text-emerald-700",
    DONE: "bg-emerald-50 text-emerald-700",
    ON_HOLD: "bg-orange-50 text-orange-700",
    CANCELLED: "bg-red-50 text-red-700",
};

function formatStatus(status) {
    if (!status) return "Unknown";

    return status
        .toLowerCase()
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

function formatDate(date) {
    if (!date) return "Not set";

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return "Not set";

    return parsedDate.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function getInitials(name) {
    if (!name) return "U";

    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((word) => word.charAt(0))
        .join("")
        .toUpperCase();
}

function Overview() {
    const {
        projects,
        setProjects,
        loadingProjects,
        projectError,
        onViewProjects,
    } = useOutletContext();

    const [showAddProject, setShowAddProject] = useState(false);
    const navigate = useNavigate();

    function handleProjectCreated(newProject) {
        setProjects((previous) => {
            const exists = previous.some(
                (project) => project.id === newProject.id
            );

            return exists
                ? previous
                : [newProject, ...previous];
        });
    }

    const [search, setSearch] = useState("");
   const filteredProjects = projects.filter((project) =>
    (project.name || "")
      .toLowerCase()
      .includes(search.trim().toLowerCase())
  );

    const stats = [
        {
            label: "Total Projects",
            value: projects.length,
            note: "Projects returned by the server",
            icon: "▤",
            style: "bg-violet-50 text-violet-700",
        },
        {
            label: "My Tasks",
            value: "—",
            note: "Task API integration pending",
            icon: "✓",
            style: "bg-blue-50 text-blue-700",
        },
        {
            label: "Team Members",
            value: "—",
            note: "Team API integration pending",
            icon: "♧",
            style: "bg-amber-50 text-amber-700",
        },
        {
            label: "Completed Tasks",
            value: "—",
            note: "Task API integration pending",
            icon: "↗",
            style: "bg-emerald-50 text-emerald-700",
        },
    ];
    const [role, setRole] = useState("");

    useEffect(() => {
        async function userRole() {
            try {
                const token = localStorage.getItem("token");

                const response = await fetch(
                    "http://localhost:8081/api/users/me",
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

    return (
        <>
            {showAddProject && (
                <AddProjectModal
                    onClose={() => setShowAddProject(false)}
                    onProjectCreated={handleProjectCreated}
                />
            )}

            {/* Welcome banner */}
            <section className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 via-violet-600 to-indigo-600 p-6 text-white shadow-xl shadow-violet-200/50 sm:p-9">
                <div className="absolute -right-10 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
                <div className="absolute bottom-0 right-36 h-32 w-32 rounded-full bg-indigo-300/20 blur-2xl" />

                <div className="relative max-w-xl">
                    <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-violet-100">
                        YOUR WORKSPACE AT A GLANCE
                    </span>

                    <h2 className="mt-5 text-2xl font-bold leading-tight sm:text-4xl">
                        Great things happen
                        <br className="hidden sm:block" /> when teams flow. ✨
                    </h2>

                    <p className="mt-3 max-w-lg text-sm leading-6 text-violet-100 sm:text-base">
                        Bring your projects, people, and priorities together.
                        Let&apos;s make today productive.
                    </p>

                    <div className="mt-6 flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={onViewProjects}
                            className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-violet-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-violet-50"
                        >
                            Explore projects <span className="ml-2">→</span>
                        </button>

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
                </div>
            </section>

            {/* Overview stats */}
            <section className="mb-9 grid grid-cols-2 gap-4 xl:grid-cols-4">
                {stats.map((stat) => (
                    <div
                        key={stat.label}
                        className="rounded-2xl border border-slate-200/80 bg-white p-4 transition duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/60 sm:p-5"
                    >
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-medium text-slate-500 sm:text-sm">
                                {stat.label}
                            </span>
                            <span
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg ${stat.style}`}
                            >
                                {stat.icon}
                            </span>
                        </div>

                        <p className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                            {stat.value}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">{stat.note}</p>
                    </div>
                ))}
            </section>

            {/* Recent projects */}
            <section>
                <div className="mb-4 flex flex-wrap items-center gap-3">
                    <h2 className="text-lg font-semibold text-slate-900">
                        Recent Projects
                    </h2>

                    <div className="ml-auto flex gap-2">
                        {(role === "ADMIN" || role === "MANAGER") && (
                            <button
                                type="button"
                                onClick={() => setShowAddProject(true)}
                                className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
                            >
                                + Add Project
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={onViewProjects}
                            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-violet-200 hover:text-violet-700"
                        >
                            View all →
                        </button>
                    </div>
                </div>

                {loadingProjects ? (
                    <div className="rounded-2xl border border-slate-200 bg-white px-5 py-12 text-center">
                        <p className="text-sm text-slate-500">Loading projects...</p>
                    </div>
                ) : projectError ? (
                    <div className="rounded-2xl border border-red-200 bg-white px-5 py-10 text-center">
                        <h3 className="font-semibold text-red-700">
                            Couldn&apos;t load projects
                        </h3>
                        <p className="mt-2 text-sm text-slate-500">{projectError}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
                        >
                            Try again
                        </button>
                    </div>
                ) : filteredProjects.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-xl">
                            ⌕
                        </div>
                        <h3 className="mt-4 font-semibold text-slate-800">
                            {search ? "No matching projects" : "No projects yet"}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                            {search
                                ? "Try searching with a different project name."
                                : "Create a project to see it appear here."}
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 xl:grid-cols-3">
                        {filteredProjects.map((project) => {
                            const status = (project.status || "").toUpperCase();

                            return (
                                <article
                                    key={project.id}
                                    className="group rounded-2xl border border-slate-200/80 bg-white p-5 transition duration-200 hover:-translate-y-1 hover:border-violet-200 hover:shadow-xl hover:shadow-violet-100/50"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-sm font-bold text-violet-700">
                                            {getInitials(project.name)}
                                        </div>

                                        <span
                                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[status] ||
                                                "bg-slate-100 text-slate-600"
                                                }`}
                                        >
                                            {formatStatus(project.status)}
                                        </span>
                                    </div>

                                    <h3 className="mt-5 font-semibold text-slate-900 transition group-hover:text-violet-700">
                                        {project.name || "Untitled project"}
                                    </h3>

                                    <p className="mt-2 min-h-10 break-words text-sm leading-5 text-slate-500">
                                        {project.description || "No description available."}
                                    </p>

                                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                                        <div>
                                            <p className="text-xs text-slate-400">Deadline</p>
                                            <p className="mt-1 text-sm font-medium text-slate-700">
                                                {formatDate(project.deadline)}
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            aria-label={`Open ${project.name || "project"}`}
                                            onClick={() => navigate(`/projects/${project.id}`)}
                                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-violet-50 hover:text-violet-700"
                                        >
                                            →
                                        </button>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>

            <footer className="mt-10 border-t border-slate-200 pt-5 text-center text-xs text-slate-400">
                TeamFlow · Make teamwork flow.
            </footer>
        </>
    );
}

export default Overview;
