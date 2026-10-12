import { useCallback, useEffect, useState } from "react";
import {
    addTeamMember,
    addTeamProject,
    createTeam,
    deleteTeam,
    getAllProjects,
    getAllTeams,
    getAllUsers,
    getCurrentUser,
    getTeamMembers,
    getTeamProjects,
    removeTeamMember,
    removeTeamProject,
    updateTeam,
} from "../services/TeamService";

const emptyForm = {
    name: "",
    description: "",
};

function getErrorMessage(error) {
    const message = error?.message || "Something went wrong.";

    try {
        const start = message.indexOf("{");
        if (start !== -1) {
            const parsed = JSON.parse(message.slice(start));
            return parsed.message || parsed.error || message;
        }
    } catch {
        // Use the original message.
    }

    return message;
}

function formatDate(value) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function getInitials(name = "") {
    return name
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join("") || "T";
}

export default function TeamsPage() {
    const [teams, setTeams] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [projects, setProjects] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [search, setSearch] = useState("");

    const [formOpen, setFormOpen] = useState(false);
    const [editingTeam, setEditingTeam] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const [selectedTeam, setSelectedTeam] = useState(null);
    const [teamMembers, setTeamMembers] = useState([]);
    const [teamProjects, setTeamProjects] = useState([]);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [detailsError, setDetailsError] = useState("");

    const [selectedUserId, setSelectedUserId] = useState("");
    const [selectedProjectId, setSelectedProjectId] = useState("");
    const [memberActionId, setMemberActionId] = useState("");
    const [projectActionId, setProjectActionId] = useState("");

    const role = String(currentUser?.role || "")
        .replace(/^ROLE_/, "")
        .toUpperCase();

    const canManageMembersAndProjects =
        role === "ADMIN" || role === "MANAGER";

    const currentUserId = currentUser?.id;

    const loadTeams = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const [teamsData, userData] = await Promise.all([
                getAllTeams(),
                getCurrentUser(),
            ]);

            setTeams(Array.isArray(teamsData) ? teamsData : []);
            setCurrentUser(userData);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadTeams();
    }, [loadTeams]);

    useEffect(() => {
    console.log("Teams received from API:", teams);
    console.log("Current search:", search);
    console.log("Filtered teams:", filteredTeams);
}, [teams, search]);

    const filteredTeams = teams.filter((team) => {
        const query = search.trim().toLowerCase();

        if (!query) return true;

        const name = String(team.name ?? "").toLowerCase();
        const description = String(team.description ?? "").toLowerCase();
        const id = String(team.id ?? "").toLowerCase();

        return (
            name.includes(query) ||
            description.includes(query) ||
            id.includes(query)
        );
    });


    const myTeams = teams.filter(
        (team) => team.createdBy === currentUserId
    );

    function openCreateModal() {
        setEditingTeam(null);
        setForm(emptyForm);
        setError("");
        setNotice("");
        setFormOpen(true);
    }

    function openEditModal(team) {
        setEditingTeam(team);
        setForm({
            name: team.name || "",
            description: team.description || "",
        });
        setError("");
        setNotice("");
        setFormOpen(true);
    }

    async function handleSaveTeam(event) {
        event.preventDefault();

        if (!form.name.trim() || !form.description.trim()) {
            setError("Please enter both team name and description.");
            return;
        }

        setSaving(true);
        setError("");

        try {
            if (editingTeam) {
                await updateTeam(editingTeam.id, {
                    name: form.name.trim(),
                    description: form.description.trim(),
                });
                setNotice("Team updated successfully.");
            } else {
                await createTeam({
                    name: form.name.trim(),
                    description: form.description.trim(),
                });
                setNotice("Team created successfully.");
            }

            setFormOpen(false);
            setForm(emptyForm);
            setEditingTeam(null);
            await loadTeams();
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setSaving(false);
        }
    }

    async function handleDeleteTeam() {
        if (!deleteTarget) return;

        setDeleting(true);
        setError("");

        try {
            await deleteTeam(deleteTarget.id);

            if (selectedTeam?.id === deleteTarget.id) {
                closeDetails();
            }

            setTeams((previous) =>
                previous.filter((team) => team.id !== deleteTarget.id)
            );
            setDeleteTarget(null);
            setNotice("Team deleted successfully.");
        } catch (err) {
            setError(getErrorMessage(err));
            setDeleteTarget(null);
        } finally {
            setDeleting(false);
        }
    }

    async function openDetails(team) {
        setSelectedTeam(team);
        setTeamMembers([]);
        setTeamProjects([]);
        setDetailsError("");
        setSelectedUserId("");
        setSelectedProjectId("");
        setDetailsLoading(true);

        try {
            const [membersData, projectsData] = await Promise.all([
                getTeamMembers(team.id),
                getTeamProjects(team.id),
            ]);

            setTeamMembers(Array.isArray(membersData) ? membersData : []);
            setTeamProjects(Array.isArray(projectsData) ? projectsData : []);
        } catch (err) {
            setDetailsError(getErrorMessage(err));
        } finally {
            setDetailsLoading(false);
        }
    }

    function closeDetails() {
        setSelectedTeam(null);
        setTeamMembers([]);
        setTeamProjects([]);
        setDetailsError("");
    }


    async function loadManagementOptions() {
        try {
            const [usersResult, projectsResult] = await Promise.allSettled([
                getAllUsers(),
                getAllProjects(),
            ]);

            if (usersResult.status === "fulfilled") {
                const usersData = usersResult.value;
                console.log("Users API:", usersData);

                setUsers(Array.isArray(usersData) ? usersData : []);
            } else {
                console.error("Users API failed:", usersResult.reason);
                setUsers([]);
            }

            if (projectsResult.status === "fulfilled") {
                const projectsData = projectsResult.value;
                console.log("Projects API:", projectsData);

                setProjects(
                    Array.isArray(projectsData) ? projectsData : []
                );
            } else {
                console.error("Projects API failed:", projectsResult.reason);
                setProjects([]);
                setDetailsError(getErrorMessage(projectsResult.reason));
            }
        } catch (err) {
            console.error("Management options error:", err);
            setDetailsError(getErrorMessage(err));
        }
    }


    async function handleAddMember() {
        if (!selectedTeam || !selectedUserId) return;

        setMemberActionId(selectedUserId);
        setDetailsError("");

        try {
            await addTeamMember(selectedTeam.id, selectedUserId);
            const updatedMembers = await getTeamMembers(selectedTeam.id);
            setTeamMembers(updatedMembers);
            setSelectedUserId("");
            await loadTeams();
        } catch (err) {
            setDetailsError(getErrorMessage(err));
        } finally {
            setMemberActionId("");
        }
    }

    async function handleRemoveMember(userId) {
        if (!selectedTeam) return;

        setMemberActionId(userId);
        setDetailsError("");

        try {
            await removeTeamMember(selectedTeam.id, userId);
            setTeamMembers((previous) =>
                previous.filter((member) => member.id !== userId)
            );
            await loadTeams();
        } catch (err) {
            setDetailsError(getErrorMessage(err));
        } finally {
            setMemberActionId("");
        }
    }

    async function handleAddProject() {
        if (!selectedTeam || !selectedProjectId) return;

        setProjectActionId(selectedProjectId);
        setDetailsError("");

        try {
            await addTeamProject(selectedTeam.id, selectedProjectId);
            const updatedProjects = await getTeamProjects(selectedTeam.id);
            setTeamProjects(updatedProjects);
            setSelectedProjectId("");
            await loadTeams();
        } catch (err) {
            setDetailsError(getErrorMessage(err));
        } finally {
            setProjectActionId("");
        }
    }

    async function handleRemoveProject(projectId) {
        if (!selectedTeam) return;

        setProjectActionId(projectId);
        setDetailsError("");

        try {
            await removeTeamProject(selectedTeam.id, projectId);
            setTeamProjects((previous) =>
                previous.filter((project) => project.id !== projectId)
            );
            await loadTeams();
        } catch (err) {
            setDetailsError(getErrorMessage(err));
        } finally {
            setProjectActionId("");
        }
    }

    useEffect(() => {
        if (selectedTeam && canManageMembersAndProjects) {
            loadManagementOptions();
        }
        // Load the options when a team is opened or the role becomes available.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedTeam?.id, canManageMembersAndProjects]);

    return (
        <div className="space-y-6">
            {/* Page heading */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <p className="text-sm font-medium text-violet-600">
                        Workspace
                    </p>
                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                        Teams
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Organize people and projects in one place.
                    </p>
                </div>

                <button
                    onClick={openCreateModal}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
                >
                    <span className="text-lg leading-none">+</span>
                    Create team
                </button>
            </div>

            {/* Feedback */}
            {notice && (
                <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    <span>{notice}</span>
                    <button
                        onClick={() => setNotice("")}
                        className="ml-3 font-semibold"
                        aria-label="Dismiss notification"
                    >
                        ×
                    </button>
                </div>
            )}

            {error && !formOpen && (
                <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <span>{error}</span>
                    <button
                        onClick={() => setError("")}
                        className="ml-3 font-semibold"
                        aria-label="Dismiss error"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* Summary cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <SummaryCard
                    label="Total teams"
                    value={loading ? "—" : teams.length}
                    icon="◫"
                    color="violet"
                />
                <SummaryCard
                    label="Teams created by you"
                    value={loading ? "—" : myTeams.length}
                    icon="♙"
                    color="blue"
                />
                <SummaryCard
                    label="Total team members"
                    value={
                        loading
                            ? "—"
                            : teams.reduce(
                                (total, team) =>
                                    total + (team.memberIds?.length || 0),
                                0
                            )
                    }
                    icon="♧"
                    color="emerald"
                />
            </div>

            {/* Teams list */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            All teams
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Browse teams and manage the ones you created.
                        </p>
                    </div>


                    <div className="relative w-full sm:max-w-xs">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                            ⌕
                        </span>

                        <input
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search teams by name, description or ID..."
                            aria-label="Search teams"
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-9 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100"
                        />

                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch("")}
                                aria-label="Clear team search"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-lg text-slate-400 hover:text-slate-700"
                            >
                                ×
                            </button>
                        )}
                    </div>

                </div>

                {loading ? (
                    <div className="grid gap-4 pt-6 sm:grid-cols-2 xl:grid-cols-3">
                        {[1, 2, 3].map((item) => (
                            <div
                                key={item}
                                className="animate-pulse rounded-2xl border border-slate-200 p-5"
                            >
                                <div className="h-11 w-11 rounded-xl bg-slate-100" />
                                <div className="mt-4 h-4 w-2/3 rounded bg-slate-100" />
                                <div className="mt-3 h-3 w-full rounded bg-slate-100" />
                                <div className="mt-2 h-3 w-4/5 rounded bg-slate-100" />
                            </div>
                        ))}
                    </div>
                ) : filteredTeams.length === 0 ? (
                    <div className="py-16 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-2xl text-violet-600">
                            ♧
                        </div>
                        <h3 className="mt-4 font-semibold text-slate-900">
                            {search ? "No matching teams" : "No teams yet"}
                        </h3>
                        <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
                            {search
                                ? "Try another team name or description."
                                : "Create your first team to start organizing people and projects."}
                        </p>
                        {!search && (
                            <button
                                onClick={openCreateModal}
                                className="mt-5 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
                            >
                                Create your first team
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {filteredTeams.map((team) => {
                            const isCreator =
                                team.createdBy === currentUserId;

                            return (
                                <article
                                    key={team.id}
                                    className="group flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-100/60"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 text-sm font-bold text-violet-700">
                                            {getInitials(team.name)}
                                        </div>

                                        <span
                                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${isCreator
                                                    ? "bg-violet-50 text-violet-700"
                                                    : "bg-slate-100 text-slate-600"
                                                }`}
                                        >
                                            {isCreator ? "Created by you" : "Team"}
                                        </span>
                                    </div>

                                    <h3 className="mt-4 truncate text-base font-semibold text-slate-900">
                                        {team.name}
                                    </h3>

                                    <p className="mt-2 min-h-10 text-sm leading-5 text-slate-500 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden">
                                        {team.description || "No description provided."}
                                    </p>

                                    <div className="mt-5 flex items-center gap-4 border-t border-slate-100 pt-4">
                                        <MiniStat
                                            label="Members"
                                            value={team.memberIds?.length || 0}
                                        />
                                        <div className="h-8 w-px bg-slate-200" />
                                        <MiniStat
                                            label="Projects"
                                            value={team.projectIds?.length || 0}
                                        />
                                    </div>

                                    <div className="mt-5 flex flex-wrap gap-2">
                                        <button
                                            onClick={() => openDetails(team)}
                                            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
                                        >
                                            View details
                                        </button>

                                        {isCreator && (
                                            <>
                                                <button
                                                    onClick={() => openEditModal(team)}
                                                    title="Edit team"
                                                    aria-label={`Edit ${team.name}`}
                                                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => setDeleteTarget(team)}
                                                    title="Delete team"
                                                    aria-label={`Delete ${team.name}`}
                                                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                                                >
                                                    Delete
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Create / edit modal */}
            {formOpen && (
                <Modal
                    title={editingTeam ? "Edit team" : "Create a team"}
                    subtitle={
                        editingTeam
                            ? "Update your team's information."
                            : "Give your new team a name and description."
                    }
                    onClose={() => {
                        if (!saving) {
                            setFormOpen(false);
                            setError("");
                        }
                    }}
                >
                    <form onSubmit={handleSaveTeam} className="space-y-5">
                        {error && (
                            <InlineError message={error} />
                        )}

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Team name
                            </label>
                            <input
                                autoFocus
                                value={form.name}
                                onChange={(event) =>
                                    setForm((previous) => ({
                                        ...previous,
                                        name: event.target.value,
                                    }))
                                }
                                maxLength={100}
                                placeholder="e.g. Backend Engineering"
                                className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Description
                            </label>
                            <textarea
                                value={form.description}
                                onChange={(event) =>
                                    setForm((previous) => ({
                                        ...previous,
                                        description: event.target.value,
                                    }))
                                }
                                rows={4}
                                maxLength={1000}
                                placeholder="What does this team work on?"
                                className="w-full resize-y rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                            />
                        </div>

                        <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                            <button
                                type="button"
                                disabled={saving}
                                onClick={() => {
                                    setFormOpen(false);
                                    setError("");
                                }}
                                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {saving
                                    ? "Saving..."
                                    : editingTeam
                                        ? "Save changes"
                                        : "Create team"}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Delete confirmation */}
            {deleteTarget && (
                <Modal
                    title="Delete this team?"
                    subtitle="This action cannot be undone."
                    onClose={() => !deleting && setDeleteTarget(null)}
                >
                    <div className="rounded-xl border border-red-100 bg-red-50 p-4">
                        <p className="text-sm text-red-800">
                            You're about to delete{" "}
                            <strong>{deleteTarget.name}</strong>.
                        </p>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            disabled={deleting}
                            onClick={() => setDeleteTarget(null)}
                            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            disabled={deleting}
                            onClick={handleDeleteTeam}
                            className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                        >
                            {deleting ? "Deleting..." : "Delete team"}
                        </button>
                    </div>
                </Modal>
            )}

            {/* Team details */}
            {selectedTeam && (
                <Modal
                    title={selectedTeam.name}
                    subtitle={selectedTeam.description}
                    onClose={closeDetails}
                    wide
                >
                    {detailsError && (
                        <InlineError message={detailsError} />
                    )}

                    {detailsLoading ? (
                        <div className="py-12 text-center text-sm text-slate-500">
                            Loading team details...
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="grid gap-3 sm:grid-cols-3">
                                <DetailStat
                                    label="Created"
                                    value={formatDate(selectedTeam.createdAt)}
                                />
                                <DetailStat
                                    label="Members"
                                    value={teamMembers.length}
                                />
                                <DetailStat
                                    label="Projects"
                                    value={teamProjects.length}
                                />
                            </div>

                            {/* Members */}
                            <section>
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <h3 className="font-semibold text-slate-900">
                                            Team members
                                        </h3>
                                        <p className="mt-1 text-xs text-slate-500">
                                            People who belong to this team.
                                        </p>
                                    </div>
                                </div>

                                {canManageMembersAndProjects && (
                                    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                                        <select
                                            value={selectedUserId}
                                            onChange={(event) =>
                                                setSelectedUserId(event.target.value)
                                            }
                                            className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                                        >
                                            <option value="">
                                                Select a user to add
                                            </option>
                                            {users
                                                .filter(
                                                    (user) =>
                                                        !teamMembers.some(
                                                            (member) =>
                                                                member.id === user.id
                                                        )
                                                )
                                                .map((user) => (
                                                    <option key={user.id} value={user.id}>
                                                        {user.name} ({user.email})
                                                    </option>
                                                ))}
                                        </select>
                                        <button
                                            onClick={handleAddMember}
                                            disabled={!selectedUserId || !!memberActionId}
                                            className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            Add member
                                        </button>
                                    </div>
                                )}

                                <div className="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-200">
                                    {teamMembers.length === 0 ? (
                                        <p className="px-4 py-6 text-center text-sm text-slate-500">
                                            No members have been added yet.
                                        </p>
                                    ) : (
                                        teamMembers.map((member) => (
                                            <div
                                                key={member.id}
                                                className="flex items-center justify-between gap-3 px-4 py-3"
                                            >
                                                <div className="flex min-w-0 items-center gap-3">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-semibold text-violet-700">
                                                        {getInitials(member.name)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-medium text-slate-900">
                                                            {member.name}
                                                        </p>
                                                        <p className="truncate text-xs text-slate-500">
                                                            {member.email}
                                                        </p>
                                                    </div>
                                                </div>

                                                {canManageMembersAndProjects && (
                                                    <button
                                                        onClick={() => handleRemoveMember(member.id)}
                                                        disabled={!!memberActionId}
                                                        className="shrink-0 rounded-lg px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                                                    >
                                                        {memberActionId === member.id
                                                            ? "Removing..."
                                                            : "Remove"}
                                                    </button>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </section>

                            {/* Projects */}
                            <section>
                                <h3 className="font-semibold text-slate-900">
                                    Associated projects
                                </h3>
                                <p className="mt-1 text-xs text-slate-500">
                                    Projects linked to this team.
                                </p>

                                {canManageMembersAndProjects && (
                                    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                                        <select
                                            value={selectedProjectId}
                                            onChange={(event) =>
                                                setSelectedProjectId(event.target.value)
                                            }
                                            className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                                        >
                                            <option value="">
                                                Select a project to add
                                            </option>
                                            {projects
                                                .filter(
                                                    (project) =>
                                                        !teamProjects.some(
                                                            (item) =>
                                                                item.id === project.id
                                                        )
                                                )
                                                .map((project) => (
                                                    <option
                                                        key={project.id}
                                                        value={project.id}
                                                    >
                                                        {project.name}
                                                    </option>
                                                ))}
                                        </select>
                                        <button
                                            onClick={handleAddProject}
                                            disabled={!selectedProjectId || !!projectActionId}
                                            className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            Add project
                                        </button>
                                    </div>
                                )}

                                <div className="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-200">
                                    {teamProjects.length === 0 ? (
                                        <p className="px-4 py-6 text-center text-sm text-slate-500">
                                            No projects are associated with this team.
                                        </p>
                                    ) : (
                                        teamProjects.map((project) => (
                                            <div
                                                key={project.id}
                                                className="flex items-center justify-between gap-3 px-4 py-3"
                                            >
                                                <div className="flex min-w-0 items-center gap-3">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                                        ◫
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-medium text-slate-900">
                                                            {project.name}
                                                        </p>
                                                        <p className="truncate text-xs text-slate-500">
                                                            {project.status || "Project"}
                                                        </p>
                                                    </div>
                                                </div>

                                                {canManageMembersAndProjects && (
                                                    <button
                                                        onClick={() => handleRemoveProject(project.id)}
                                                        disabled={!!projectActionId}
                                                        className="shrink-0 rounded-lg px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                                                    >
                                                        {projectActionId === project.id
                                                            ? "Removing..."
                                                            : "Remove"}
                                                    </button>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </section>
                        </div>
                    )}
                </Modal>
            )}
        </div>
    );
}

function SummaryCard({ label, value, icon, color }) {
    const styles = {
        violet: "bg-violet-50 text-violet-700",
        blue: "bg-blue-50 text-blue-700",
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

function MiniStat({ label, value }) {
    return (
        <div>
            <p className="text-lg font-semibold text-slate-900">{value}</p>
            <p className="text-xs text-slate-500">{label}</p>
        </div>
    );
}

function DetailStat({ label, value }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-medium text-slate-500">{label}</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
        </div>
    );
}

function InlineError({ message }) {
    return (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {message}
        </div>
    );
}

function Modal({ title, subtitle, onClose, children, wide = false }) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/40 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-label={title}
                className={`my-auto w-full ${wide ? "max-w-3xl" : "max-w-lg"
                    } rounded-2xl border border-slate-200 bg-white shadow-2xl`}
            >
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6">
                    <div className="min-w-0">
                        <h2 className="text-lg font-semibold text-slate-900">
                            {title}
                        </h2>
                        {subtitle && (
                            <p className="mt-1 text-sm text-slate-500">
                                {subtitle}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="shrink-0 rounded-lg p-1 text-xl leading-none text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        aria-label="Close modal"
                    >
                        ×
                    </button>
                </div>

                <div
                    className={`px-5 py-5 sm:px-6 ${wide ? "max-h-[70vh] overflow-y-auto" : ""
                        }`}
                >
                    {children}
                </div>
            </div>
        </div>
    );
}