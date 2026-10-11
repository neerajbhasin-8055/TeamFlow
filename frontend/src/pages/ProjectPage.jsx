
import ProjectCard from "../components/ProjectCard";

function ProjectPage({
    projects,
    loadingProjects,
    projectError,
    search,
}) {
    const filteredProjects = projects.filter((project) =>
        (project.name || "")
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    if (loadingProjects) {
        return <p className="text-sm text-slate-500">Loading projects...</p>;
    }

    if (projectError) {
        return (
            <div className="rounded-2xl border border-red-200 bg-white p-6">
                <h2 className="font-semibold text-red-700">
                    Couldn't load projects
                </h2>
                <p className="mt-2 text-sm text-slate-500">{projectError}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
                >
                    Try again
                </button>
            </div>
        );
    }

    return (
        <section>
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
                All Projects
            </h2>
            {filteredProjects.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center">
                    <h3 className="font-semibold text-slate-800">
                        {search ? "No matching projects" : "No projects yet"}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                        {search
                            ? "Try searching with a different project name."
                            : "Create a project to see it appear here."}
                    </p>
                </div>
            ) : (
                <ul className="grid gap-4 xl:grid-cols-3">
                    {filteredProjects.map((project) => (
                        <li key={project.id}>
                            <ProjectCard
                                id={project.id}
                                name={project.name}
                                description={project.description}
                                status = {project.status}
                                deadline = {project.deadline}
                            />
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}

export default ProjectPage;
