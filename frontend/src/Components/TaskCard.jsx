
function formatDate(value) {
    if (!value) return "No deadline";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "No deadline";

    return date.toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

function Badge({ children, className = "" }) {
    return (
        <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${className}`}
        >
            {children}
        </span>
    );
}

export default function TaskCard({
    task,
    projects = [],
    users = [],
    onEdit,
    onDelete,
}) {
    const projectId = String(task.projectId ?? "");
    const assignedTo = String(task.assignedTo ?? "");

    const project = projects.find(
        (item) => String(item.id ?? item._id ?? "") === projectId
    );

    const assignee = users.find(
        (user) => String(user.id ?? "") === assignedTo
    );

    const status = String(task.status || "TODO").toUpperCase();
    const priority = String(task.priority || "MEDIUM").toUpperCase();

    const statusStyles = {
        TODO: "bg-slate-100 text-slate-700",
        IN_PROGRESS: "bg-blue-50 text-blue-700",
        DONE: "bg-emerald-50 text-emerald-700",
    };

    const priorityStyles = {
        LOW: "bg-slate-100 text-slate-600",
        MEDIUM: "bg-amber-50 text-amber-700",
        HIGH: "bg-red-50 text-red-700",
    };

    const statusLabels = {
        TODO: "To do",
        IN_PROGRESS: "In progress",
        DONE: "Done",
    };

    return (
        <article className="flex h-full min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-100/50">
            <div className="flex flex-wrap items-center gap-2">
                <Badge className={statusStyles[status] || statusStyles.TODO}>
                    {statusLabels[status] || status}
                </Badge>

                <Badge className={priorityStyles[priority] || priorityStyles.MEDIUM}>
                    {priority.charAt(0) + priority.slice(1).toLowerCase()} priority
                </Badge>
            </div>

            <h3 className="mt-4 break-words text-base font-semibold text-slate-900">
                {task.title || "Untitled task"}
            </h3>

            <p className="mt-2 min-h-10 whitespace-pre-wrap break-words text-sm leading-5 text-slate-500">
                {task.description || "No description provided."}
            </p>

            <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">
                <div>
                    <p className="text-xs font-medium text-slate-400">
                        Project
                    </p>
                    <p className="mt-1 break-words text-sm font-medium text-slate-700">
                        {project?.name || "Project unavailable"}
                    </p>
                </div>

                <div>
                    <p className="text-xs font-medium text-slate-400">
                        Assigned to
                    </p>
                    <p className="mt-1 break-words text-sm font-medium text-slate-700">
                        {assignee
                            ? `${assignee.name || "Unnamed user"}${assignee.email ? ` (${assignee.email})` : ""}`
                            : "User unavailable"}
                    </p>
                </div>

                <div>
                    <p className="text-xs font-medium text-slate-400">
                        Deadline
                    </p>
                    <p className="mt-1 text-sm text-slate-700">
                        {formatDate(task.deadline)}
                    </p>
                </div>
            </div>

            <div className="mt-auto flex gap-2 border-t border-slate-100 pt-4">
                <button
                    type="button"
                    onClick={() => onEdit(task)}
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
                >
                    Edit
                </button>

                <button
                    type="button"
                    onClick={() => onDelete(task)}
                    className="flex-1 rounded-lg border border-red-100 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                >
                    Delete
                </button>
            </div>
        </article>
    );
}
