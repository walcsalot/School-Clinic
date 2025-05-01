"use client"

import { useState, useEffect } from "react"
import { collection, query, where, getDocs } from "firebase/firestore"
import { auth, db } from "../../config/firebase";  // Correct relative path

const EmployeeDashboard = () => {
  const [employeeData, setEmployeeData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const user = auth.currentUser
        if (!user) return

        // Query employees collection to find the document with matching UID
        const employeesRef = collection(db, "employees")
        const q = query(employeesRef, where("uid", "==", user.uid))
        const querySnapshot = await getDocs(q)

        if (!querySnapshot.empty) {
          const employeeDoc = querySnapshot.docs[0]
          setEmployeeData({
            id: employeeDoc.id,
            ...employeeDoc.data(),
          })
        }
      } catch (error) {
        console.error("Error fetching employee data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchEmployeeData()
  }, [])

  if (loading) {
    return <div className="flex h-full items-center justify-center p-6">Loading...</div>
  }

  if (!employeeData) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600">Employee Data Not Found</h2>
          <p className="mt-2 text-gray-600">Please contact the administrator.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Employee Dashboard</h1>

      <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold">Welcome, {employeeData.firstName}!</h2>
        <p className="text-gray-600">
          This is your clinic dashboard. Here you can view your profile information and visit history.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-lg font-semibold">Your Information</h2>
          <div className="space-y-2">
            <p>
              <span className="font-medium">ID Number:</span> {employeeData.idNumber}
            </p>
            <p>
              <span className="font-medium">Name:</span> {employeeData.firstName} {employeeData.middleName}{" "}
              {employeeData.lastName}
            </p>
            <p>
              <span className="font-medium">Age:</span> {employeeData.age}
            </p>
            <p>
              <span className="font-medium">Gender:</span> {employeeData.gender}
            </p>
            <p>
              <span className="font-medium">Department:</span> {employeeData.department}
            </p>
            <p>
              <span className="font-medium">Email:</span> {employeeData.email}
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-lg font-semibold">Recent Clinic Visit</h2>
          {employeeData.reasonsOfVisit ? (
            <div>
              <p>
                <span className="font-medium">Reason:</span> {employeeData.reasonsOfVisit}
              </p>
              <p className="mt-4 text-sm text-gray-500">
                If you need to update your information or have questions about your visit, please contact the clinic
                administrator.
              </p>
            </div>
          ) : (
            <p className="text-gray-600">No recent clinic visits recorded.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default EmployeeDashboard
