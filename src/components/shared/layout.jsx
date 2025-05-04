import Sidebar from "./sidebar"

const Layout = ({ children, userRole }) => {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      <Sidebar userRole={userRole} />
      <main className="flex-1 overflow-y-auto p-4 md:mt-0 mt-[60px]">
        {children}
      </main>
    </div>
  )
}

export default Layout