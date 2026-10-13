
import { useEffect, useState } from "react";

const statusStyles = {
  TODO: "bg-amber-50 text-amber-700 ring-amber-200",
  IN_PROGRESS: "bg-blue-50 text-blue-700 ring-blue-200",
  DONE: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

const priorityStyles = {
  LOW: "bg-slate-100 text-slate-600",
  MEDIUM: "bg-violet-50 text-violet-700",
  HIGH: "bg-orange-50 text-orange-700",
  URGENT: "bg-red-50 text-red-700",
};

const statusOptions = [
  { value: "TODO", label: "To do" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "DONE", label: "Done" },
];

function formatLabel(value) {
  if (!value) return "Not set";

  return String(value)
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatDate(value) {
  if (!value) return "No deadline";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "No deadline";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function findById(items, id) {
  if (id == null) return null;

  return items.find(
    (item) => String(item.id ?? item._id) === String(id)
  ) || null;
}

export default function TaskCard({
  task,
  projects = [],
  users = [],
  onEdit,
  onDelete,
  onStatusChange,
  canEdit = true,
  canDelete = true,
  statusUpdating = false,
  deleting = false,
}) {
  const [showStatusSelector, setShowStatusSelector] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(
    task.status || "TODO"
  );

  useEffect(() => {
    setSelectedStatus(task.status || "TODO");
  }, [task.status]);

  const project = findById(projects, task.projectId);
  const assignee = findById(users, task.assignedTo);

  const currentStatus = (task.status || "TODO").toUpperCase();
  const currentPriority = (task.priority || "MEDIUM").toUpperCase();

  async function handleStatusUpdate() {
    if (selectedStatus === currentStatus) {
      setShowStatusSelector(false);
      return;
    }

    try {
      await onStatusChange(task, selectedStatus);
      setShowStatusSelector(false);
    } catch {
      // The parent displays the error message.
    }
  }

  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-violet-200 hover:shadow-lg hover:shadow-violet-100/40">
      {/* Task title and status */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="break-words text-base font-semibold text-slate-900">
            {task.title || "Untitled task"}
          </h3>

          <p className="mt-1 break-all text-xs text-slate-400">
            ID: {task.id ?? task._id ?? "N/A"}
          </p>
        </div>

        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
            statusStyles[currentStatus] ||
            "bg-slate-100 text-slate-600 ring-slate-200"
          }`}
        >
          {formatLabel(currentStatus)}
        </span>
      </div>

      {/* Description */}
      <p className="mt-4 line-clamp-3 min-h-[3.75rem] break-words text-sm leading-5 text-slate-500">
        {task.description || "No description provided."}
      </p>

      {/* Project */}
      <div className="mt-4">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          Project
        </p>
        <p className="mt-1 break-words text-sm font-medium text-slate-700">
          {project?.name || project?.title || "Project not found"}
        </p>
      </div>

      {/* Assignee */}
      <div className="mt-3">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          Assignee
        </p>
        <p className="mt-1 break-words text-sm font-medium text-slate-700">
          {assignee
            ? `${assignee.name || "Unnamed user"}${
                assignee.email ? ` (${assignee.email})` : ""
              }`
            : "User not found"}
        </p>
      </div>

      {/* Priority and deadline */}
      <div className="mt-4 flex items-end justify-between gap-3 border-t border-slate-100 pt-4">
        <div>
          <p className="text-xs text-slate-400">Priority</p>
          <span
            className={`mt-1 inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold ${
              priorityStyles[currentPriority] ||
              "bg-slate-100 text-slate-600"
            }`}
          >
            {formatLabel(currentPriority)}
          </span>
        </div>

        <div className="text-right">
          <p className="text-xs text-slate-400">Deadline</p>
          <p className="mt-1 text-sm font-medium text-slate-700">
            {formatDate(task.deadline)}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-auto flex flex-wrap gap-2 border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={() => {
            setSelectedStatus(currentStatus);
            setShowStatusSelector((previous) => !previous);
          }}
          disabled={statusUpdating || deleting}
          className="rounded-xl border border-violet-200 px-3 py-2 text-sm font-medium text-violet-700 transition hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {statusUpdating ? "Updating..." : "Change Status"}
        </button>

        {canEdit && <button
          type="button"
          onClick={() => onEdit(task)}
          disabled={statusUpdating || deleting}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Edit
        </button>}

        {canDelete && <button
          type="button"
          onClick={() => onDelete(task)}
          disabled={statusUpdating || deleting}
          className="rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {deleting ? "Deleting..." : "Delete"}
        </button>}
      </div>

      {/* Compact status selector */}
      {showStatusSelector && (
        <div className="mt-3 rounded-xl border border-violet-100 bg-violet-50/50 p-3">
          <label
            htmlFor={`status-${task.id ?? task._id}`}
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Update task status
          </label>

          <select
            id={`status-${task.id ?? task._id}`}
            value={selectedStatus}
            onChange={(event) => setSelectedStatus(event.target.value)}
            disabled={statusUpdating}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setSelectedStatus(currentStatus);
                setShowStatusSelector(false);
              }}
              disabled={statusUpdating}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleStatusUpdate}
              disabled={
                statusUpdating || selectedStatus === currentStatus
              }
              className="rounded-lg bg-violet-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Save Status
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
