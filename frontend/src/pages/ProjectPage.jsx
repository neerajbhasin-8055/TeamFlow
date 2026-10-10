import {useState,useEffect} from "react"
import {getProjects} from "../services/ProjectService"
import ProjectCard from "../components/ProjectCard"
function ProjectPage(){
    const [loading,setLoading] = useState(true)
    const[apiError,setApiError] = useState("")
    const [projects, setProjects] = useState([])
    useEffect(()=>{
        async function fetchProjects(){
            setLoading(true)
            setApiError("")
            try {
                const projectRes = await getProjects()
                setProjects(projectRes)
            } catch (error) {
                setApiError(error.message)
            }finally{
                setLoading(false)
            }
        }
        fetchProjects()
    },[])
return <>
        {loading && <p>Loading projects...</p>}
        {apiError && <p>{apiError}</p>}
        {!loading && !apiError && projects && (
            <div>
                <h2>Projects</h2>
                <ul>
                    {
                        projects.map((project)=>(
                            <li key={project.id}><ProjectCard id = {project.id} name={project.name} description = {project.description}/></li>
                        ))
                    }
                </ul>
            </div>
        )}
     </>
}

export default ProjectPage