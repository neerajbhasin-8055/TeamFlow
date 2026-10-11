import { useState } from "react";
import Dashboard from "./pages/Dashboard"
import LoginPage from "./pages/LoginPage"

function App(){
  const[token,setToken] = useState(
    () => localStorage.getItem("token")
  )

  function handleLoginSuccess(newToken){
    setToken(newToken)
  }

  function handleLogout(){
    localStorage.removeItem("token")
    setToken(null)
  }
  return token ? (
    <Dashboard onLogout={handleLogout}/> 
  ) : (<LoginPage onLoginSuccess={handleLoginSuccess}/>)
}
export default App