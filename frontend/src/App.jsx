import React, { useState } from 'react'
import {Moon, Sun} from 'lucide-react'
import {Route, Routes,useNavigate} from 'react-router-dom'
import {Toaster,toast} from 'react-hot-toast'
import './App.css'
import SignUp from './pages/signup'
import SignIn from './pages/signin'
import TodoAppPage from './pages/todoApp'
import Footer from './components/footer'

function App() {
const [darkMode,setDarkMode]= useState(true)
const navigate=useNavigate()

function toggleDarkMode(){
setDarkMode(!darkMode)
}

function onLogout(){
localStorage.removeItem("token")
localStorage.removeItem("username")
toast.success("You are Logged Out!")
setTimeout(()=>{
  navigate('/',{replace: true})
},350)

}

  return (
    <>
    <Toaster position="top-center" />
    <Routes>
      <Route path='/' element={<SignIn darkMode={darkMode} toggleDarkMode={toggleDarkMode}></SignIn>}></Route>
      <Route path='/signup' element={<SignUp darkMode={darkMode} toggleDarkMode={toggleDarkMode}></SignUp>}></Route>
      <Route path='/todos' element={<TodoAppPage onLogout={onLogout} darkMode={darkMode} toggleDarkMode={toggleDarkMode}></TodoAppPage>}></Route>
</Routes>
    <Footer darkMode={darkMode}></Footer>

    </>
  )
}

export default App
