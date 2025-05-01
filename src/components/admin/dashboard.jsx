"use client"

import { useState, useEffect } from "react"
import { collection, getDocs } from "firebase/firestore"
import { auth, db } from "../../config/firebase";  // Correct relative path
import "../../Css/dashboard.css"

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalEmployees: 0,
    recentVisits: 0,
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const studentsSnapshot = await getDocs(collection(db, "students"))
        const employeesSnapshot = await getDocs(collection(db, "employees"))

        // Count documents where visit date is within the last 7 days
        const now = new Date()
        const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7))

        let recentVisitsCount = 0

        // Count recent student visits
        studentsSnapshot.forEach((doc) => {
          const data = doc.data()
          if (data.lastVisit && new Date(data.lastVisit.toDate()) >= sevenDaysAgo) {
            recentVisitsCount++
          }
        })

        // Count recent employee visits
        employeesSnapshot.forEach((doc) => {
          const data = doc.data()
          if (data.lastVisit && new Date(data.lastVisit.toDate()) >= sevenDaysAgo) {
            recentVisitsCount++
          }
        })

        setStats({
          totalStudents: studentsSnapshot.size,
          totalEmployees: employeesSnapshot.size,
          recentVisits: recentVisitsCount,
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>

      <div className="stats-container">
        <div className="stat-card students">
          <h2>Total Students</h2>
          <p className="stat-value">{stats.totalStudents}</p>
        </div>

        <div className="stat-card employees">
          <h2>Total Employees</h2>
          <p className="stat-value">{stats.totalEmployees}</p>
        </div>

        <div className="stat-card visits">
          <h2>Recent Clinic Visits (7 days)</h2>
          <p className="stat-value">{stats.recentVisits}</p>
        </div>
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <button className="btn-add-student">Add New Student</button>
          <button className="btn-add-employee">Add New Employee</button>
          <button className="btn-view-history">View Visit History</button>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
