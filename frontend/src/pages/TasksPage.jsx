
import { useCallback, useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
    createTask,
    deleteTask,
    getAllUsers,
    getTasks,
    updateTask,
} from "../services/TaskService";
import TaskCard from "../components/TaskCard";
import TaskModal from "../components/TaskModal";

function getErrorMessage(error) {
    const message = error?.message || "Something went wrong.";

    try {
        const start = message.indexOf("{");

        if (start !== -1) {
            const parsed = JSON.parse(message.slice(start));
            return parsed.message || parsed.error || message;
        }
    } catch {
        // Keep the original error.
    }

    return message;
}

export default function TasksPage() {
    const outlet = useOutletContext() || {};
    const projects = Array.isArray(outlet.projects) ? outlet.projects : [];

    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);

    const [loading, setLoading] = useState(true);
    const [usersLoading, setUsersLoading] = useState(true);
    const [error, setError] = useState("");
    const [usersError, setUsersError] = useState("");
    const [notice, setNotice] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [priorityFilter, setPriorityFilter] = useState("ALL");

    const [modalOpen, setModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState("");

    const loadTasks = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const data = await getTasks();

            console.log("Tasks API:", data);
            setTasks(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Tasks API failed:", err);
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }, []);

    const loadUsers = useCallback(async () => {
        setUsersLoading(true);
        setUsersError("");

        try {
            // Same function, endpoint and JWT handling as TeamsPage.
            const data = await getAllUsers();

            console.log("Users API:", data);
            setUsers(Array.isArray(data) ? data : []);

            if (!Array.isArray(data)) {
                setUsersError(
                    "The users API did not return a list. Check its response in the console."
                );
            }
        } catch (err) {
            console.error("Users API failed:", err);
            setUsers([]);
            setUsersError(getErrorMessage(err));
        } finally {
            setUsersLoading(false);
        }
    }, []);

    useEffect(() => {
        loadTasks();
        loadUsers();
    }, [loadTasks, loadUsers]);

    const filteredTasks = useMemo(() => {
        const query = search.trim().toLowerCase();

        return tasks.filter((task) => {
            const title = String(task.title ?? "").toLowerCase();
            const description = String(task.description ?? "").toLowerCase();
            const id = String(task.id ?? task._id ?? "").toLowerCase();
            const status = String(task.status || "TODO").toUpperCase();
            const priority = String(task.priority || "MEDIUM").toUpperCase();

            const matchesSearch =
                !query ||
                title.includes(query) ||
                description.includes(query) ||
                id.includes(query);

            const matchesStatus =
                statusFilter === "ALL" || status === statusFilter;

            const matchesPriority =
                priorityFilter === "ALL" || priority === priorityFilter;

            return matchesSearch && matchesStatus && matchesPriority;
        });
    }, [tasks, search, statusFilter, priorityFilter]);

    const counts = useMemo(() => {
        return {
            all: tasks.length,
            todo: tasks.filter(
                (task) => String(task.status || "TODO").toUpperCase() === "TODO"
            ).length,
            inProgress: tasks.filter(
                (task) =>
                    String(task.status || "").toUpperCase() === "IN_PROGRESS"
            ).length,
            done: tasks.filter(
                (task) => String(task.status || "").toUpperCase() === "DONE"
            ).length,
        };
    }, [tasks]);

    function openCreateModal() {
        setEditingTask(null);
        setError("");
        setNotice("");
        setModalOpen(true);
    }

    function openEditModal(task) {
        setEditingTask(task);
        setError("");
        setNotice("");
        setModalOpen(true);
    }

    async function handleSaveTask(payload) {
        setSaving(true);
        setError("");
        setNotice("");

        try {
            if (editingTask) {
                const id = editingTask.id ?? editingTask._id;

                await updateTask(id, payload);
                setNotice("Task updated successfully.");
            } else {
                await createTask(payload);
                setNotice("Task created successfully.");
            }

            setModalOpen(false);
            setEditingTask(null);

            await loadTasks();
        } catch (err) {
            setError(getErrorMessage(err));
            throw err;
        } finally {
            setSaving(false);
        }
    }

    async function handleDeleteTask(task) {
        const id = task.id ?? task._id;

        if (!id) {
            setError("Cannot delete this task because its ID is missing.");
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to delete "${task.title || "this task"}"?`
        );

        if (!confirmed) return;

        setDeletingId(String(id));
        setError("");
        setNotice("");

        try {
            await deleteTask(id);

            setTasks((previous) =>
                previous.filter(
                    (item) => String(item.id ?? item._id) !== String(id)
                )
            );

            setNotice("Task deleted successfully.");
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setDeletingId("");
        }
    }

    return (
        <div className="space-y-6">
            {/* Page heading */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <p className="text-sm font-medium text-violet-600">
                        Workspace
                    </p>

                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                        Tasks
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Create tasks, assign teammates and track progress.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={openCreateModal}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
                >
                    <span className="text-lg leading-none">+</span>
                    Create task
                </button>
            </div>

            {/* Success message */}
            {notice && (
                <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    <span>{notice}</span>

                    <button
                        type="button"
                        onClick={() => setNotice("")}
                        aria-label="Dismiss notification"
                        className="ml-3 font-semibold"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* Task API error */}
            {error && !modalOpen && (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <span>{error}</span>

                    <button
                        type="button"
                        onClick={() => setError("")}
                        aria-label="Dismiss error"
                        className="font-semibold"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* Summary cards */}
            <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
                <SummaryCard
                    label="All tasks"
                    value={loading ? "—" : counts.all}
                    icon="▤"
                    color="violet"
                />

                <SummaryCard
                    label="To do"
                    value={loading ? "—" : counts.todo}
                    icon="○"
                    color="blue"
                />

                <SummaryCard
                    label="In progress"
                    value={loading ? "—" : counts.inProgress}
                    icon="◷"
                    color="amber"
                />

                <SummaryCard
                    label="Completed"
                    value={loading ? "—" : counts.done}
                    icon="✓"
                    color="emerald"
                />
            </div>

            {/* Search and filters */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-col gap-4">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            All tasks
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Search and filter tasks by status or priority.
                        </p>
                    </div>

                    <div className="grid gap-3 md:grid-cols-3">
                        <div className="relative">
                            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                ⌕
                            </span>

                            <input
                                type="search"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search tasks..."
                                aria-label="Search tasks"
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100"
                            />
                        </div>

                        <select
                            value={statusFilter}
                            onChange={(event) => setStatusFilter(event.target.value)}
                            aria-label="Filter by status"
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                        >
                            <option value="ALL">All statuses</option>
                            <option value="TODO">To do</option>
                            <option value="IN_PROGRESS">In progress</option>
                            <option value="DONE">Done</option>
                        </select>

                        <select
                            value={priorityFilter}
                            onChange={(event) => setPriorityFilter(event.target.value)}
                            aria-label="Filter by priority"
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                        >
                            <option value="ALL">All priorities</option>
                            <option value="LOW">Low priority</option>
                            <option value="MEDIUM">Medium priority</option>
                            <option value="HIGH">High priority</option>
                        </select>
                    </div>
                </div>

                {/* Users API warning */}
                {usersError && (
                    <div className="mt-5 flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm font-semibold text-amber-900">
                                Could not load users
                            </p>

                            <p className="mt-1 break-words text-sm text-amber-800">
                                {usersError}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={loadUsers}
                            disabled={usersLoading}
                            className="shrink-0 rounded-lg border border-amber-300 px-3 py-2 text-sm font-semibold text-amber-900 hover:bg-amber-100 disabled:opacity-50"
                        >
                            {usersLoading ? "Loading..." : "Retry"}
                        </button>
                    </div>
                )}

                {/* Tasks list */}
                {loading ? (
                    <div className="grid gap-4 pt-6 sm:grid-cols-2 xl:grid-cols-3">
                        {[1, 2, 3].map((item) => (
                            <div
                                key={item}
                                className="animate-pulse rounded-2xl border border-slate-200 p-5"
                            >
                                <div className="h-5 w-24 rounded-full bg-slate-100" />
                                <div className="mt-5 h-4 w-2/3 rounded bg-slate-100" />
                                <div className="mt-3 h-3 w-full rounded bg-slate-100" />
                                <div className="mt-2 h-3 w-4/5 rounded bg-slate-100" />
                                <div className="mt-6 h-16 rounded bg-slate-100" />
                            </div>
                        ))}
                    </div>
                ) : error && tasks.length === 0 ? (
                    <div className="py-14 text-center">
                        <p className="text-sm text-red-600">{error}</p>

                        <button
                            type="button"
                            onClick={loadTasks}
                            className="mt-4 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
                        >
                            Retry loading tasks
                        </button>
                    </div>
                ) : filteredTasks.length === 0 ? (
                    <div className="py-16 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-2xl text-violet-600">
                            ▤
                        </div>

                        <h3 className="mt-4 font-semibold text-slate-900">
                            {tasks.length === 0
                                ? "No tasks yet"
                                : "No matching tasks"}
                        </h3>

                        <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
                            {tasks.length === 0
                                ? "Create your first task and assign it to a teammate."
                                : "Try changing your search or filters."}
                        </p>

                        {tasks.length === 0 && (
                            <button
                                type="button"
                                onClick={openCreateModal}
                                className="mt-5 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
                            >
                                Create your first task
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="mt-6 flex items-center justify-between">
                            <p className="text-sm text-slate-500">
                                Showing{" "}
                                <span className="font-semibold text-slate-700">
                                    {filteredTasks.length}
                                </span>{" "}
                                of {tasks.length} tasks
                            </p>

                            <button
                                type="button"
                                onClick={() => {
                                    setSearch("");
                                    setStatusFilter("ALL");
                                    setPriorityFilter("ALL");
                                }}
                                className="text-sm font-medium text-violet-600 hover:text-violet-700"
                            >
                                Clear filters
                            </button>
                        </div>

                        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            {filteredTasks.map((task) => (
                                <TaskCard
                                    key={task.id ?? task._id}
                                    task={task}
                                    projects={projects}
                                    users={users}
                                    onEdit={openEditModal}
                                    onDelete={handleDeleteTask}
                                />
                            ))}
                        </div>

                        {deletingId && (
                            <p className="mt-4 text-sm text-slate-500">
                                Deleting task...
                            </p>
                        )}
                    </>
                )}
            </section>

            {/* Create / edit task modal */}
            {modalOpen && (
                <TaskModal
                    task={editingTask}
                    projects={projects}
                    users={users}
                    usersLoading={usersLoading}
                    saving={saving}
                    onClose={() => {
                        if (!saving) {
                            setModalOpen(false);
                            setEditingTask(null);
                        }
                    }}
                    onSave={handleSaveTask}
                />
            )}
        </div>
    );
}

function SummaryCard({ label, value, icon, color }) {
    const styles = {
        violet: "bg-violet-50 text-violet-700",
        blue: "bg-blue-50 text-blue-700",
        amber: "bg-amber-50 text-amber-700",
        emerald: "bg-emerald-50 text-emerald-700",
    };

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-slate-500">{label}</p>

                <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl ${styles[color]}`}
                >
                    {icon}
                </div>
            </div>

            <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
                {value}
            </p>
        </div>
    );
}
