
function ProjectDetailsPage({ project }) {
    // UI-only demo data. Replace with real project data later.
    const members = [
        { name: "Aarav Sharma", role: "Project Manager", initials: "AS", color: "bg-violet-100 text-violet-700" },
        { name: "Priya Verma", role: "Frontend Developer", initials: "PV", color: "bg-pink-100 text-pink-700" },
        { name: "Rahul Mehta", role: "Backend Developer", initials: "RM", color: "bg-blue-100 text-blue-700" },
        { name: "Sneha Reddy", role: "QA Engineer", initials: "SR", color: "bg-emerald-100 text-emerald-700" },
    ];

    const tasks = [
        { title: "Design project dashboard", assignee: "Priya Verma", status: "COMPLETED", priority: "HIGH", due: "Oct 12" },
        { title: "Implement authentication API", assignee: "Rahul Mehta", status: "IN_PROGRESS", priority: "HIGH", due: "Oct 15" },
        { title: "Write integration tests", assignee: "Sneha Reddy", status: "TODO", priority: "MEDIUM", due: "Oct 18" },
        { title: "Review project requirements", assignee: "Aarav Sharma", status: "COMPLETED", priority: "LOW", due: "Oct 10" },
    ];

    const activities = [
        { initials: "PV", color: "bg-pink-100 text-pink-700", text: "Priya Verma completed", item: "Design project dashboard", time: "2 hours ago" },
        { initials: "RM", color: "bg-blue-100 text-blue-700", text: "Rahul Mehta updated", item: "Authentication API", time: "5 hours ago" },
        { initials: "AS", color: "bg-violet-100 text-violet-700", text: "Aarav Sharma created", item: "Project requirements", time: "Yesterday" },
    ];

    const statusStyles = {
        COMPLETED: "bg-emerald-50 text-emerald-700",
        IN_PROGRESS: "bg-blue-50 text-blue-700",
        TODO: "bg-amber-50 text-amber-700",
    };

    const priorityStyles = {
        HIGH: "text-red-600 bg-red-50",
        MEDIUM: "text-amber-700 bg-amber-50",
        LOW: "text-slate-600 bg-slate-100",
    };

    return (
        <div className="min-h-screen bg-[#f7f8fc] text-slate-800">
            <div className="mx-auto max-w-7xl space-y-7">

                {/* Breadcrumb and actions */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="text-sm text-slate-400">
                            Workspace / Projects / Project Details
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                            Project ID: {project?.id ?? "PRJ-001"}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-violet-300 hover:text-violet-700"
                        >
                            ✎ Edit Project
                        </button>

                        <button
                            type="button"
                            className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700"
                        >
                            + Add Task
                        </button>
                    </div>
                </div>

                {/* Project hero */}
                <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 via-violet-600 to-indigo-600 p-6 text-white shadow-xl shadow-violet-200/50 sm:p-9">
                    <div className="absolute -right-12 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />

                    <div className="relative">
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-2xl font-bold">
                                {(project?.name || "P").charAt(0).toUpperCase()}
                            </span>

                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="text-2xl font-bold sm:text-3xl">
                                        {project?.name || "Website Redesign"}
                                    </h1>

                                    <span className="rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs font-medium">
                                        {project?.status || "IN_PROGRESS"}
                                    </span>
                                </div>

                                <p className="mt-2 max-w-2xl text-sm leading-6 text-violet-100">
                                    {project?.description ||
                                        "A central place to manage the project, coordinate your team, and track delivery."}
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 grid grid-cols-2 gap-5 border-t border-white/20 pt-6 sm:grid-cols-4">
                            <div>
                                <p className="text-sm text-violet-200">Project Manager</p>
                                <p className="mt-1 font-semibold">Aarav Sharma</p>
                            </div>

                            <div>
                                <p className="text-sm text-violet-200">Start Date</p>
                                <p className="mt-1 font-semibold">Oct 01, 2026</p>
                            </div>

                            <div>
                                <p className="text-sm text-violet-200">Deadline</p>
                                <p className="mt-1 font-semibold">
                                    {project?.deadline || "Oct 30, 2026"}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-violet-200">Team Members</p>
                                <p className="mt-1 font-semibold">{members.length} members</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* KPI cards */}
                <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
                    {[
                        { label: "Total Tasks", value: "24", note: "Across this project", icon: "▤", style: "bg-violet-50 text-violet-700" },
                        { label: "Completed", value: "12", note: "50% of all tasks", icon: "✓", style: "bg-emerald-50 text-emerald-700" },
                        { label: "In Progress", value: "7", note: "Currently being worked on", icon: "↗", style: "bg-blue-50 text-blue-700" },
                        { label: "To Do", value: "5", note: "Waiting to be started", icon: "◷", style: "bg-amber-50 text-amber-700" },
                    ].map((stat) => (
                        <div
                            key={stat.label}
                            className="rounded-2xl border border-slate-200/80 bg-white p-5 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/60"
                        >
                            <div className="flex items-center justify-between gap-2">
                                <p className="text-sm text-slate-500">{stat.label}</p>
                                <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${stat.style}`}>
                                    {stat.icon}
                                </span>
                            </div>

                            <p className="mt-4 text-3xl font-bold text-slate-900">
                                {stat.value}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">{stat.note}</p>
                        </div>
                    ))}
                </section>

                {/* Progress and team */}
                <section className="grid gap-6 lg:grid-cols-3">

                    {/* Project progress */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 lg:col-span-1">
                        <div className="flex items-center justify-between">
                            <h2 className="font-semibold text-slate-900">
                                Project Progress
                            </h2>
                            <span className="rounded-lg bg-violet-50 px-2.5 py-1 text-sm font-bold text-violet-700">
                                50%
                            </span>
                        </div>

                        <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-100">
                            <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-500" />
                        </div>

                        <p className="mt-3 text-sm text-slate-500">
                            12 of 24 tasks completed
                        </p>

                        <div className="mt-7 space-y-5">
                            {[
                                { label: "Completed", value: "12 tasks", width: "50%", color: "bg-emerald-500" },
                                { label: "In Progress", value: "7 tasks", width: "29%", color: "bg-blue-500" },
                                { label: "To Do", value: "5 tasks", width: "21%", color: "bg-amber-400" },
                            ].map((item) => (
                                <div key={item.label}>
                                    <div className="mb-2 flex justify-between text-sm">
                                        <span className="text-slate-600">{item.label}</span>
                                        <span className="font-medium text-slate-800">{item.value}</span>
                                    </div>
                                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                        <div className={`h-full rounded-full ${item.color}`} style={{ width: item.width }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Team members */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 lg:col-span-2">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h2 className="font-semibold text-slate-900">
                                    Project Team
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    People collaborating on this project
                                </p>
                            </div>

                            <button
                                type="button"
                                className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-violet-200 hover:text-violet-700"
                            >
                                + Add Member
                            </button>
                        </div>

                        <div className="mt-5 divide-y divide-slate-100">
                            {members.map((member, index) => (
                                <div
                                    key={member.name}
                                    className="flex items-center gap-3 py-4"
                                >
                                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold ${member.color}`}>
                                        {member.initials}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-slate-800">
                                            {member.name}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500">
                                            {member.role}
                                        </p>
                                    </div>

                                    <div className="hidden text-right sm:block">
                                        <p className="text-sm font-semibold text-slate-700">
                                            {[6, 8, 5, 4][index]} tasks
                                        </p>
                                        <p className="mt-1 text-xs text-slate-400">
                                            Assigned
                                        </p>
                                    </div>

                                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                                        Active
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Tasks table */}
                <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
                    <div className="flex flex-wrap items-center justify-between gap-3 p-6">
                        <div>
                            <h2 className="font-semibold text-slate-900">
                                Project Tasks
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Review tasks, owners, priorities, and deadlines
                            </p>
                        </div>

                        <button
                            type="button"
                            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:border-violet-200 hover:text-violet-700"
                        >
                            View All Tasks →
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[650px] text-left">
                            <thead className="border-y border-slate-100 bg-slate-50">
                                <tr className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    <th className="px-6 py-4">Task</th>
                                    <th className="px-6 py-4">Assignee</th>
                                    <th className="px-6 py-4">Priority</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Due Date</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {tasks.map((task) => (
                                    <tr key={task.title} className="transition hover:bg-slate-50/70">
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-semibold text-slate-800">
                                                {task.title}
                                            </p>
                                        </td>

                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {task.assignee}
                                        </td>

                                        <td className="px-6 py-4">
                                            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${priorityStyles[task.priority]}`}>
                                                {task.priority}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4">
                                            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[task.status]}`}>
                                                {task.status.replace("_", " ")}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {task.due}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="border-t border-slate-100 px-6 py-4 text-xs text-slate-400">
                        Showing sample tasks for UI preview
                    </div>
                </section>

                {/* Recent activity */}
                <section className="rounded-2xl border border-slate-200/80 bg-white p-6">
                    <div>
                        <h2 className="font-semibold text-slate-900">
                            Recent Activity
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            A timeline of recent project updates
                        </p>
                    </div>

                    <div className="mt-6 space-y-6">
                        {activities.map((activity) => (
                            <div key={activity.item} className="flex gap-3">
                                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ${activity.color}`}>
                                    {activity.initials}
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="text-sm text-slate-700">
                                        {activity.text}{" "}
                                        <span className="font-semibold text-slate-900">
                                            {activity.item}
                                        </span>
                                    </p>
                                    <p className="mt-1 text-xs text-slate-400">
                                        {activity.time}
                                    </p>
                                </div>

                                <span className="text-slate-300">•</span>
                            </div>
                        ))}
                    </div>
                </section>

                <footer className="pb-6 text-center text-xs text-slate-400">
                    TeamFlow · Make teamwork flow.
                </footer>
            </div>
        </div>
    );
}

export default ProjectDetailsPage;
