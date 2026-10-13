
import { useState } from "react";
import Dashboard from "../pages/Dashboard";
import LoginPage from "../pages/LoginPage";
import RoleDashboard from "../pages/RoleDashboard";
import ProjectPage from "../pages/ProjectPage";
import Settings from "../pages/Settings";
import {
    Navigate,
    Route,
    Routes,
    useNavigate,
} from "react-router-dom";
import TasksPage from "../pages/TasksPage";
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
                <Route path="dashboard" element={<RoleDashboard />} />
                <Route path="projects" element={<ProjectPage />} />
                <Route path="tasks" element={<TasksPage />} />
                <Route path="teams" element={<TeamsPage />} />
                <Route
                    path="projects/:id"
                    element={<ProjectDetailsPage />}
                />
                {/* Dashboard handles Profile itself */}
                <Route path="profile" element={null} />

                {/* Temporary Settings placeholder */}
                <Route path="settings" element={<Settings />} />
            </Route>
        </Routes>
    );
}

export default AppRoutes;
