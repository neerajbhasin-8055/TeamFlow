
import { useNavigate } from "react-router-dom";

function ProjectCard({ id, name, description, status, deadline }) {
  const navigate = useNavigate();

  const statusStyles = {
    COMPLETED: "bg-emerald-100 text-emerald-700",
    IN_PROGRESS: "bg-blue-100 text-blue-700",
    TODO: "bg-amber-100 text-amber-700",
    ON_HOLD: "bg-gray-100 text-gray-700",
  };

  const formattedStatus = (status || "TODO")
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

  const formattedDeadline = deadline
    ? new Date(deadline).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Not set";

  function handleViewProject() {
    navigate(`/projects/${id}`);
  }

  return (
    <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 font-bold text-indigo-700">
          {(name || "P").slice(0, 2).toUpperCase()}
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              statusStyles[(status || "TODO").toUpperCase()] ||
              "bg-gray-100 text-gray-700"
            }`}
          >
            {formattedStatus}
          </span>

          <button
            type="button"
            onClick={handleViewProject}
            aria-label={`View ${name || "project"} details`}
            title="View project details"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-indigo-100 hover:text-indigo-700"
          >
            <span aria-hidden="true" className="text-xl">
              →
            </span>
          </button>
        </div>
      </div>

      <h3 className="mb-2 text-lg font-semibold text-gray-900">
        {name || "Untitled project"}
      </h3>

      <p className="mb-5 min-h-12 text-sm leading-6 text-gray-600">
        {description || "No description available."}
      </p>

      <div className="border-t border-gray-100 pt-3 text-sm text-gray-500">
        <span className="font-medium">Deadline:</span> {formattedDeadline}
      </div>

      <p className="mt-2 text-xs text-gray-400">
        Project ID: {id || "N/A"}
      </p>
    </article>
  );
}

export default ProjectCard;
