
import { useEffect, useState } from "react";
import { getProjects } from "../services/ProjectService";
import Profile from "./Profile";
import { useNavigate, Outlet, useLocation } from "react-router-dom";

const navigation = [
  { label: "Overview", icon: "⌂", path: "/dashboard" },
  { label: "Projects", icon: "▤", path: "/projects" },
  { label: "My Tasks", icon: "✓", path: "/tasks" },
  { label: "Teams", icon: "♧", path: "/teams" },
];

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
  const navigate = useNavigate();
  const location = useLocation();

  const isProfilePage = location.pathname === "/profile";

  // Matches paths like /projects/123, but not /projects.
  const isProjectDetailsPage =
    /^\/projects\/[^/]+$/.test(location.pathname);

  const activePage =
    location.pathname === "/dashboard"
      ? "Overview"
      : location.pathname === "/projects"
        ? "Projects"
        : location.pathname === "/tasks"
          ? "My Tasks"
          : location.pathname === "/teams"
            ? "Teams"
            : location.pathname === "/settings"
              ? "Settings"
              : isProfilePage
                ? "Profile"
                : "Overview";

  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [projectError, setProjectError] = useState("");

  const [currentUser, setCurrentUser] = useState(null);
  const [userError, setUserError] = useState("");

  function handleProfileClick() {
    navigate("/profile");
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

  const outletContext = {
    projects,
    setProjects,
    loadingProjects,
    projectError,
    currentUser,
    setCurrentUser,
    onLogout,
    onViewProjects: () => navigate("/projects"),
  };

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
                type="button"
                onClick={() => navigate(item.path)}
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
              type="button"
              onClick={() => navigate("/settings")}
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

          {/* User profile and logout */}
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
                  (userError
                    ? "Profile unavailable"
                    : "Loading profile...")}
              </p>

              <p className="truncate text-xs text-slate-400">
                {currentUser?.email || "View your profile"}
              </p>
            </button>

            <button
              type="button"
              onClick={onLogout}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-600"
            >
              Logout
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1 px-4 py-5 sm:px-7 sm:py-8 lg:px-10">
          {isProfilePage ? (
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
                  type="button"
                  onClick={() => navigate("/dashboard")}
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
              {/* Shared top bar — page-specific search lives in each page */}
              <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
                <div>
                  {!isProjectDetailsPage ? (
                    <>
                      <p className="text-sm text-slate-400">
                        Workspace / {activePage}
                      </p>

                      <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                        {activePage === "Overview"
                          ? "Dashboard"
                          : activePage}
                      </h1>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-slate-400">
                        Workspace / Projects / Project Details
                      </p>

                      <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                        Project Details
                      </h1>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    aria-label="Notifications"
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white transition hover:bg-slate-50"
                  >
                    ♧
                  </button>
                </div>
              </header>

              {/* React Router renders the selected child page here */}
              <Outlet context={outletContext} />
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
