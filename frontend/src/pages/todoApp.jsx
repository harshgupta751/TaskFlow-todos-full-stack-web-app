import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Search, Calendar, Flag, Trash2, Edit3, 
  Moon, Sun, AlertTriangle
} from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import {toast} from 'react-hot-toast'
import {useNavigate} from 'react-router-dom'
import useDebounce from '../hooks/useDebounce';
import Swal from 'sweetalert2'

const TodoApp = ({onLogout ,darkMode, toggleDarkMode }) => {
  // State management
  const [filters, setfilters]= useState({
    timeframe: "all",
    priority:{
        high: false,
        medium: false,
        low: false
                }
  })

const [showAddForm, setShowAddForm] = useState(false)
const [editingTodo, setEditingTodo] = useState(false)
const [searchTerm,setSearchTerm] = useState("")
const [todoForm, setTodoForm] =useState({
    title: "",
    deadline: "",
    priority: "high"
})

const refer= useRef()
const navigate=useNavigate()
const [todos, setTodos]= useState([])
const [filteredAndSortedTodos, setFilteredAndSortedTodos]= useState([])
const debouncedValue= useDebounce(searchTerm,300)

async function setData(){
    try{
        const response= await axiosInstance.get('/getAll')
        setTodos(response.data.AllTodos)
    }catch(e){
        toast.error("Error Occured. Please try again!")

    }
}


useEffect(()=>{

let filteredData=todos

if(debouncedValue!=""){
filteredData=filteredData.filter((todo)=>todo.title.toLowerCase().includes(debouncedValue.toLowerCase()))

}

if(filters.timeframe!="all"){
filteredData= filteredData.filter((todo)=>{
const deadlineStatus=getDeadlineStatus(todo.deadline)
return deadlineStatus.type==filters.timeframe

})
}


if(filters.priority.high || filters.priority.medium || filters.priority.low){
filteredData=filteredData.filter((todo)=>{
return ((filters.priority.high && todo.priority=="high") || (filters.priority.medium && todo.priority=="medium") || (filters.priority.low && todo.priority=="low"))
})
}

filteredData.sort((todo1,todo2)=> new Date(todo1.deadline) - new Date(todo2.deadline) )

setFilteredAndSortedTodos(filteredData)

},[todos,filters,debouncedValue])


useEffect(()=>{
  const token=localStorage.getItem("token")
    if(!token){
        toast.error("Please sign in first.")
        navigate('/',{replace: true})
    }else{
      setData()
    }

return function(){
    setTodos([])
}

},[])





async function handleSubmitTodo(e){
    e.preventDefault()
if(todoForm.title!="" && todoForm.deadline!="" && todoForm.priority!=""){
    
if(!editingTodo){
    const toastId=toast.loading("Adding todo...")
    try{
const response= await axiosInstance.post('/create', todoForm);
        toast.success("Todo created successfully!",{id: toastId})
        setShowAddForm(!showAddForm)
        setData()
        setTodoForm({
            title:"",
            deadline:"",
            priority: "high"
        })
    }catch(e){
        toast.error("Error Occured. Please try again!",{id: toastId})

    }

}else{
        const toastId=toast.loading("Updating todo...")
    try{
const response= await axiosInstance.put('/update', todoForm);
        toast.success("Todo updated successfully!",{id: toastId})
        setShowAddForm(!showAddForm)
        setEditingTodo(false)
        setData()
        setTodoForm({
            title:"",
            deadline:"",
            priority: "high"
        })
    }catch(e){
        toast.error("Error Occured. Please try again!",{id: toastId})

    }
}


} else{
    toast.error("Please fill in all required fields!")
}
}


function getDeadlineStatus(deadline) {
  if (!deadline) return null;

  const today = new Date();
  const deadlineDate = new Date(deadline);

  today.setHours(0, 0, 0, 0);
  deadlineDate.setHours(0, 0, 0, 0);

  if (deadlineDate < today) {
    return { type: 'overdue', text: 'Overdue', color: 'text-red-600 dark:text-red-400' };
  } else if (deadlineDate.getTime() === today.getTime()) {
    return { type: 'today', text: 'Due Today', color: 'text-yellow-600 dark:text-yellow-400' };
  } else if (deadlineDate <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)) {
    return { type: 'week', text: 'Upcoming', color: 'text-blue-600 dark:text-blue-400' };
  } else {
    return { type: 'upcoming', text: 'Future Task', color: 'text-green-600 dark:text-green-400' };
  }
}




function handleTimeFilterChange(value){
setfilters((prev)=> ({
    ...prev,
    timeframe: value
}) )
}

function handlePriorityFilterChange(key,value){

setfilters((prev)=>({
    ...prev,
    priority : {
        ...prev["priority"],
        [key]: value
    }
}))

}

