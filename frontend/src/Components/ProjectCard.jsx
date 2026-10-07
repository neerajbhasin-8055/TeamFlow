function ProjectCard({id,name,description}){
    return(
        <>
        <div>
            <h1>{id}</h1>
            <h3>{name}</h3>
            <p>{description}</p>
        </div>
        </>
    )
}

export default ProjectCard