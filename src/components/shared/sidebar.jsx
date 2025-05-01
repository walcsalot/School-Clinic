"use client"

import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { signOut } from "firebase/auth"
import { auth } from "../../config/firebase" // Correct relative path
import "../../Css/sidebar.css"

const Sidebar = ({ userRole }) => {
  const [isOpen, setIsOpen] = useState(true)
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await signOut(auth)
      navigate("/")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const adminLinks = [
    { path: "/admin", label: "Dashboard" },
    { path: "/admin/students", label: "Student List" },
    { path: "/admin/employees", label: "Employee List" },
    { path: "/admin/student-history", label: "Student History" },
    { path: "/admin/employee-history", label: "Employee History" },
  ]

  const studentLinks = [
    { path: "/student", label: "Dashboard" },
    { path: "/student/profile", label: "My Profile" },
    { path: "/student/history", label: "Visit History" },
  ]

  const employeeLinks = [
    { path: "/employee", label: "Dashboard" },
    { path: "/employee/profile", label: "My Profile" },
    { path: "/employee/history", label: "Visit History" },
  ]

  const links = userRole === "admin" ? adminLinks : userRole === "student" ? studentLinks : employeeLinks

  return (
    <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
      <div className="sidebar-header">
        {isOpen ? <h2>School Clinic</h2> : <h2>SC</h2>}
        <button onClick={() => setIsOpen(!isOpen)} className="toggle-btn">
          {isOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="icon" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="icon" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </div>

      <div className="sidebar-content">
        <div className="role-label">
          <p className={!isOpen ? "hidden" : ""}>{userRole.charAt(0).toUpperCase() + userRole.slice(1)} Menu</p>
        </div>

        <nav className="sidebar-nav">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link ${location.pathname === link.path ? "active" : ""}`}
            >
              <span className={!isOpen ? "hidden" : ""}>{link.label}</span>
            </Link>
          ))}
        </nav>

        <div className="logout-container">
          <button onClick={handleLogout} className="logout-btn">
            <svg xmlns="http://www.w3.org/2000/svg" className="icon" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            {isOpen && <span>Logout</span>}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
