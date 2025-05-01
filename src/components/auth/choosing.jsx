"use client"

import { useNavigate } from "react-router-dom"
import "../../Css/choosing.css";

const Choosing = ({ setSelectedRole }) => {
  const navigate = useNavigate()

  const handleRoleSelect = (role) => {
    setSelectedRole(role)
    navigate(`/login/${role}`)
  }

  return (
    <div className="choosing-container">
      <div className="choosing-card">
        <div className="choosing-header">
          <h1>School Clinic Response System</h1>
          <p>Please select your role to continue</p>
        </div>

        <div className="role-options">
          {/* Admin Option */}
          <div className="role-card" onClick={() => handleRoleSelect("admin")}>
            <div className="role-icon admin-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h2>Admin</h2>
            <p>Manage students, employees, and clinic operations</p>
          </div>

          {/* Student Option */}
          <div className="role-card" onClick={() => handleRoleSelect("student")}>
            <div className="role-icon student-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h2>Student</h2>
            <p>Access your clinic records and manage your profile</p>
          </div>

          {/* Employee Option */}
          <div className="role-card" onClick={() => handleRoleSelect("employee")}>
            <div className="role-icon employee-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2>Employee</h2>
            <p>Access your clinic records and manage your profile</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Choosing
