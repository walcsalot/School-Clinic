"use client"

import { useState, useEffect } from "react"
import { collection, query, where, getDocs } from "firebase/firestore"
import { auth, db } from "../../config/firebase";  // Correct relative path

const EmployeeHistory = () => {
  const [visitHistory, setVisitHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVisitHistory()
  }, [])

  const fetchVisitHistory = async () => {
    try {
      const user = auth.currentUser
      if (!user) return

      // First get the employee document to get the ID
      const employeesRef = collection(db, "employees")
      const employeeQuery = query(employeesRef, where("uid", "==", user.uid))
      const employeeSnapshot = await getDocs(employeeQuery)

      if (employeeSnapshot.empty) {
        setLoading(false)
        return
      }

      const employeeDoc = employeeSnapshot.docs[0]
      const employeeId = employeeDoc.id

      // Now fetch visit history
      const visitsRef = collection(db, "visits")
      const visitsQuery = query(visitsRef, where("employeeId", "==", employeeId))
      const visitsSnapshot = await getDocs(visitsQuery)

      const history = visitsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate() || new Date(),
      }))

      // Sort by date (newest first)
      history.sort((a, b) => b.date - a.date)

      setVisitHistory(history)
    } catch (error) {
      console.error("Error fetching visit history:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex h-full items-center justify-center p-6">Loading...</div>
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Visit History</h1>

      {visitHistory.length === 0 ? (
        <div className="rounded-lg bg-white p-8 text-center shadow-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mx-auto mb-4 h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="mb-2 text-xl font-medium">No Visit History</h2>
          <p className="text-gray-600">You don't have any recorded visits to the clinic yet.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Reason for Visit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Diagnosis
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Treatment
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {visitHistory.map((visit) => (
                <tr key={visit.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4">{visit.date.toLocaleDateString()}</td>
                  <td className="px-6 py-4">{visit.reason}</td>
                  <td className="px-6 py-4">{visit.diagnosis || "N/A"}</td>
                  <td className="px-6 py-4">{visit.treatment || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default EmployeeHistory
