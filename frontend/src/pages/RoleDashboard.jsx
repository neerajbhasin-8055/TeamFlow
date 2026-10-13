import { useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import Overview from "./Overview";
import { getAllTeams } from "../services/TeamService";
import { getTasks } from "../services/TaskService";

const API = "http://localhost:8081/api/users/me";
const idOf = (x) => String(x?.id ?? x?._id ?? "");
const labelStatus = (x) => String(x || "TODO").replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

function Stat({ label, value, accent = "violet" }) {
  const colors = { violet: "bg-violet-50 text-violet-700", blue: "bg-blue-50 text-blue-700", amber: "bg-amber-50 text-amber-700", green: "bg-emerald-50 text-emerald-700" };
  return <div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">{label}</p><p className={`mt-3 inline-flex rounded-xl px-3 py-1.5 text-2xl font-bold ${colors[accent]}`}>{value}</p></div>;
}

function ManagerOrUserDashboard({ mode }) {
  const { projects = [], currentUser: contextUser } = useOutletContext() || {};
  const navigate = useNavigate();
  const [user, setUser] = useState(contextUser || null);
  const [teams, setTeams] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => { if (contextUser) setUser(contextUser); }, [contextUser]);
  useEffect(() => {
    let cancelled = false;
    const token = localStorage.getItem("token");
    Promise.all([
      getAllTeams().catch(() => []),
      getTasks().catch(() => []),
      user ? Promise.resolve(user) : fetch(API, { headers: { Authorization: `Bearer ${token}` } }).then((r) => { if (!r.ok) throw new Error("Unable to load your profile."); return r.json(); })
    ]).then(([teamData, taskData, userData]) => {
      if (cancelled) return;
      setTeams(Array.isArray(teamData) ? teamData : []);
      setTasks(Array.isArray(taskData) ? taskData : []);
      setUser(userData);
      setError("");
    }).catch((e) => { if (!cancelled) setError(e.message || "Unable to load dashboard data."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [user?.id]);

  const manager = mode === "MANAGER";
  const visibleTeams = useMemo(() => {
    if (!user) return [];
    if (manager) {
      const pids = new Set(projects.map((p) => idOf(p)));
      return teams.filter((t) => String(t.createdBy) === String(user.id) || (t.projectIds || []).some((id) => pids.has(String(id))) || projects.some((p) => String(p.teamId) === String(t.id)));
    }
    return teams.filter((t) => (t.memberIds || []).some((id) => String(id) === String(user.id)));
  }, [teams, projects, user, manager]);

  const visibleTasks = useMemo(() => {
    if (!user) return [];
    if (!manager) return tasks.filter((t) => String(t.assignedTo) === String(user.id));
    const projectIds = new Set(projects.map((p) => idOf(p)));
    return tasks.filter((t) => projectIds.has(String(t.projectId)));
  }, [tasks, projects, user, manager]);

  const done = visibleTasks.filter((t) => ["DONE", "COMPLETED"].includes(String(t.status || "").toUpperCase())).length;
  const inProgress = visibleTasks.filter((t) => String(t.status || "").toUpperCase() === "IN_PROGRESS").length;
  const title = manager ? "Manager workspace" : "My workspace";
  const subtitle = manager ? "Your projects, teams and task assignments at a glance." : "Your assigned work and the teams and projects you belong to.";

  return <section className="space-y-6">
    <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-violet-700 via-violet-600 to-indigo-600 p-6 text-white sm:p-8">
      <p className="text-sm font-medium text-violet-100">TeamFlow / {manager ? "Manager" : "User"}</p>
      <h2 className="mt-2 text-3xl font-bold">{title}{user?.name ? `, ${user.name.split(" ")[0]}` : ""}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-violet-100">{subtitle}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button onClick={() => navigate("/projects")} className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-violet-700 hover:bg-violet-50">View projects →</button>
        <button onClick={() => navigate("/tasks")} className="rounded-xl border border-white/40 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10">{manager ? "Manage tasks" : "My tasks"} →</button>
        <button onClick={() => navigate("/teams")} className="rounded-xl border border-white/40 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10">View teams →</button>
      </div>
    </div>
    {error && <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">Some dashboard data could not be loaded. You can still use the Projects, Tasks and Teams pages. {error}</div>}
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      <Stat label={manager ? "Managed projects" : "My projects"} value={projects.length} />
      <Stat label={manager ? "Associated teams" : "My teams"} value={visibleTeams.length} accent="blue" />
      <Stat label={manager ? "Project tasks" : "Assigned tasks"} value={visibleTasks.length} accent="amber" />
      <Stat label="Completed tasks" value={done} accent="green" />
    </div>
    <div className="grid gap-6 xl:grid-cols-2">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between"><div><h3 className="font-semibold text-slate-900">{manager ? "Your projects" : "Projects I'm part of"}</h3><p className="mt-1 text-xs text-slate-500">{projects.length} available</p></div><button onClick={() => navigate("/projects")} className="text-sm font-semibold text-violet-700">View all</button></div>
        {loading ? <p className="py-6 text-sm text-slate-500">Loading dashboard…</p> : projects.length === 0 ? <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No associated projects found yet.</p> : <div className="space-y-3">{projects.slice(0, 5).map((p) => <button key={idOf(p)} onClick={() => navigate(`/projects/${idOf(p)}`)} className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-100 p-3 text-left hover:border-violet-200 hover:bg-violet-50/40"><span className="min-w-0"><span className="block truncate text-sm font-semibold text-slate-800">{p.name || "Untitled project"}</span><span className="mt-1 block text-xs text-slate-500">{labelStatus(p.status)}</span></span><span className="text-violet-600">→</span></button>)}</div>}
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between"><div><h3 className="font-semibold text-slate-900">{manager ? "Task assignments" : "My assigned tasks"}</h3><p className="mt-1 text-xs text-slate-500">{inProgress} in progress · {done} completed</p></div><button onClick={() => navigate("/tasks")} className="text-sm font-semibold text-violet-700">View all</button></div>
        {loading ? <p className="py-6 text-sm text-slate-500">Loading tasks…</p> : visibleTasks.length === 0 ? <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No tasks found for this workspace.</p> : <div className="space-y-3">{visibleTasks.slice(0, 5).map((t) => <div key={idOf(t)} className="flex items-start justify-between gap-3 rounded-xl border border-slate-100 p-3"><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800">{t.title || "Untitled task"}</p><p className="mt-1 text-xs text-slate-500">{projects.find((p) => idOf(p) === String(t.projectId))?.name || "Project task"} · Due {t.deadline || "not set"}</p></div><span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{labelStatus(t.status)}</span></div>)}</div>}
      </section>
    </div>
    <section className="rounded-2xl border border-slate-200 bg-white p-5"><div className="mb-4 flex items-center justify-between"><div><h3 className="font-semibold text-slate-900">{manager ? "Teams in your projects" : "My teams"}</h3><p className="mt-1 text-xs text-slate-500">People working together</p></div><button onClick={() => navigate("/teams")} className="text-sm font-semibold text-violet-700">View teams</button></div>{visibleTeams.length === 0 ? <p className="text-sm text-slate-500">No associated teams found yet.</p> : <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{visibleTeams.slice(0, 6).map((t) => <div key={idOf(t)} className="rounded-xl border border-slate-100 p-4"><p className="font-semibold text-slate-800">{t.name || "Unnamed team"}</p><p className="mt-1 line-clamp-2 text-sm text-slate-500">{t.description || "No description"}</p><p className="mt-3 text-xs text-slate-400">{(t.memberIds || []).length} members · {(t.projectIds || []).length} projects</p></div>)}</div>}</section>
  </section>;
}

export default function RoleDashboard() {
  const { currentUser } = useOutletContext() || {};
  const role = String(currentUser?.role || "").replace(/^ROLE_/, "").toUpperCase();
  if (role === "ADMIN" || !role) return <Overview />;
  if (role === "MANAGER") return <ManagerOrUserDashboard mode="MANAGER" />;
  return <ManagerOrUserDashboard mode="USER" />;
}
