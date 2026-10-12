
import { useEffect, useState } from "react";

const emptyForm = {
    title: "",
    description: "",
    projectId: "",
    assignedTo: "",
    deadline: "",
    priority: "MEDIUM",
    status: "TODO",
};

function toDateTimeLocal(value) {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value).slice(0, 16);
    }

    const local = new Date(
        date.getTime() - date.getTimezoneOffset() * 60000
    );

    return local.toISOString().slice(0, 16);
}

export default function TaskModal({
    task,
    projects = [],
    users = [],
    usersLoading = false,
    saving,
    onClose,
    onSave,
}) {
    const editing = Boolean(task);

    const [form, setForm] = useState(emptyForm);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!task) {
            setForm({
                ...emptyForm,
                projectId: projects[0]?.id ?? projects[0]?._id
                    ? String(projects[0].id ?? projects[0]._id)
                    : "",
            });
        } else {
            setForm({
                title: task.title || "",
                description: task.description || "",
                projectId: String(task.projectId ?? ""),
                assignedTo: String(task.assignedTo ?? ""),
                deadline: toDateTimeLocal(task.deadline),
                priority: task.priority || "MEDIUM",
                status: task.status || "TODO",
            });
        }

        setError("");
    }, [task, projects]);

    function change(event) {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));

        setError("");
    }

    async function submit(event) {
        event.preventDefault();

        if (!form.title.trim()) {
            setError("Please enter a task title.");
            return;
        }

        if (!form.projectId) {
            setError("Please select a project.");
            return;
        }

        if (!form.assignedTo) {
            setError("Please select a user to assign this task to.");
            return;
        }

        if (!form.deadline) {
            setError("Please select a deadline.");
            return;
        }

        const payload = {
            title: form.title.trim(),
            description: form.description.trim(),
            projectId: form.projectId,
            assignedTo: form.assignedTo,
            deadline: form.deadline,
            priority: form.priority,
            ...(editing ? { status: form.status } : {}),
        };

        try {
            await onSave(payload);
        } catch (err) {
            setError(err.message || "Unable to save task.");
        }
    }

    const projectIdOf = (project) =>
        String(project.id ?? project._id ?? "");

    const userIdOf = (user) =>
        String(user.id ?? "");

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/40 p-4"
            onMouseDown={(event) => {
                if (
                    event.target === event.currentTarget &&
                    !saving
                ) {
                    onClose();
                }
            }}
        >
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="task-modal-title"
                className="my-auto max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-7"
            >
                <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                        <p className="text-sm font-medium text-violet-600">
                            TeamFlow / Tasks
                        </p>

                        <h2
                            id="task-modal-title"
                            className="mt-1 text-xl font-bold text-slate-900"
                        >
                            {editing ? "Edit task" : "Create a task"}
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Add the details your team needs to get work done.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        aria-label="Close task form"
                        className="rounded-lg px-3 py-2 text-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={submit} className="space-y-5">
                    <div>
                        <label
                            htmlFor="task-title"
                            className="mb-1.5 block text-sm font-medium text-slate-700"
                        >
                            Task title <span className="text-red-500">*</span>
                        </label>

                        <input
                            id="task-title"
                            name="title"
                            value={form.title}
                            onChange={change}
                            maxLength={150}
                            placeholder="e.g. Build login API"
                            required
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="task-description"
                            className="mb-1.5 block text-sm font-medium text-slate-700"
                        >
                            Description
                        </label>

                        <textarea
                            id="task-description"
                            name="description"
                            value={form.description}
                            onChange={change}
                            rows={3}
                            placeholder="Describe the work and expected outcome..."
                            className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label
                                htmlFor="task-project"
                                className="mb-1.5 block text-sm font-medium text-slate-700"
                            >
                                Project <span className="text-red-500">*</span>
                            </label>

                            <select
                                id="task-project"
                                name="projectId"
                                value={form.projectId}
                                onChange={change}
                                required
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                            >
                                <option value="">Select a project</option>

                                {projects.map((project) => {
                                    const id = projectIdOf(project);

                                    return (
                                        <option key={id} value={id}>
                                            {project.name || "Unnamed project"}
                                        </option>
                                    );
                                })}
                            </select>

                            {projects.length === 0 && (
                                <p className="mt-1 text-xs text-amber-700">
                                    No projects available. Create a project first.
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="task-assignee"
                                className="mb-1.5 block text-sm font-medium text-slate-700"
                            >
                                Assign to <span className="text-red-500">*</span>
                            </label>

                            <select
                                id="task-assignee"
                                name="assignedTo"
                                value={form.assignedTo}
                                onChange={change}
                                required
                                disabled={usersLoading}
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 disabled:bg-slate-100"
                            >
                                <option value="">
                                    {usersLoading
                                        ? "Loading users..."
                                        : users.length
                                            ? "Select a user"
                                            : "No users found"}
                                </option>

                                {users.map((user) => {
                                    const id = userIdOf(user);

                                    if (!id) return null;

                                    return (
                                        <option key={id} value={id}>
                                            {user.name || user.email || id}
                                            {user.email ? ` (${user.email})` : ""}
                                        </option>
                                    );
                                })}
                            </select>

                            {!usersLoading && users.length === 0 && (
                                <p className="mt-1 text-xs text-amber-700">
                                    No users returned by the users API.
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="task-deadline"
                                className="mb-1.5 block text-sm font-medium text-slate-700"
                            >
                                Deadline <span className="text-red-500">*</span>
                            </label>

                            <input
                                id="task-deadline"
                                name="deadline"
                                type="datetime-local"
                                value={form.deadline}
                                onChange={change}
                                required
                                className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="task-priority"
                                className="mb-1.5 block text-sm font-medium text-slate-700"
                            >
                                Priority
                            </label>

                            <select
                                id="task-priority"
                                name="priority"
                                value={form.priority}
                                onChange={change}
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                            >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                            </select>
                        </div>

                        {editing && (
                            <div className="sm:col-span-2">
                                <label
                                    htmlFor="task-status"
                                    className="mb-1.5 block text-sm font-medium text-slate-700"
                                >
                                    Status
                                </label>

                                <select
                                    id="task-status"
                                    name="status"
                                    value={form.status}
                                    onChange={change}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                                >
                                    <option value="TODO">To do</option>
                                    <option value="IN_PROGRESS">In progress</option>
                                    <option value="DONE">Done</option>
                                </select>
                            </div>
                        )}
                    </div>

                    {error && (
                        <p
                            role="alert"
                            className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
                        >
                            {error}
                        </p>
                    )}

                    <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={
                                saving ||
                                projects.length === 0 ||
                                usersLoading ||
                                users.length === 0
                            }
                            className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {saving
                                ? "Saving..."
                                : editing
                                    ? "Save changes"
                                    : "Create task"}
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
}
