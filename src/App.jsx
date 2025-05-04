"use client"

import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from "react-router-dom"
import { onAuthStateChanged } from "firebase/auth"
import { collection, query, where, getDocs } from "firebase/firestore"
import { auth, db } from "./config/firebase" // Ensure this path is correct

// CSS
// import "./css/main.css" // Changed to lowercase 'css'
import './index.css';
// Auth Components
import Choosing from "./components/auth/choosing"
import Login from "./components/auth/login"

// Layout Component
import Layout from "./components/shared/layout"

// Admin Components
import AdminDashboard from "./components/admin/dashboard"
import StudentList from "./components/admin/student-list"
import EmployeeList from "./components/admin/employee-list"
import StudentHistoryAdmin from "./components/admin/student-history"
import EmployeeHistoryAdmin from "./components/admin/employee-history"

// Student Components
import StudentDashboard from "./components/student/dashboard"
import StudentProfile from "./components/student/profile"
import StudentHistory from "./components/student/history"

// Employee Components
import EmployeeDashboard from "./components/employee/dashboard"
import EmployeeProfile from "./components/employee/profile"
import EmployeeHistory from "./components/employee/history"

function App() {
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser)

        // Get user role from Firestore
        try {
          const usersRef = collection(db, "users")
          const q = query(usersRef, where("uid", "==", currentUser.uid))
          const querySnapshot = await getDocs(q)

          if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data()
            if (userData.role) {
              setUserRole(userData.role)
            } else {
              // Handle missing role gracefully without console error
              setUserRole(null)
            }
          } else {
            // If user document doesn't exist, reset role
            setUserRole(null)
          }
        } catch (error) {
          console.error("Error fetching user role:", error)
          setUserRole(null)
        }
      } else {
        setUser(null)
        setUserRole(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Protected route component
  const ProtectedRoute = ({ children, allowedRole }) => {
    if (loading)
      return (
        <div className="loading-screen">
          <p>Loading...</p>
        </div>
      )

    if (!user) return <Navigate to="/" replace />

    if (allowedRole && userRole !== allowedRole) {
      return <Navigate to={`/${userRole || ""}`} replace />
    }

    return children
  }

  // Login route wrapper component to handle role parameter
  const LoginRouteWrapper = () => {
    const { role } = useParams()

    // Validate role parameter
    const validRoles = ["admin", "student", "employee"]
    const validRole = validRoles.includes(role) ? role : null

    if (!validRole) {
      return <Navigate to="/" replace />
    }

    if (user) {
      return <Navigate to={`/${userRole || ""}`} replace />
    }

    return <Login setUser={setUser} setUserRole={setUserRole} role={validRole} />
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={!user ? <Choosing /> : <Navigate to={`/${userRole || ""}`} replace />} />
        <Route path="/login/:role" element={<LoginRouteWrapper />} />

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRole="admin">
              <Layout userRole={userRole}>
                <AdminDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/students"
          element={
            <ProtectedRoute allowedRole="admin">
              <Layout userRole={userRole}>
                <StudentList />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/employees"
          element={
            <ProtectedRoute allowedRole="admin">
              <Layout userRole={userRole}>
                <EmployeeList />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/student-history"
          element={
            <ProtectedRoute allowedRole="admin">
              <Layout userRole={userRole}>
                <StudentHistoryAdmin />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/employee-history"
          element={
            <ProtectedRoute allowedRole="admin">
              <Layout userRole={userRole}>
                <EmployeeHistoryAdmin />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Student routes */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRole="student">
              <Layout userRole={userRole}>
                <StudentDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/profile"
          element={
            <ProtectedRoute allowedRole="student">
              <Layout userRole={userRole}>
                <StudentProfile />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/history"
          element={
            <ProtectedRoute allowedRole="student">
              <Layout userRole={userRole}>
                <StudentHistory />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Employee routes */}
        <Route
          path="/employee"
          element={
            <ProtectedRoute allowedRole="employee">
              <Layout userRole={userRole}>
                <EmployeeDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee/profile"
          element={
            <ProtectedRoute allowedRole="employee">
              <Layout userRole={userRole}>
                <EmployeeProfile />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee/history"
          element={
            <ProtectedRoute allowedRole="employee">
              <Layout userRole={userRole}>
                <EmployeeHistory />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
