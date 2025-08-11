import React, { useEffect, useState } from "react"
import { User, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import axiosInstance from "../api/axiosInstance";
import {Moon, Sun} from 'lucide-react'
import {Link, useNavigate} from 'react-router-dom'

function SignIn({darkMode,toggleDarkMode}){
const navigate=useNavigate()

const [username,setUsername]= useState("");
const [password,setPassword]= useState("");

const [showPassword, setShowPassword]=useState(false)

const [usernameError, setUsernameError]= useState(false)
const [passwordError, setPasswordError]= useState(false)


const [isValid, setIsValid]= useState(false)
const [message, setMessage]=useState("")
const [messageType, setMessageType]= useState("")

const [isLoading, setIsLoading] = useState(false)

useEffect(()=>{
setIsValid(validateInputs())

},[username, password])





    
 async function signInRequest(e){
e.preventDefault()
        if(isValid){
            try{
                setIsLoading(true)
                const response=await axiosInstance.post("/signin",{
                    username: username,
                    password: password
                })
                if(response.data.message=="Username does not exist!" || response.data.message=="Password is Incorrect!"){
                setMessage(response.data.message)
                setMessageType("error")
                }
              else if(response.data.token){
                setMessage("Login successfull! Redirecting...")
                localStorage.setItem("token",response.data.token)
                localStorage.setItem("username",response.data.username)      
                    setMessageType("success")
                setUsername("")
                setPassword("")
                setTimeout(()=>{
                    navigate('/todos')
                },500)

                }
                setIsLoading(false)

            }catch(e){
                setIsLoading(false)
                setMessage("An error occured. Please try again!")
                setMessageType("error")

            }


        } else{
            setMessage("Please fix all errors before submitting.")
            setMessageType("error")
        }

  }   

  function validateInputs(){
return (username && password)
}

    return (
          <div className={darkMode ? 'dark' : ''}>
  <div className="flex justify-between items-center px-6 py-4 bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
    <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400 tracking-wide">
      TaskFlow
    </h1>
    <button
      onClick={toggleDarkMode}
      className={`p-3 rounded-full transition-all duration-300 ${
        darkMode
          ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400'
          : 'bg-white hover:bg-gray-100 text-gray-600 shadow-md'
      }`}
    >
      {darkMode ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  </div>
         <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="w-full max-w-md text-gray-900 dark:text-white -translate-y-1">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 bg-blue-500 dark:bg-blue-600">
            <User className="text-white" size={28} />
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Sign in to continue managing your todos
          </p>
        </div>

        {/* Form */}
        {
            message?
            (
    <div
      className={`mb-4 px-4 py-2 text-sm font-medium rounded-md ${
        messageType === 'success'
          ? 'bg-green-100 text-green-700'
          : 'bg-red-100 text-red-700'
      }`}
    >
      {message}
    </div>
  ):
  null
        }




        <form className="space-y-6" onSubmit={signInRequest}>
          {/* Username Field */}
          <div className="relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
              <User size={20} />
            </div>
            <input
              type="text"
              name="username"
              placeholder="Username"
              maxLength={100}
              onChange={(e)=>{
                const newUsername=e.target.value
               setUsername(newUsername)
               if(newUsername.length>=1){
                setUsernameError(false)
               }
              }
            }
              onBlur={()=>{
                if(!username){
    setUsernameError(true)
}
              }}
              className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300"
            />
            <div className="mt-1 flex justify-between items-center">
              <div className={`flex items-center text-red-500 text-sm ${usernameError && username=="" ?"":"hidden"}`}>
                <AlertCircle size={16} className="mr-2" />
                <span>Username is required!</span>
              </div>

            </div>
          </div>

          {/* Password Field */}
          <div className="relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
              <Lock size={20} />
            </div>
            <input
              type={`${showPassword?"text":"password"}`}
              name="password"
              placeholder="Password"
              maxLength={50}
              onChange={(e)=>{
                const newPassword=e.target.value
                setPassword(newPassword)
                if(newPassword.length>=1){
                    setPasswordError(false)
                }
            }
              }
              onBlur={()=>{
if(!password){
    setPasswordError(true)
} else{
    setPasswordError(false)
}
              }}
              className="w-full pl-12 pr-12 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300"
            />
            <button
              type="button"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
            {showPassword?
            (<EyeOff onClick={()=>setShowPassword(!showPassword)} size={20} />):
              (<Eye onClick={()=>setShowPassword(!showPassword)} size={20} />)
            }
            </button>
            <div className="mt-1 flex justify-between items-center">
              <div className={`flex items-center text-red-500 text-sm ${(passwordError) && password=="" ?"":"hidden"}`}>
                <AlertCircle size={16} className="mr-2" />
                <span>Password is required!</span>
              </div>

            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-4 px-6 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 active:transform active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300"
          >
            Sign In
          </button>

          {/* Loading State Button (hidden by default) */}
          <button
            type="submit"
            disabled
            className={`w-full py-4 px-6 rounded-xl font-semibold text-white bg-gray-400 cursor-not-allowed ${isLoading?"":"hidden"}`}
          >
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Signing In...
            </div>
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link to={"/signup"} className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
               Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
       </div>
    )
}

export default SignIn