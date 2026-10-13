

import { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import {

  getProjectById,

  updateProject,

  deleteProject,

} from "../services/ProjectService";

import { getTasks } from "../services/TaskService";

import {

  getAllTeams,

  getTeamMembers,

} from "../services/TeamService";



const API_URL = "http://localhost:8081/api/users";

const API_USERS_URL = `${API_URL}/me`;

const MANAGERS_API_URL = `${API_URL}/allusers`;



const initialForm = {

  name: "",

  description: "",

  status: "TODO",

  startDate: "",

  deadline: "",

  managerId: "",

};



function dateInputValue(value) {

  if (!value) return "";

  return String(value).slice(0, 10);

}



function formatDate(value) {

  if (!value) return "Not set";



  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Invalid date";



  return new Intl.DateTimeFormat("en-IN", {

    day: "2-digit",

    month: "short",

    year: "numeric",

    timeZone: "UTC",

  }).format(date);

}



function DetailItem({ label, value, mono = false }) {

  return (

    <div className="min-w-0 rounded-xl border border-slate-100 bg-slate-50 p-4">

      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">

        {label}

      </p>

      <p

        className={`mt-2 break-words text-sm font-semibold text-slate-800 ${mono ? "font-mono text-xs" : ""

          }`}

      >

        {value ?? "Not assigned"}

      </p>

    </div>

  );

}



function ProjectDetailsPage() {



  const { id } = useParams();

  const navigate = useNavigate();



  const [project, setProject] = useState(null);

  const [role, setRole] = useState("");

  const [managers, setManagers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [loadingRole, setLoadingRole] = useState(true);

  const [loadingManagers, setLoadingManagers] = useState(false);

  const [error, setError] = useState("");

  const [actionError, setActionError] = useState("");

  const [editing, setEditing] = useState(false);

  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState(initialForm);

  const [confirmAction, setConfirmAction] = useState("");

  const [projectTasks, setProjectTasks] = useState([]);

  const [projectTeams, setProjectTeams] = useState([]);

  const [teamMembers, setTeamMembers] = useState([]);

  const [loadingRelated, setLoadingRelated] = useState(true);

  const [relatedError, setRelatedError] = useState("");



  useEffect(() => {

    let cancelled = false;



    async function loadProject() {

      try {

        setLoading(true);

        setError("");



        const data = await getProjectById(id);



        if (!cancelled) setProject(data);

      } catch (err) {

        if (!cancelled) {

          setError(err.message || "Unable to load project.");

        }

      } finally {

        if (!cancelled) setLoading(false);

      }

    }



    async function loadRole() {

      try {

        const token = localStorage.getItem("token");



        if (!token) throw new Error("Please log in again.");



        const response = await fetch(API_USERS_URL, {

          headers: { Authorization: `Bearer ${token}` },

        });



        if (!response.ok) {

          throw new Error("Unable to load user role.");

        }



        const data = await response.json();



        if (!cancelled) setRole(data.role || "");

      } catch (err) {

        if (!cancelled) console.error("Role loading failed:", err);

      } finally {

        if (!cancelled) setLoadingRole(false);

      }

    }



    if (id) {

      loadProject();

    } else {

      setError("Project ID is missing.");

      setLoading(false);

    }



    loadRole();



    return () => {

      cancelled = true;

    };

  }, [id]);



  // Fetch manager options only for ADMIN users.

  useEffect(() => {

    if (role !== "ADMIN") return;



    let cancelled = false;



    async function loadManagers() {

      try {

        setLoadingManagers(true);



        const token = localStorage.getItem("token");



        const response = await fetch(MANAGERS_API_URL, {

          headers: { Authorization: `Bearer ${token}` },

        });



        if (!response.ok) {

          throw new Error(

            "Unable to load managers. Check your users-list API endpoint."

          );

        }



        const data = await response.json();



        // Supports either a direct array or common wrapped responses.

        const users = Array.isArray(data)

          ? data

          : Array.isArray(data.users)

            ? data.users

            : Array.isArray(data.content)

              ? data.content

              : [];



        const managerUsers = users.filter(

          (user) => user.role === "MANAGER"

        );



        if (!cancelled) setManagers(managerUsers);

      } catch (err) {

        if (!cancelled) {

          setActionError(err.message || "Unable to load managers.");

        }

      } finally {

        if (!cancelled) setLoadingManagers(false);

      }

    }



    loadManagers();



    return () => {

      cancelled = true;

    };

  }, [role]);



  useEffect(() => {

    if (!project) return;



    let cancelled = false;



    async function loadRelatedData() {

      setLoadingRelated(true);

      setRelatedError("");



      try {

        const [tasksData, teamsData] = await Promise.all([

          getTasks(),

          getAllTeams(),

        ]);



        const allTasks = Array.isArray(tasksData) ? tasksData : [];

        const allTeams = Array.isArray(teamsData) ? teamsData : [];



        const currentProjectId = String(project.id ?? project._id ?? id);



        const matchingTasks = allTasks.filter(

          (task) => String(task.projectId) === currentProjectId

        );



        const matchingTeams = allTeams.filter((team) => {

          const matchesDirectly =

            project.teamId != null &&

            String(team.id ?? team._id) === String(project.teamId);



          const matchesProjectList = (team.projectIds ?? []).some(

            (projectId) => String(projectId) === currentProjectId

          );



          return matchesDirectly || matchesProjectList;

        });



        const memberResults = await Promise.all(

          matchingTeams.map((team) =>

            getTeamMembers(team.id ?? team._id)

          )

        );



        if (cancelled) return;



        setProjectTasks(matchingTasks);

        setProjectTeams(matchingTeams);



        // Combine members across teams and avoid duplicate users.

        const uniqueMembers = new Map();



        memberResults.flat().forEach((member) => {

          const memberId = member.id ?? member._id;



          if (memberId != null) {

            uniqueMembers.set(String(memberId), member);

          }

        });



        setTeamMembers([...uniqueMembers.values()]);

      } catch (err) {

        if (!cancelled) {

          setRelatedError(

            err.message || "Unable to load project tasks and team details."

          );

        }

      } finally {

        if (!cancelled) setLoadingRelated(false);

      }

    }



    loadRelatedData();



    return () => {

      cancelled = true;

    };

  }, [project, id]);




  const canManage = role === "ADMIN" || role === "MANAGER";







  function getErrorMessage(error) {

    const message = error?.message || "Something went wrong.";



    try {

      const jsonStart = message.indexOf("{");



      if (jsonStart !== -1) {

        const data = JSON.parse(message.slice(jsonStart));

        return data.message || message;

      }

    } catch {

      // Keep the original message if parsing fails.

    }



    return message;

  }



  function startEditing() {

    setForm({

      name: project.name || "",

      description: project.description || "",

      status: project.status || "TODO",

      startDate: dateInputValue(project.startDate),

      deadline: dateInputValue(project.deadline),

      managerId: project.managerId || "",

    });



    setActionError("");

    setEditing(true);

  }



  function handleChange(event) {

    const { name, value } = event.target;



    setForm((previous) => ({

      ...previous,

      [name]: value,

    }));

  }



  function requestUpdate(event) {

    event.preventDefault();

    setActionError("");



    if (!form.name.trim() || form.name.trim().length < 3) {

      setActionError("Project name must contain at least 3 characters.");

      return;

    }



    if (

      !form.description.trim() ||

      form.description.trim().length < 10

    ) {

      setActionError("Description must contain at least 10 characters.");

      return;

    }



    if (!form.startDate || !form.deadline) {

      setActionError("Start date and deadline are required.");

      return;

    }



    if (form.deadline < form.startDate) {

      setActionError("Deadline cannot be before the start date.");

      return;

    }



    if (

      role === "ADMIN" &&

      !form.managerId.trim()

    ) {

      setActionError("Please select a project manager.");

      return;

    }



    setConfirmAction("update");

  }



  async function handleConfirm() {

    const action = confirmAction;

    setConfirmAction("");

    setActionError("");



    if (!project) return;



    try {

      setSaving(true);



      if (action === "update") {

        const payload = {

          name: form.name.trim(),

          description: form.description.trim(),

          status: form.status,

          startDate: form.startDate,

          deadline: form.deadline,

          teamId: project.teamId || null,

        };



        // Only ADMIN is allowed to change the manager.

        if (role === "ADMIN") {

          payload.managerId = form.managerId;

        }



        const updated = await updateProject(id, payload);



        setProject(

          updated && updated.id

            ? updated

            : {

              ...project,

              ...payload,

            }

        );



        setEditing(false);

      }



      if (action === "delete") {

        await deleteProject(id);

        navigate("/projects", { replace: true });

      }

    } catch (err) {

      setActionError(getErrorMessage(err));

    } finally {

      setSaving(false);

    }

  }



  const statusStyles = {

    TODO: "bg-amber-50 text-amber-700 ring-amber-200",

    PLANNED: "bg-amber-50 text-amber-700 ring-amber-200",

    IN_PROGRESS: "bg-blue-50 text-blue-700 ring-blue-200",

    COMPLETED: "bg-emerald-50 text-emerald-700 ring-emerald-200",

    ON_HOLD: "bg-slate-100 text-slate-700 ring-slate-200",

    CANCELLED: "bg-red-50 text-red-700 ring-red-200",

  };



  if (loading) {

    return (

      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">

        <p className="text-sm text-slate-500">

          Loading project details...

        </p>

      </div>

    );

  }



  if (error || !project) {

    return (

      <div className="rounded-2xl border border-red-100 bg-white p-8 text-center">

        <h2 className="text-lg font-semibold text-slate-900">

          Could not load project

        </h2>

        <p className="mt-2 text-sm text-red-600">

          {error || "Project not found."}

        </p>

        <button

          type="button"

          onClick={() => navigate("/projects")}

          className="mt-5 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white"

        >

          Back to Projects

        </button>

      </div>

    );

  }



  const status = project.status || "UNKNOWN";



  return (

    <div className="mx-auto max-w-7xl space-y-6 pb-6">

      <div className="flex flex-wrap items-center justify-between gap-4">

        <div className="min-w-0">

          <p className="text-sm text-slate-400">

            Workspace / Projects / {project.name}

          </p>



          <div className="mt-2 flex flex-wrap items-center gap-3">

            <h2 className="break-words text-2xl font-bold text-slate-900 sm:text-3xl">

              {project.name}

            </h2>



            <span

              className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusStyles[status] ||

                "bg-slate-100 text-slate-700 ring-slate-200"

                }`}

            >

              {status.replaceAll("_", " ")}

            </span>

          </div>

        </div>



        <div className="flex flex-wrap gap-2">

          {!loadingRole && canManage && (

            <>

              <button

                type="button"

                onClick={startEditing}

                disabled={saving}

                className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"

              >

                Edit Project

              </button>



              <button

                type="button"

                onClick={() => {

                  setActionError("");

                  setConfirmAction("delete");

                }}

                disabled={saving}

                className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"

              >

                Delete Project

              </button>

            </>

          )}



          <button

            type="button"

            onClick={() => navigate("/projects")}

            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:border-violet-300 hover:text-violet-700"

          >

            ← Back

          </button>

        </div>

      </div>



      {actionError && !editing && (

        <p

          role="alert"

          className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"

        >

          {actionError}

        </p>

      )}



      {editing && (

        <section className="rounded-2xl border border-violet-200 bg-white p-5 sm:p-7">

          <h3 className="text-lg font-semibold text-slate-900">

            Edit project

          </h3>



          <p className="mt-1 text-sm text-slate-500">

            Change the details and review them before saving.

          </p>



          <form onSubmit={requestUpdate} className="mt-6 space-y-4">

            <div>

              <label

                htmlFor="edit-name"

                className="mb-1 block text-sm font-medium text-slate-700"

              >

                Project name

              </label>

              <input

                id="edit-name"

                name="name"

                value={form.name}

                onChange={handleChange}

                required

                minLength={3}

                maxLength={100}

                className="w-full rounded-xl border border-slate-300 px-3 py-2.5"

              />

            </div>



            <div>

              <label

                htmlFor="edit-description"

                className="mb-1 block text-sm font-medium text-slate-700"

              >

                Description

              </label>

              <textarea

                id="edit-description"

                name="description"

                value={form.description}

                onChange={handleChange}

                required

                minLength={10}

                maxLength={500}

                rows={4}

                className="w-full rounded-xl border border-slate-300 px-3 py-2.5"

              />

            </div>



            <div>

              <label

                htmlFor="edit-status"

                className="mb-1 block text-sm font-medium text-slate-700"

              >

                Status

              </label>

              <select

                id="edit-status"

                name="status"

                value={form.status}

                onChange={handleChange}

                required

                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5"

              >

                <option value="TODO">To do</option>

                <option value="PLANNED">Planned</option>

                <option value="IN_PROGRESS">In progress</option>

                <option value="ON_HOLD">On hold</option>

                <option value="COMPLETED">Completed</option>

                <option value="CANCELLED">Cancelled</option>

              </select>

            </div>



            {/* Only ADMIN can assign or change the manager. */}

            {role === "ADMIN" && (

              <div>

                <label

                  htmlFor="edit-manager"

                  className="mb-1 block text-sm font-medium text-slate-700"

                >

                  Project manager

                </label>



                <select

                  id="edit-manager"

                  name="managerId"

                  value={form.managerId}

                  onChange={handleChange}

                  required

                  disabled={loadingManagers}

                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 disabled:bg-slate-100"

                >

                  <option value="">

                    {loadingManagers

                      ? "Loading managers..."

                      : "Select a manager"}

                  </option>



                  {managers.map((manager) => (

                    <option key={manager.id} value={manager.id}>

                      {manager.name || manager.fullName || manager.email || manager.id}

                      {manager.email &&

                        manager.name &&

                        manager.email !== manager.name

                        ? ` (${manager.email})`

                        : ""}

                    </option>

                  ))}

                </select>



                {!loadingManagers && managers.length === 0 && (

                  <p className="mt-1 text-xs text-amber-700">

                    No MANAGER users were returned. Check the users API.

                  </p>

                )}



                <p className="mt-1 text-xs text-slate-500">

                  Only users with the MANAGER role can be assigned.

                </p>

              </div>

            )}



            <div className="grid gap-4 sm:grid-cols-2">

              <div>

                <label

                  htmlFor="edit-start-date"

                  className="mb-1 block text-sm font-medium text-slate-700"

                >

                  Start date

                </label>

                <input

                  id="edit-start-date"

                  type="date"

                  name="startDate"

                  value={form.startDate}

                  onChange={handleChange}

                  required

                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5"

                />

              </div>



              <div>

                <label

                  htmlFor="edit-deadline"

                  className="mb-1 block text-sm font-medium text-slate-700"

                >

                  Deadline

                </label>

                <input

                  id="edit-deadline"

                  type="date"

                  name="deadline"

                  value={form.deadline}

                  min={form.startDate || undefined}

                  onChange={handleChange}

                  required

                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5"

                />

              </div>

            </div>



            {actionError && (

              <p

                role="alert"

                className="rounded-xl bg-red-50 p-3 text-sm text-red-700"

              >

                {actionError}

              </p>

            )}



            <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-4">

              <button

                type="button"

                onClick={() => {

                  setEditing(false);

                  setActionError("");

                }}

                disabled={saving}

                className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"

              >

                Cancel

              </button>



              <button

                type="submit"

                disabled={saving || (role === "ADMIN" && loadingManagers)}

                className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"

              >

                Review Changes

              </button>

            </div>

          </form>

        </section>

      )}



      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 via-violet-600 to-indigo-600 p-6 text-white shadow-xl sm:p-9">

        <div className="absolute -right-12 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />



        <div className="relative">

          <div className="flex items-start gap-4">

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-2xl font-bold">

              {(project.name || "P").charAt(0).toUpperCase()}

            </div>



            <div className="min-w-0">

              <p className="text-sm font-medium text-violet-200">

                Project overview

              </p>

              <h3 className="mt-1 break-words text-xl font-bold sm:text-2xl">

                {project.name}

              </h3>

              <p className="mt-3 max-w-3xl whitespace-pre-wrap text-sm leading-6 text-violet-100">

                {project.description || "No description provided."}

              </p>

            </div>

          </div>



          <div className="mt-8 grid grid-cols-1 gap-5 border-t border-white/20 pt-6 sm:grid-cols-2 lg:grid-cols-3">

            <div>

              <p className="text-sm text-violet-200">Start date</p>

              <p className="mt-1 font-semibold">

                {formatDate(project.startDate)}

              </p>

            </div>



            <div>

              <p className="text-sm text-violet-200">Deadline</p>

              <p className="mt-1 font-semibold">

                {formatDate(project.deadline)}

              </p>

            </div>



            <div>

              <p className="text-sm text-violet-200">Project status</p>

              <p className="mt-1 font-semibold">

                {status.replaceAll("_", " ")}

              </p>

            </div>

          </div>

        </div>

      </section>



      {/* Tasks linked to this project */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-slate-900">Project tasks</h3>
            <p className="mt-1 text-sm text-slate-500">
              Tasks currently associated with this project.
            </p>
          </div>
          <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
            {projectTasks.length} {projectTasks.length === 1 ? "task" : "tasks"}
          </span>
        </div>

        {loadingRelated ? (
          <p className="mt-5 text-sm text-slate-500">Loading project tasks and teams...</p>
        ) : relatedError ? (
          <p role="alert" className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            {relatedError}
          </p>
        ) : projectTasks.length === 0 ? (
          <div className="mt-5 rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center">
            <p className="text-sm font-medium text-slate-700">No tasks linked to this project yet.</p>
            <p className="mt-1 text-xs text-slate-500">Tasks must have this project's ID in their projectId field.</p>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {projectTasks.map((task, index) => {
              const taskId = task.id ?? task._id ?? `${task.title || "task"}-${index}`;
              const taskStatus = String(task.status || "TODO").replaceAll("_", " ");
              const priority = String(task.priority || "MEDIUM").toUpperCase();
              return (
                <article key={taskId} className="rounded-xl border border-slate-200 p-4 transition hover:border-violet-200">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h4 className="break-words text-sm font-semibold text-slate-900">{task.title || "Untitled task"}</h4>
                      <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-500">{task.description || "No description provided."}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">{taskStatus}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
                    <span>Priority: <strong className="text-slate-700">{priority}</strong></span>
                    <span>Deadline: <strong className="text-slate-700">{formatDate(task.deadline)}</strong></span>
                    {task.assignedTo && <span>Assigned to: <strong className="font-mono text-slate-700">{typeof task.assignedTo === "object" ? (task.assignedTo.name || task.assignedTo.email || task.assignedTo.id || task.assignedTo._id) : task.assignedTo}</strong></span>}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Teams associated with this project */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-slate-900">Project teams</h3>
            <p className="mt-1 text-sm text-slate-500">Teams connected to this project and their members.</p>
          </div>
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            {projectTeams.length} {projectTeams.length === 1 ? "team" : "teams"}
          </span>
        </div>

        {loadingRelated ? (
          <p className="mt-5 text-sm text-slate-500">Loading project teams...</p>
        ) : relatedError ? (
          <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">{relatedError}</p>
        ) : projectTeams.length === 0 ? (
          <div className="mt-5 rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center">
            <p className="text-sm font-medium text-slate-700">No teams associated with this project.</p>
            <p className="mt-1 text-xs text-slate-500">Add this project's ID to a team's project list, or set the project's teamId.</p>
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {projectTeams.map((team, index) => {
              const teamId = team.id ?? team._id ?? `${team.name || "team"}-${index}`;
              const membersForTeam = Array.isArray(team.memberIds)
                ? team.memberIds.length
                : teamMembers.length;
              return (
                <article key={teamId} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 font-bold text-violet-700">
                      {(team.name || "T").trim().charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="break-words font-semibold text-slate-900">{team.name || "Unnamed team"}</h4>
                      <p className="mt-1 break-words text-sm text-slate-500">{team.description || "No description provided."}</p>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <DetailItem label="Team ID" value={team.id ?? team._id ?? "Not available"} mono />
                    <DetailItem label="Members" value={membersForTeam} />
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {!loadingRelated && !relatedError && teamMembers.length > 0 && (
          <div className="mt-6 border-t border-slate-100 pt-5">
            <h4 className="text-sm font-semibold text-slate-900">Team members</h4>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {teamMembers.map((member, index) => {
                const memberId = member.id ?? member._id ?? `${member.email || member.name || "member"}-${index}`;
                const displayName = member.name || member.fullName || member.email || "Unnamed member";
                return (
                  <div key={memberId} className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 p-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-50 text-sm font-semibold text-violet-700">
                      {displayName.trim().charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">{displayName}</p>
                      <p className="truncate text-xs text-slate-500">{member.email || (member.role ? String(member.role).replaceAll("_", " ") : "Team member")}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-7">

        <h3 className="font-semibold text-slate-900">

          Project information

        </h3>

        <p className="mt-1 text-sm text-slate-500">

          Identifiers and timestamps associated with this project.

        </p>



        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          <DetailItem label="Project ID" value={project.id} mono />

          <DetailItem label="Manager ID" value={project.managerId} mono />

          <DetailItem

            label="Team ID"

            value={project.teamId || "Not assigned"}

            mono={Boolean(project.teamId)}

          />

          <DetailItem

            label="Created at"

            value={formatDate(project.createdAt)}

          />

          <DetailItem

            label="Last updated"

            value={formatDate(project.updatedAt)}

          />

        </div>

      </section>



      <footer className="text-center text-xs text-slate-400">

        TeamFlow · Make teamwork flow.

      </footer>



      {/* Confirmation dialog */}

      {confirmAction && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <section

            role="alertdialog"

            aria-modal="true"

            aria-labelledby="confirm-title"

            aria-describedby="confirm-description"

            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"

          >

            <h3

              id="confirm-title"

              className="text-lg font-bold text-slate-900"

            >

              {confirmAction === "update"

                ? "Save project changes?"

                : "Delete this project?"}

            </h3>



            <p

              id="confirm-description"

              className="mt-2 text-sm leading-6 text-slate-600"

            >

              {confirmAction === "update"

                ? "Are you sure you want to update this project with these changes?"

                : `Are you sure you want to delete "${project.name}"? This action cannot be undone.`}

            </p>



            <div className="mt-6 flex justify-end gap-3">

              <button

                type="button"

                onClick={() => setConfirmAction("")}

                disabled={saving}

                className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"

              >

                Cancel

              </button>



              <button

                type="button"

                onClick={handleConfirm}

                disabled={saving}

                className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50 ${confirmAction === "delete"

                  ? "bg-red-600 hover:bg-red-700"

                  : "bg-violet-600 hover:bg-violet-700"

                  }`}

              >

                {saving

                  ? "Please wait..."

                  : confirmAction === "update"

                    ? "OK, Update"

                    : "OK, Delete"}

              </button>

            </div>

          </section>

        </div>

      )}

    </div>

  );

}



export default ProjectDetailsPage;
