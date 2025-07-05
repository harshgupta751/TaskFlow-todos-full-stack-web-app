
function Footer({darkMode}){
return (
    <div className={darkMode? "dark" : ""}>
    <footer className="w-full bg-gray-200 dark:bg-gray-950 text-gray-800 dark:text-gray-200 py-4 px-6 shadow-inner">
      <div className="flex flex-col md:flex-row justify-between items-center text-sm">
        <p className="mb-2 md:mb-0">&copy; {new Date().getFullYear()} TodoFlow. All rights reserved.</p>
        <p>
          Created by <span className="font-semibold text-blue-600 dark:text-blue-400">Harsh Gupta</span>
        </p>
      </div>
    </footer>
    </div>
)

}

export default Footer