function clearAllFilters(){
setfilters({
    timeframe: "all",
    priority: {
        high: false,
        medium: false,
        low: false
    }
})

}




const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'from-red-100 to-red-200 text-red-800 dark:from-red-900 dark:to-red-800 dark:text-red-200';
      case 'medium': return 'from-yellow-100 to-yellow-200 text-yellow-800 dark:from-yellow-900 dark:to-yellow-800 dark:text-yellow-200';
      case 'low': return 'from-green-100 to-green-200 text-green-800 dark:from-green-900 dark:to-green-800 dark:text-green-200';
      default: return 'from-gray-100 to-gray-200 text-gray-800 dark:from-gray-900 dark:to-gray-800 dark:text-gray-200';
    }
  };

function startEditTodo(todo){
setEditingTodo(true)
setShowAddForm(true)

setTimeout(()=>{
  refer.current?.scrollIntoView({behavior: 'smooth', block: 'start'})
},100)

setTodoForm((prev)=>({
    ...prev,
    todoId: todo._id
}))

}

function cancelEdit(){
setEditingTodo(false)
setShowAddForm(false)
setTodoForm((prev)=>({
    ...prev,
    todoId:""
}))

}

async function deleteTodo(todo){
const toastId= toast.loading("Deleting todo...")
try{
const response= await axiosInstance.delete(`/delete/${todo._id}`)
toast.success("Todo deleted successfully!",{id: toastId})
setData()
}catch(e){
         toast.error("Error Occured. Please try again!",{id: toastId})
}

}

 function deleteAllTodos(){
  Swal.fire({
title: "Are you sure to delete all todos?",
text: "This action cannot be undone!",
icon: 'warning',
showCancelButton: true,
confirmButtonText: "Yes"
  }).then((result)=>{
        if(result.isConfirmed){

       async function doAllDeletion(){
             const toastId=toast.loading("Deleting all todos...")
    try{
        const response= await axiosInstance.delete('/deleteAll')
        toast.success("All todos deleted successfully!",{id: toastId})
        setData()
    }catch(e){
        toast.error("Error Occured. Please try again!",{id: toastId})
    }

  }
  doAllDeletion()


        }

  })

}




  return (
         <div className={darkMode ? 'dark' : ''}>
            <div className="absolute top-6 right-6 z-10">
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
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-900 transition-colors duration-300">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-blue-300 to-indigo-400 rounded-full mix-blend-multiply filter blur-2xl opacity-10 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-r from-purple-300 to-pink-400 rounded-full mix-blend-multiply filter blur-2xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-300 to-blue-400 rounded-full mix-blend-multiply filter blur-2xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 shadow-lg border-b border-white/20 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                TaskFlow
              </h1>
              <div className="ml-4 text-sm text-gray-600 dark:text-gray-400">
                {filteredAndSortedTodos.length} of {todos.length} todos
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Dark Mode Toggle */}
              <button 
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm hover:bg-white/70 dark:hover:bg-gray-600/70 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                {darkMode ? <Sun className="text-yellow-500" size={20} /> : <Moon className="text-gray-600" size={20} />}
              </button>
              {/* User Menu */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Welcome, {localStorage.getItem("username")}
                </span>
                <button 
                  onClick={onLogout}
                  className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium hover:underline transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Sidebar - Filters (Left Side) */}
          <div className="lg:col-span-2">
            <div className="backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-8 sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Filters
                </h2>
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors font-medium hover:underline"
                >
                  Clear All
                </button>
              </div>
              
              {/* Timeframe Filter */}
              <div className="mb-8">
                <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-4">Timeframe</h3>
                <div className="space-y-3">
                  {[
                    { value: 'all', label: 'All Todos' },
                    { value: 'today', label: 'Due Today' },
                    { value: 'week', label: 'This Week' },
                    { value: 'overdue', label: 'Overdue' },
                    { value: 'upcoming', label: 'Upcoming' }
                  ].map(option => (
                    <label key={option.value} className="flex items-center group cursor-pointer">
                      <input 
                        type="radio" 
                        name="timeframe"
                        checked={filters.timeframe === option.value}
                        onChange={() => handleTimeFilterChange(option.value)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-all duration-200 w-4 h-4" 
                      />
                      <span className="ml-3 text-base text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors font-medium">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Priority Filter */}
              <div className="mb-8">
                <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-4">Priority</h3>
                <div className="space-y-3">
                  {[
                    { key: 'high', label: 'High Priority', color: 'text-red-600 dark:text-red-400' },
                    { key: 'medium', label: 'Medium Priority', color: 'text-yellow-600 dark:text-yellow-400' },
                    { key: 'low', label: 'Low Priority', color: 'text-green-600 dark:text-green-400' }
                  ].map(priority => (
                    <label key={priority.key} className="flex items-center group cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={filters.priority[priority.key]}
                        onChange={(e) => handlePriorityFilterChange( priority.key, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-all duration-200 w-4 h-4" 
                      />
                      <span className={`ml-3 text-base ${priority.color} group-hover:opacity-80 transition-opacity font-medium`}>
                        {priority.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Delete All Button */}
              {todos.length > 0 && (
                <button 
                  onClick={deleteAllTodos}
                  className="w-full py-3 px-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 text-base"
                >
                  <Trash2 size={18} className="inline mr-2" />
                  Delete All Todos
                </button>
              )}
            </div>
          </div>

          {/* Main Content (Right Side) */}
          <div className="lg:col-span-3">
            {/* Search and Add Todo */}
            <div className="backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-6 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1 group">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600 dark:text-gray-300 group-focus-within:text-blue-500 transition-colors" size={22} />
                  <input
                    type="text"
                    placeholder="Search todos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:bg-white/70 dark:hover:bg-gray-700/70"
                  />
                </div>
                {/* Add Todo Button */}
                <button 
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all duration-300 flex items-center shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                >
                  <Plus size={20} className="mr-2" />
                  Add Todo
                </button>
              </div>
            </div>

            {/* Add/Edit Todo Form */}
            {showAddForm && (
              <div ref={refer} className="backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {editingTodo ? 'Edit Todo' : 'Add New Todo'}
                </h3>
                <form onSubmit={handleSubmitTodo} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      placeholder="Enter todo title..."
                      value={todoForm.title}
                      onChange={(e) => setTodoForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:bg-white/70 dark:hover:bg-gray-700/70"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Deadline
                      </label>
                      <div className="relative group">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 dark:text-gray-300 group-focus-within:text-blue-500 transition-colors" size={20} />
                        <input
                          type="date"
                          value={todoForm.deadline}
                          onChange={(e) => setTodoForm(prev => ({ ...prev, deadline: e.target.value }))}
                          required
                          className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:bg-white/70 dark:hover:bg-gray-700/70"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Priority
                      </label>
                      <div className="relative group">
                        <Flag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 dark:text-gray-300 group-focus-within:text-blue-500 transition-colors" size={20} />
                        <select 
                          value={todoForm.priority}
                          onChange={(e) => setTodoForm(prev => ({ ...prev, priority: e.target.value }))}
                          required
                          className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:bg-white/70 dark:hover:bg-gray-700/70"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors hover:underline"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                    >
                      {editingTodo ? 'Update Todo' : 'Add Todo'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Todo List */}
            <div className="space-y-4">
              {filteredAndSortedTodos.length === 0 ? (
                /* Empty State */
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4 animate-bounce">
                    <Calendar size={64} className="mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {todos.length === 0 ? 'No todos yet' : 'No todos match your filters'}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    {todos.length === 0 
                      ? 'Get started by creating your first todo' 
                      : 'Try adjusting your search or filters'
                    }
                  </p>
                  {todos.length === 0 && (
                    <button 
                      onClick={() => setShowAddForm(true)}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                    >
                      <Plus size={20} className="inline mr-2" />
                      Add Your First Todo
                    </button>
                  )}
                </div>
              ) : (
                /* Todo Items */
                filteredAndSortedTodos.map((todo) => {
                  const deadlineStatus = getDeadlineStatus(todo.deadline);
                  
                  return (
                    <div 
                      key={todo._id} 
                      className="backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-6 transition-all duration-300 hover:shadow-2xl transform hover:scale-[1.02]"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                            {todo.title}
                          </h3>
                          <div className="flex items-center flex-wrap gap-4">
                              <div className={`flex items-center text-sm ${
                                deadlineStatus ? deadlineStatus.color : 'text-gray-500 dark:text-gray-400'
                              }`}>
                                <Calendar size={16} className="mr-1" />
                                {new Date(todo.deadline).toLocaleDateString()}       
                                  <span className="ml-2 font-medium">
                                    ({deadlineStatus.text})
                                  </span>
                              </div>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r ${getPriorityColor(todo.priority)} shadow-sm`}>
                              {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)} Priority
                            </span>
                            {deadlineStatus?.type === 'overdue' && (
                              <div className="flex items-center text-red-600 dark:text-red-400">
                                <AlertTriangle size={16} className="mr-1" />
                                <span className="text-xs font-medium">Overdue</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <button 
                            onClick={(e) => startEditTodo(todo)}
                            className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 transform hover:scale-110 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button 
                            onClick={(e) => deleteTodo(todo)}
                            className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 transform hover:scale-110 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
     </div>
  );
};

export default TodoApp;