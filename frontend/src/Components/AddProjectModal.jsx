
import { useEffect, useState } from "react";
import { createProject } from "../services/ProjectService";
import { API_BASE_URL } from "../api"
const initialForm = {
    name: "",
    description: "",
    status: "TODO",
    startDate: "",
    deadline: "",
    teamId: "",
};

function AddProjectModal({ onClose, onProjectCreated }) {
    const [form, setForm] = useState(initialForm);
    const [teams, setTeams] = useState([]);
    const [loadingTeams, setLoadingTeams] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function loadTeams() {
            try {
                const token = localStorage.getItem("token");

                const response = await fetch(
                    `${API_BASE_URL}/api/teams`,
                    {
                        headers: token
                            ? { Authorization: `Bearer ${token}` }
                            : {},
                    }
                );

                if (!response.ok) {
                    throw new Error("Unable to load teams.");
                }

                const data = await response.json();

                const teamList = Array.isArray(data)
                    ? data
                    : data.content || data.teams || [];

                if (!cancelled) {
                    setTeams(teamList);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err.message);
                }
            } finally {
                if (!cancelled) {
                    setLoadingTeams(false);
                }
            }
        }

        loadTeams();

        return () => {
            cancelled = true;
        };
    }, []);


    function handleChange(event) {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    }


    async function handleSubmit(event) {
        event.preventDefault();
        setError("");

        if (!form.name.trim()) {
            setError("Project name is required.");
            return;
        }

        if (
            form.startDate &&
            form.deadline &&
            form.deadline < form.startDate
        ) {
            setError("Deadline cannot be before the start date.");
            return;
        }

        const payload = {
            name: form.name.trim(),
            description: form.description.trim(),
            status: form.status,
            startDate: form.startDate || null,
            deadline: form.deadline || null,
            teamId: form.teamId || null,
        };

        try {
            setLoading(true);

            // Service itself sends the POST request.
            const createdProject = await createProject(payload);

            // Update the projects list in the parent component.
            if (createdProject) {
                await onProjectCreated(createdProject);
            }

            onClose();
        } catch (err) {
            setError(err.message || "Unable to create project.");
        } finally {
            setLoading(false);
        }
    }


    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !loading) {
                    onClose();
                }
            }}
        >
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="add-project-title"
                className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
            >
                <div className="mb-6 flex items-start justify-between">
                    <div>
                        <h2
                            id="add-project-title"
                            className="text-xl font-bold text-gray-900"
                        >
                            Create a project
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Set up your project and optionally assign a team.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        aria-label="Close modal"
                        className="rounded-lg px-3 py-1 text-2xl text-gray-400 hover:bg-gray-100"
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label
                            htmlFor="project-name"
                            className="mb-1.5 block text-sm font-medium text-gray-700"
                        >
                            Project name *
                        </label>
                        <input
                            id="project-name"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                            maxLength={100}
                            placeholder="e.g. TeamFlow"
                            className="w-full rounded-xl border border-gray-300 px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="project-description"
                            className="mb-1.5 block text-sm font-medium text-gray-700"
                        >
                            Description
                        </label>
                        <textarea
                            id="project-description"
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            rows={3}
                            placeholder="What is this project about?"
                            className="w-full rounded-xl border border-gray-300 px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="project-status"
                            className="mb-1.5 block text-sm font-medium text-gray-700"
                        >
                            Status
                        </label>
                        <select
                            id="project-status"
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5"
                        >
                            <option value="TODO">To do</option>
                            <option value="IN_PROGRESS">In progress</option>
                            <option value="ON_HOLD">On hold</option>
                            <option value="COMPLETED">Completed</option>
                        </select>
                    </div>

                    <div>
                        <label
                            htmlFor="project-team"
                            className="mb-1.5 block text-sm font-medium text-gray-700"
                        >
                            Assign a team <span className="text-gray-400">(optional)</span>
                        </label>

                        <select
                            id="project-team"
                            name="teamId"
                            value={form.teamId}
                            onChange={handleChange}
                            disabled={loadingTeams}
                            className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 disabled:bg-gray-50"
                        >
                            <option value="">
                                {loadingTeams ? "Loading teams..." : "No team assigned"}
                            </option>

                            {teams.map((team) => (
                                <option key={team.id} value={team.id}>
                                    {team.name || `Team ${team.id}`}
                                </option>
                            ))}
                        </select>

                        {!loadingTeams && teams.length === 0 && !error && (
                            <p className="mt-1 text-xs text-gray-500">
                                No teams found. You can create this project without a team.
                            </p>
                        )}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label
                                htmlFor="project-start-date"
                                className="mb-1.5 block text-sm font-medium text-gray-700"
                            >
                                Start date
                            </label>
                            <input
                                id="project-start-date"
                                type="date"
                                name="startDate"
                                value={form.startDate}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-gray-300 px-3 py-2.5"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="project-deadline"
                                className="mb-1.5 block text-sm font-medium text-gray-700"
                            >
                                Deadline
                            </label>
                            <input
                                id="project-deadline"
                                type="date"
                                name="deadline"
                                value={form.deadline}
                                min={form.startDate || undefined}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-gray-300 px-3 py-2.5"
                            />
                        </div>
                    </div>

                    {error && (
                        <p
                            role="alert"
                            className="rounded-xl bg-red-50 p-3 text-sm text-red-700"
                        >
                            {error}
                        </p>
                    )}

                    <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? "Creating..." : "Create project"}
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
}

export default AddProjectModal;
