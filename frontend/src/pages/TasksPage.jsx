
import { useCallback, useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";

import {
  createTask,
  deleteTask,
  getAllUsers,
  getTasks,
  updateTask,
  updateTaskStatus,
} from "../services/TaskService";

import TaskCard from "../components/TaskCard";
import TaskModal from "../components/TaskModal";

const STATUS_OPTIONS = [
  { value: "ALL", label: "All statuses" },
  { value: "TODO", label: "To do" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "DONE", label: "Done" },
];

const PRIORITY_OPTIONS = [
  { value: "ALL", label: "All priorities" },
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "URGENT", label: "Urgent" },
];

function getId(item) {
  return item?.id ?? item?._id;
}

function TaskCount({ label, count, color }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${color}`}>{count}</p>
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div className="min-w-0">
      <label className="mb-1.5 block text-xs font-semibold text-slate-500">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function TasksPage() {
  const outlet = useOutletContext() || {};
  const projects = outlet.projects || [];
  const currentUser = outlet.currentUser || null;
  const role = String(currentUser?.role || "").replace(/^ROLE_/, "").toUpperCase();
  const canManageTasks = role === "ADMIN" || role === "MANAGER";

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

  const [statusUpdatingId, setStatusUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getTasks();

      if (!Array.isArray(data)) {
        throw new Error("The server returned an unexpected tasks response.");
      }

      setTasks(data);
    } catch (err) {
      setError(err.message || "Unable to load tasks.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    if (role === "USER") {
      setUsers([]);
      setUsersLoading(false);
      setUsersError("");
      return;
    }
    setUsersLoading(true);
    setUsersError("");

    try {
      const data = await getAllUsers();

      if (!Array.isArray(data)) {
        throw new Error("The server returned an unexpected users response.");
      }

      setUsers(data);
    } catch (err) {
      console.error("Users API failed:", err);
      setUsersError(err.message || "Unable to load users.");
    } finally {
      setUsersLoading(false);
    }
  }, [role]);

  useEffect(() => {
    loadTasks();
    if (role) loadUsers();
  }, [loadTasks, loadUsers, role]);

  const visibleTasks = useMemo(() => {
    if (!currentUser || !role) return [];
    if (role === "ADMIN") return tasks;
    if (role === "MANAGER") {
      const projectIds = new Set(projects.map((project) => String(getId(project))));
      return tasks.filter((task) => projectIds.has(String(task.projectId)));
    }
    return tasks.filter((task) => String(task.assignedTo) === String(currentUser.id));
  }, [tasks, projects, currentUser, role]);

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();

    return visibleTasks.filter((task) => {
      const matchesSearch =
        !query ||
        (task.title || "").toLowerCase().includes(query) ||
        (task.description || "").toLowerCase().includes(query) ||
        String(getId(task) ?? "").toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "ALL" ||
        (task.status || "TODO").toUpperCase() === statusFilter;

      const matchesPriority =
        priorityFilter === "ALL" ||
        (task.priority || "MEDIUM").toUpperCase() === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [visibleTasks, search, statusFilter, priorityFilter]);

  const todoCount = visibleTasks.filter(
    (task) => (task.status || "TODO").toUpperCase() === "TODO"
  ).length;

  const inProgressCount = visibleTasks.filter(
    (task) => (task.status || "").toUpperCase() === "IN_PROGRESS"
  ).length;

  const doneCount = visibleTasks.filter(
    (task) => (task.status || "").toUpperCase() === "DONE"
  ).length;

  function openCreateModal() {
    setEditingTask(null);
    setNotice("");
    setModalOpen(true);
  }

  function openEditModal(task) {
    setEditingTask(task);
    setNotice("");
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;

    setModalOpen(false);
    setEditingTask(null);
  }

  async function handleSaveTask(payload) {
    setSaving(true);
    setError("");
    setNotice("");

    try {
      if (editingTask) {
        const id = getId(editingTask);
        const updatedTask = await updateTask(id, payload);

        setTasks((previous) =>
          previous.map((task) =>
            String(getId(task)) === String(id)
              ? {
                  ...task,
                  ...payload,
                  ...(updatedTask && typeof updatedTask === "object"
                    ? updatedTask
                    : {}),
                }
              : task
          )
        );

        setNotice("Task updated successfully.");
      } else {
        const createdTask = await createTask(payload);

        if (createdTask && typeof createdTask === "object") {
          setTasks((previous) => [
            createdTask,
            ...previous.filter(
              (task) =>
                String(getId(task)) !== String(getId(createdTask))
            ),
          ]);
        } else {
          await loadTasks();
        }

        setNotice("Task created successfully.");
      }

      setModalOpen(false);
      setEditingTask(null);
    } catch (err) {
      setError(err.message || "Unable to save task.");
      throw err;
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(task, nextStatus) {
    const id = getId(task);

    if (id == null) {
      setError("Cannot update status because this task has no ID.");
      throw new Error("Task ID is missing.");
    }

    if (nextStatus === (task.status || "TODO").toUpperCase()) {
      return;
    }

    setStatusUpdatingId(String(id));
    setError("");
    setNotice("");

    try {
      const updatedTask = await updateTaskStatus(id, task, nextStatus);

      setTasks((previous) =>
        previous.map((item) =>
          String(getId(item)) === String(id)
            ? {
                ...item,
                ...(updatedTask && typeof updatedTask === "object"
                  ? updatedTask
                  : {}),
                status: nextStatus,
              }
            : item
        )
      );

      setNotice(`Task status changed to ${nextStatus.replace("_", " ")}.`);
    } catch (err) {
      setError(err.message || "Unable to update task status.");
      throw err;
    } finally {
      setStatusUpdatingId(null);
    }
  }

  async function handleDeleteTask(task) {
    const id = getId(task);

    if (id == null) {
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
          (item) => String(getId(item)) !== String(id)
        )
      );

      setNotice("Task deleted successfully.");
    } catch (err) {
      setError(err.message || "Unable to delete task.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="space-y-6">
      {/* Page heading */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">Workspace / Tasks</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Tasks
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Manage work, update progress, and keep your projects moving.
          </p>
        </div>

        {canManageTasks && <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:ring-offset-2"
        >
          <span className="text-lg leading-none">+</span>
          Create Task
        </button>}
      </header>

      {/* Alerts */}
      {error && (
        <div
          role="alert"
          className="flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
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

      {notice && (
        <div
          role="status"
          className="flex items-start justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
        >
          <span>{notice}</span>
          <button
            type="button"
            onClick={() => setNotice("")}
            aria-label="Dismiss notification"
            className="font-semibold"
          >
            ×
          </button>
        </div>
      )}

      {usersError && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Could not load the users list: {usersError}
          <button
            type="button"
            onClick={loadUsers}
            className="ml-2 font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Counts */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <TaskCount
          label="Total tasks"
          count={tasks.length}
          color="text-slate-900"
        />
        <TaskCount
          label="To do"
          count={todoCount}
          color="text-amber-600"
        />
        <TaskCount
          label="In progress"
          count={inProgressCount}
          color="text-blue-600"
        />
        <TaskCount
          label="Completed"
          count={doneCount}
          color="text-emerald-600"
        />
      </div>

      {/* Search and filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="md:col-span-1">
            <label
              htmlFor="task-search"
              className="mb-1.5 block text-xs font-semibold text-slate-500"
            >
              Search tasks
            </label>

            <input
              id="task-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search title, description, or ID..."
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            />
          </div>

          <SelectField
            label="Status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={STATUS_OPTIONS}
          />

          <SelectField
            label="Priority"
            value={priorityFilter}
            onChange={setPriorityFilter}
            options={PRIORITY_OPTIONS}
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-slate-400">
            Showing {filteredTasks.length} of {visibleTasks.length} tasks
          </p>

          {(search || statusFilter !== "ALL" || priorityFilter !== "ALL") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("ALL");
                setPriorityFilter("ALL");
              }}
              className="text-xs font-semibold text-violet-700 hover:text-violet-900"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Task list */}
      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-16 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600" />
          <p className="mt-4 text-sm text-slate-500">Loading tasks...</p>
        </div>
      ) : error && tasks.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-12 text-center">
          <p className="text-sm text-slate-600">
            Unable to load your tasks.
          </p>
          <button
            type="button"
            onClick={loadTasks}
            className="mt-4 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
          >
            Try again
          </button>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-2xl text-violet-600">
            ✓
          </div>

          <h2 className="mt-4 text-base font-semibold text-slate-900">
            {tasks.length === 0 ? "No tasks yet" : "No matching tasks"}
          </h2>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
            {tasks.length === 0
              ? "Create your first task to start tracking work in TeamFlow."
              : "Try changing your search or filters to find the task you're looking for."}
          </p>

          {canManageTasks && visibleTasks.length === 0 && (
            <button
              type="button"
              onClick={openCreateModal}
              className="mt-5 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
            >
              Create your first task
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {filteredTasks.map((task) => {
            const id = getId(task);

            return (
              <TaskCard
                key={id ?? task.title}
                task={task}
                projects={projects}
                users={users}
                canEdit={canManageTasks}
                canDelete={canManageTasks}
                onEdit={openEditModal}
                onDelete={handleDeleteTask}
                onStatusChange={handleStatusChange}
                statusUpdating={statusUpdatingId === String(id)}
                deleting={deletingId === String(id)}
              />
            );
          })}
        </div>
      )}

      {/* Existing create/edit modal */}
      {modalOpen && canManageTasks && (
        <TaskModal
          task={editingTask}
          projects={projects}
          users={users}
          usersLoading={usersLoading}
          saving={saving}
          onClose={closeModal}
          onSave={handleSaveTask}
        />
      )}
    </section>
  );
}
