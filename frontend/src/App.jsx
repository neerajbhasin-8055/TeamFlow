import { useState } from 'react'
import './App.css'
import ProjectCard from './Components/ProjectCard'

function App() {
  const [error, setError] = useState()
  const [showProjects, setShowProjects] = useState(false)
  const [projectName, setProjectName] = useState("")
  const [projectDescription, setProjectDescription] = useState("")
  const [projects, setProjects] = useState(
    [
      {
        id: 1,
        name: "Teamflow",
        description: "This is teamflow"
      },
      {
        id: 2,
        name: "Workify",
        description: "This is workify"
      },
      {
        id: 3,
        name: "AgriLedger",
        description: "This is agriledger"
      }
    ]
  )


  function handleInput(event) {

    setProjectName(event.target.value)
  }
  function handleTextArea(event) {

    setProjectDescription(event.target.value)
  }

  function addProjects() {
    if (projectName.trim() === "" || projectDescription.trim() === "") {
      setError("Project fields are required")
      return
    }
    const newProject = {
      id: projects.length + 1,
      name: projectName,
      description: projectDescription
    }
    setProjects([...projects, newProject])
    setProjectName("")
    setProjectDescription("")
    setError("")
  }
  return (
    <div className="container">
      <div className="card">
        <h1>TeamFlow</h1>

        <h2>Welcome, Neeraj! 👋</h2>

        <button onClick={() => setShowProjects(!showProjects)}>
          {showProjects ? 'Hide Projects' : 'Show Projects'}
        </button>

        {showProjects && (
          <div className="projects">
            <h3>Here are my projects:</h3>

            <ul>
              {
                projects.map((project) => (
                  <li key={project.id}>
                    <ProjectCard id={project.id} name={project.name} description={project.description}></ProjectCard>
                  </li>
                ))
              }
            </ul>
          </div>
        )}
      </div>
      <div>
        <h3>Add Projects</h3>
        <input
          value={projectName}
          onChange={handleInput}
        />

        <textarea
          value={projectDescription}
          onChange={handleTextArea}
        />
      </div>
      {error && <p>{error}</p>}
      <button onClick={addProjects}>
        
        Add
      </button>
    </div>
  )
}

export default App