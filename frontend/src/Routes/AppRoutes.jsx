
import { useState } from "react";
import Dashboard from "../pages/Dashboard";
import LoginPage from "../pages/LoginPage";
import Overview from "../pages/Overview";
import ProjectPage from "../pages/ProjectPage";
import {
    Navigate,
    Route,
    Routes,
    useNavigate,
} from "react-router-dom";
import Tasks from "../pages/TasksPage";
import TeamsPage from "../pages/TeamsPage";
import ProjectDetailsPage from "../pages/ProjectDetailsPage"

function AppRoutes() {
    const [token, setToken] = useState(
        () => localStorage.getItem("token")
    );

    const navigate = useNavigate();

    function handleLoginSuccess(newToken) {
        localStorage.setItem("token", newToken);
        setToken(newToken);
        navigate("/dashboard");
    }

    function handleLogout() {
        localStorage.removeItem("token");
        setToken(null);
        navigate("/login");
    }

    return (
        <Routes>
            <Route
                path="/"
                element={<Navigate to={token ? "/dashboard" : "/login"} replace />}
            />

            <Route
                path="/login"
                element={
                    token ? (
                        <Navigate to="/dashboard" replace />
                    ) : (
                        <LoginPage onLoginSuccess={handleLoginSuccess} />
                    )
                }
            />

            <Route
                element={
                    token ? (
                        <Dashboard onLogout={handleLogout} />
                    ) : (
                        <Navigate to="/login" replace />
                    )
                }
            >
                <Route path="dashboard" element={<Overview />} />
                <Route path="projects" element={<ProjectPage />} />
                <Route path="tasks" element={<Tasks />} />
                <Route path="teams" element={<TeamsPage />} />
                <Route
                    path="projects/:id"
                    element={<ProjectDetailsPage />}
                />
                {/* Dashboard handles Profile itself */}
                <Route path="profile" element={null} />

                {/* Temporary Settings placeholder */}
                <Route
                    path="settings"
                    element={
                        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
                            <h2 className="font-semibold text-slate-900">Settings</h2>
                            <p className="mt-2 text-sm text-slate-500">
                                This page has not been implemented yet.
                            </p>
                        </div>
                    }
                />
            </Route>
        </Routes>
    );
}

export default AppRoutes;
