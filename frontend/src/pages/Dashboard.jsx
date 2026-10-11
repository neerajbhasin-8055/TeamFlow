
import { useEffect, useState } from "react";
import { getProjects } from "../services/ProjectService";
import Profile from "./Profile";

const navigation = [
    { label: "Overview", icon: "⌂" },
    { label: "Projects", icon: "▤" },
    { label: "My Tasks", icon: "✓" },
    { label: "Teams", icon: "♧" },
];

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

    if (Number.isNaN(parsedDate.getTime())) {
        return "Not set";
    }

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

function Dashboard({ onLogout }) {
    const [activePage, setActivePage] = useState("Overview");
    const [search, setSearch] = useState("");

    const [projects, setProjects] = useState([]);
    const [loadingProjects, setLoadingProjects] = useState(true);
    const [projectError, setProjectError] = useState("");

    const [currentUser, setCurrentUser] = useState(null);
    const [userError, setUserError] = useState("");

    function handleProfileClick() {
        setActivePage("Profile");
    }

    useEffect(() => {
        let cancelled = false;

        async function loadProjects() {
            try {
                setLoadingProjects(true);
                setProjectError("");

                const data = await getProjects();

                if (!Array.isArray(data)) {
                    throw new Error(
                        "Unexpected response received from the server."
                    );
                }

                if (!cancelled) {
                    setProjects(data);
                }
            } catch (error) {
                if (!cancelled) {
                    setProjectError(
                        error.message ||
                        "Unable to load projects. Please try again."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoadingProjects(false);
                }
            }
        }

        loadProjects();

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        let cancelled = false;

        async function loadCurrentUser() {
            try {
                setUserError("");

                const token = localStorage.getItem("token");

                if (!token) {
                    throw new Error("Please log in again.");
                }

                const response = await fetch(
                    "http://localhost:8081/api/users/me",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        response.status === 401
                            ? "Your session has expired. Please log in again."
                            : "Unable to load your profile."
                    );
                }

                const data = await response.json();

                if (!cancelled) {
                    setCurrentUser(data);
                }
            } catch (error) {
                if (!cancelled) {
                    setUserError(
                        error.message || "Unable to load your profile."
                    );
                }
            }
        }

        loadCurrentUser();

        return () => {
            cancelled = true;
        };
    }, []);

    const filteredProjects = projects.filter((project) =>
        (project.name || "")
            .toLowerCase()
            .includes(search.toLowerCase())
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

    return (
        <div className="min-h-screen bg-[#f7f8fc] text-slate-800">
            <div className="flex min-h-screen">
                {/* Sidebar */}
                <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white px-5 py-7 md:flex md:flex-col">
                    <div className="mb-10 flex items-center gap-3 px-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-xl font-bold text-white shadow-lg shadow-violet-200">
                            T
                        </div>

                        <span className="text-xl font-bold tracking-tight text-slate-900">
                            TeamFlow
                        </span>
                    </div>

                    <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
                        Workspace
                    </p>

                    <nav className="space-y-1">
                        {navigation.map((item) => (
                            <button
                                key={item.label}
                                onClick={() => setActivePage(item.label)}
                                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition ${
                                    activePage === item.label
                                        ? "bg-violet-50 text-violet-700"
                                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                }`}
                            >
                                <span className="w-6 text-center text-lg">
                                    {item.icon}
                                </span>
                                {item.label}
                            </button>
                        ))}
                    </nav>

                    <div className="mt-8 border-t border-slate-100 pt-6">
                        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
                            Preferences
                        </p>

                        <button
                            onClick={() => setActivePage("Settings")}
                            className={`w-full rounded-xl px-3 py-3 text-left text-sm font-medium transition ${
                                activePage === "Settings"
                                    ? "bg-violet-50 text-violet-700"
                                    : "text-slate-500 hover:bg-slate-50"
                            }`}
                        >
                            ⚙️ <span className="ml-3">Settings</span>
                        </button>
                    </div>

                    <div className="mt-auto rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 p-4 text-white">
                        <p className="font-semibold">Keep work moving.</p>

                        <p className="mt-2 text-xs leading-5 text-violet-100">
                            Bring your team together and make every project count.
                        </p>

                        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/20">
                            <div className="h-full w-3/4 rounded-full bg-white" />
                        </div>
                    </div>

                    {/* Click the avatar, name or email to open Profile */}
                    <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-5">
                        <button
                            type="button"
                            onClick={handleProfileClick}
                            aria-label="Open your profile"
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 font-semibold text-violet-700 transition hover:bg-violet-200"
                        >
                            {getInitials(currentUser?.name)}
                        </button>

                        <button
                            type="button"
                            onClick={handleProfileClick}
                            className="min-w-0 flex-1 cursor-pointer text-left"
                        >
                            <p className="truncate text-sm font-semibold text-slate-800 hover:text-violet-600">
                                {currentUser?.name ||
                                    (userError ? "Profile unavailable" : "Loading profile...")}
                            </p>

                            <p className="truncate text-xs text-slate-400">
                                {currentUser?.email || "View your profile"}
                            </p>
                        </button>

                        <button
                            onClick={onLogout}
                            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                        >
                            Logout
                        </button>
                    </div>
                </aside>

                {/* Main content */}
                <main className="min-w-0 flex-1 px-4 py-5 sm:px-7 sm:py-8 lg:px-10">
                    {activePage === "Profile" ? (
                        <>
                            <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
                                <div>
                                    <p className="text-sm text-slate-400">
                                        Workspace / Profile
                                    </p>

                                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                                        My Profile
                                    </h1>
                                </div>

                                <button
                                    onClick={() => setActivePage("Overview")}
                                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-violet-200 hover:text-violet-700"
                                >
                                    ← Back to Dashboard
                                </button>
                            </header>

                            <Profile
                                currentUser={currentUser}
                                onUserUpdated={setCurrentUser}
                                onLogout={onLogout}
                            />
                        </>
                    ) : (
                        <>
                            {/* Top bar */}
                            <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
                                <div>
                                    <p className="text-sm text-slate-400">
                                        Workspace / {activePage}
                                    </p>

                                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                                        {activePage === "Overview"
                                            ? "Dashboard"
                                            : activePage}
                                    </h1>
                                </div>

                                <div className="flex items-center gap-3">
                                    <label className="relative hidden sm:block">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                            ⌕
                                        </span>

                                        <input
                                            value={search}
                                            onChange={(event) =>
                                                setSearch(event.target.value)
                                            }
                                            placeholder="Search projects..."
                                            className="w-48 rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100 lg:w-64"
                                        />
                                    </label>

                                    <button
                                        aria-label="Notifications"
                                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white transition hover:bg-slate-50"
                                    >
                                        ♧
                                    </button>
                                </div>
                            </header>

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

                                    <button
                                        onClick={() => setActivePage("Projects")}
                                        className="mt-6 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-violet-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-violet-50"
                                    >
                                        Explore projects <span className="ml-2">→</span>
                                    </button>
                                </div>
                            </section>

                            {/* Overview cards */}
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

                                        <p className="mt-1 text-xs text-slate-400">
                                            {stat.note}
                                        </p>
                                    </div>
                                ))}
                            </section>

                            {/* Projects */}
                            <section>
                                <div className="mb-4 flex items-center gap-3">
                                    {activePage === "Projects" ? (
                                        <h2 className="text-lg font-semibold text-slate-900">
                                            All Projects
                                        </h2>
                                    ) : (
                                        <h2 className="text-lg font-semibold text-slate-900">
                                            Recent Projects
                                        </h2>
                                    )}

                                    {activePage !== "Projects" && (
                                        <button
                                            onClick={() => setActivePage("Projects")}
                                            className="ml-auto rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-violet-200 hover:text-violet-700"
                                        >
                                            View all →
                                        </button>
                                    )}
                                </div>

                                {loadingProjects ? (
                                    <div className="rounded-2xl border border-slate-200 bg-white px-5 py-12 text-center">
                                        <p className="text-sm text-slate-500">
                                            Loading projects...
                                        </p>
                                    </div>
                                ) : projectError ? (
                                    <div className="rounded-2xl border border-red-200 bg-white px-5 py-10 text-center">
                                        <h3 className="font-semibold text-red-700">
                                            Couldn&apos;t load projects
                                        </h3>

                                        <p className="mt-2 text-sm text-slate-500">
                                            {projectError}
                                        </p>

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
                                            {search
                                                ? "No matching projects"
                                                : "No projects yet"}
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
                                            const status = (
                                                project.status || ""
                                            ).toUpperCase();

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
                                                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                                                statusStyles[status] ||
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
                                                        {project.description ||
                                                            "No description available."}
                                                    </p>

                                                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                                                        <div>
                                                            <p className="text-xs text-slate-400">
                                                                Deadline
                                                            </p>

                                                            <p className="mt-1 text-sm font-medium text-slate-700">
                                                                {formatDate(project.deadline)}
                                                            </p>
                                                        </div>

                                                        <button
                                                            aria-label={`Open ${
                                                                project.name || "project"
                                                            }`}
                                                            onClick={() =>
                                                                setActivePage("Projects")
                                                            }
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
                    )}
                </main>
            </div>
        </div>
    );
}

export default Dashboard;
