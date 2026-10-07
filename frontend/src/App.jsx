import { useState } from 'react'
import './App.css'

function App() {
  const [showProjects, setShowProjects] = useState(false)

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
              <li>Project 1</li>
              <li>Project 2</li>
              <li>Project 3</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default App